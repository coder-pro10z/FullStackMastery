using InterviewPrepApp.Domain.Entities;
using InterviewPrepApp.Domain.Enums;
using InterviewPrepApp.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using System.Text.Json;
using System.Threading.Channels;
using InterviewPrepApp.Application.DTOs;
using InterviewPrepApp.Application.Interfaces;

namespace InterviewPrepApp.Infrastructure.Services;

/// <summary>
/// Background hosted service that processes import jobs from the in-process channel.
/// Reads: ImportJob from DB, extracts Excel rows, upserts in batches of 500.
/// </summary>
public sealed class ImportBackgroundWorker : BackgroundService
{
    private const int BatchSize = 500;

    private readonly ChannelReader<Guid> _channel;
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly ILogger<ImportBackgroundWorker> _logger;

    public ImportBackgroundWorker(
        ChannelReader<Guid> channel,
        IServiceScopeFactory scopeFactory,
        ILogger<ImportBackgroundWorker> logger)
    {
        _channel = channel;
        _scopeFactory = scopeFactory;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("ImportBackgroundWorker started.");

        await foreach (var jobId in _channel.ReadAllAsync(stoppingToken))
        {
            try
            {
                await ProcessJobAsync(jobId, stoppingToken);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unhandled error processing import job {JobId}", jobId);
            }
        }
    }

    private async Task ProcessJobAsync(Guid jobId, CancellationToken ct)
    {
        using var scope = _scopeFactory.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

        var job = await db.ImportJobs.FirstOrDefaultAsync(j => j.Id == jobId, ct);
        if (job == null) return;

        job.Status = ImportJobStatus.InProgress;
        job.StartedAtUtc = DateTime.UtcNow;
        await db.SaveChangesAsync(ct);

        _logger.LogInformation("import.job.started jobId={JobId} type={Type} fileSize={Size}", job.Id, job.Type, job.FileSizeBytes);

        if (!File.Exists(job.TempFilePath))
        {
            job.Status = ImportJobStatus.Failed;
            await db.SaveChangesAsync(ct);
            return;
        }

        var allErrors = new List<RowImportErrorDto>();

        try
        {
            if (job.Type == ImportJobType.Question)
            {
                await ProcessQuestionJobAsync(db, job, allErrors, ct);
            }
            else if (job.Type == ImportJobType.Quiz)
            {
                await ProcessQuizJobAsync(db, job, allErrors, ct);
            }
            else if (job.Type == ImportJobType.StudyGuide)
            {
                await ProcessStudyGuideJobAsync(db, job, allErrors, ct);
            }
            else
            {
                allErrors.Add(new RowImportErrorDto
                {
                    Message = $"Unsupported import job type '{job.Type}'."
                });
                job.Status = ImportJobStatus.Failed;
            }
        }
        catch (Exception ex)
        {
            allErrors.Add(new RowImportErrorDto
            {
                Message = $"Unhandled import error: {ex.Message}"
            });
            job.Status = ImportJobStatus.Failed;
            _logger.LogError(ex, "Import job {JobId} failed during processing", job.Id);
        }
        finally
        {
            // Clean up temp file
            try { File.Delete(job.TempFilePath); } catch { }
        }

        if (job.Status != ImportJobStatus.Failed)
        {
            job.Status = job.FailedRows == 0 ? ImportJobStatus.Completed : ImportJobStatus.PartiallyCompleted;
        }

        job.ErrorSummaryJson = allErrors.Count > 0
            ? JsonSerializer.Serialize(allErrors)
            : null;
        job.RetryPayloadJson = allErrors.Count > 0
            ? JsonSerializer.Serialize(allErrors.Where(e => e.ExternalId != null).Select(e => e.ExternalId).Distinct())
            : null;
        job.CompletedAtUtc = DateTime.UtcNow;
        await db.SaveChangesAsync(ct);

        _logger.LogInformation("import.job.completed jobId={JobId} processed={P} failed={F}", job.Id, job.ProcessedRows, job.FailedRows);
    }

    private async Task ProcessQuestionJobAsync(ApplicationDbContext db, ImportJob job, List<RowImportErrorDto> allErrors, CancellationToken ct)
    {
        var extractor = new ExcelExtractionService(db);
        var validator = new QuestionImportValidator(db);

        ExcelExtractionResult extractResult;
        await using (var fs = File.OpenRead(job.TempFilePath))
        {
            extractResult = extractor.ExtractImportRows(fs);
        }

        if (extractResult.IsFatalError)
        {
            allErrors.Add(new RowImportErrorDto { Message = extractResult.FatalErrorMessage ?? "Fatal extraction error." });
            return;
        }

        // Add parser diagnostics as warnings/errors
        foreach (var diag in extractResult.Diagnostics)
        {
            allErrors.Add(new RowImportErrorDto { Row = diag.RowNumber, Message = diag.Message });
        }

        job.TotalRows = extractResult.Rows.Count;
        var existingFingerprints = new HashSet<string>(StringComparer.Ordinal);
        
        // Load existing fingerprints (we need QuestionText and Role to match computation)
        var allQuestions = await db.Questions.AsNoTracking().Select(q => new { q.QuestionText, q.Role }).ToListAsync(ct);
        foreach (var q in allQuestions)
        {
            existingFingerprints.Add(QuestionImportValidator.ComputeFingerprint(q.QuestionText, q.Role));
        }

        foreach (var batch in extractResult.Rows.Chunk(BatchSize))
        {
            var validateResult = await validator.ValidateAsync(batch.ToList(), job.DefaultCategoryId, existingFingerprints, ct);
            
            foreach (var err in validateResult.Errors) allErrors.Add(new RowImportErrorDto { Message = err });
            foreach (var wrn in validateResult.Warnings) allErrors.Add(new RowImportErrorDto { Message = wrn });

            job.FailedRows += validateResult.Failed + validateResult.Skipped;

            var isInMemory = db.Database.ProviderName?.Contains("InMemory") == true;
            await using var tx = isInMemory ? null : await db.Database.BeginTransactionAsync(ct);
            int batchProcessed = 0, batchFailed = 0;

            foreach (var record in validateResult.ValidRecords)
            {
                try
                {
                    db.Questions.Add(new Question
                    {
                        QuestionText = record.QuestionText,
                        AnswerText = record.AnswerMarkdown,
                        Difficulty = record.Difficulty,
                        Role = record.Role,
                        CategoryId = record.CategoryId
                    });
                    batchProcessed++;
                }
                catch (Exception ex)
                {
                    batchFailed++;
                    allErrors.Add(new RowImportErrorDto { Message = $"DB error on valid row: {ex.Message}" });
                }
            }

            await db.SaveChangesAsync(ct);
            await db.SaveChangesAsync(ct);
            if (tx != null) await tx.CommitAsync(ct);

            job.ProcessedRows += batchProcessed;
            job.FailedRows += batchFailed;
            job.LastProcessedBatch++;
            await db.SaveChangesAsync(ct);
        }
    }

    private async Task ProcessQuizJobAsync(ApplicationDbContext db, ImportJob job, List<RowImportErrorDto> allErrors, CancellationToken ct)
    {
        var extractor = new QuizExcelExtractionService();
        List<ImportQuizRowDto> rows;
        List<RowImportErrorDto> extractErrors;

        await using (var fs = File.OpenRead(job.TempFilePath))
        {
            (rows, extractErrors) = extractor.Extract(fs);
        }

        allErrors.AddRange(extractErrors);
        job.TotalRows = rows.Count + extractErrors.Count;
        job.FailedRows += extractErrors.Count;

        // Load existing category map and ExternalId set
        // var existingIds = await db.QuizQuestions.AsNoTracking()
        //     .Select(q => q.ExternalId)
        //     .ToHashSetAsync(ct);
        var existingIds = (await db.QuizQuestions.AsNoTracking()
            .Select(q => q.ExternalId)
            .ToListAsync(ct))
            .ToHashSet();

        var categories = await db.Categories.AsNoTracking().ToListAsync(ct);
        var categoryByPath = BuildCategoryPathMap(categories);

        foreach (var batch in rows.Chunk(BatchSize))
        {
            var isInMemory = db.Database.ProviderName?.Contains("InMemory") == true;
            await using var tx = isInMemory ? null : await db.Database.BeginTransactionAsync(ct);
            int batchProcessed = 0, batchFailed = 0;

            foreach (var row in batch)
            {
                try
                {
                    var catId = ResolveCategory(row.Category, categoryByPath, job.DefaultCategoryId);
                    var difficulty = ParseDifficulty(row.Difficulty);

                    if (existingIds.Contains(row.ExternalId!))
                    {
                        // Update
                        var existing = await db.QuizQuestions.FirstAsync(q => q.ExternalId == row.ExternalId!, ct);
                        existing.QuestionText = row.QuestionText;
                        existing.OptionA = row.OptionA;
                        existing.OptionB = row.OptionB;
                        existing.OptionC = row.OptionC;
                        existing.OptionD = row.OptionD;
                        existing.CorrectAnswer = row.CorrectAnswer;
                        existing.Explanation = row.Explanation;
                        existing.Role = row.Role;
                        existing.Tags = row.Tags;
                        existing.Difficulty = difficulty;
                        existing.CategoryId = catId;
                        existing.UpdatedAtUtc = DateTime.UtcNow;
                    }
                    else
                    {
                        db.QuizQuestions.Add(new QuizQuestion
                        {
                            ExternalId = row.ExternalId!,
                            QuestionText = row.QuestionText,
                            OptionA = row.OptionA,
                            OptionB = row.OptionB,
                            OptionC = row.OptionC,
                            OptionD = row.OptionD,
                            CorrectAnswer = row.CorrectAnswer,
                            Explanation = row.Explanation,
                            Role = row.Role,
                            Tags = row.Tags,
                            Difficulty = difficulty,
                            CategoryId = catId
                        });
                        existingIds.Add(row.ExternalId!);
                    }

                    batchProcessed++;
                }
                catch (Exception ex)
                {
                    batchFailed++;
                    allErrors.Add(new RowImportErrorDto
                    {
                        ExternalId = row.ExternalId,
                        Message = $"DB error: {ex.Message}"
                    });
                }
            }

            await db.SaveChangesAsync(ct);
            await db.SaveChangesAsync(ct);
            if (tx != null) await tx.CommitAsync(ct);

            job.ProcessedRows += batchProcessed;
            job.FailedRows += batchFailed;
            job.LastProcessedBatch++;
            await db.SaveChangesAsync(ct);

            _logger.LogInformation("import.job.batch.complete jobId={JobId} batch={B} processed={P} failed={F}", job.Id, job.LastProcessedBatch, batchProcessed, batchFailed);
        }
    }

    private async Task ProcessStudyGuideJobAsync(ApplicationDbContext db, ImportJob job, List<RowImportErrorDto> allErrors, CancellationToken ct)
    {
        var extractor = new StudyGuideExtractionService();
        List<ImportStudyGuideRowDto> rows;
        List<RowImportErrorDto> extractErrors;

        await using (var fs = File.OpenRead(job.TempFilePath))
        {
            (rows, extractErrors) = extractor.Extract(fs);
        }

        allErrors.AddRange(extractErrors);
        job.TotalRows = rows.Count + extractErrors.Count;
        job.FailedRows += extractErrors.Count;

        // var existingIds = await db.StudyGuideSections.AsNoTracking()
        //     .Select(s => s.ExternalId)
        //     .ToHashSetAsync(ct);

        var existingIds = (await db.StudyGuideSections.AsNoTracking()
            .Select(q => q.ExternalId)
            .ToListAsync(ct))
            .ToHashSet();
        var categories = await db.Categories.AsNoTracking().ToListAsync(ct);
        var categoryByPath = BuildCategoryPathMap(categories);

        foreach (var batch in rows.Chunk(BatchSize))
        {
            var isInMemory = db.Database.ProviderName?.Contains("InMemory") == true;
            await using var tx = isInMemory ? null : await db.Database.BeginTransactionAsync(ct);
            int batchProcessed = 0, batchFailed = 0;

            foreach (var row in batch)
            {
                try
                {
                    var catId = ResolveCategory(row.Category, categoryByPath, job.DefaultCategoryId);

                    if (existingIds.Contains(row.ExternalId!))
                    {
                        var existing = await db.StudyGuideSections.FirstAsync(s => s.ExternalId == row.ExternalId!, ct);
                        existing.Title = row.Title;
                        existing.ContentMarkdown = row.Content;
                        existing.Role = row.Role;
                        existing.Tags = row.Tags;
                        existing.DisplayOrder = row.DisplayOrder;
                        existing.CategoryId = catId;
                        existing.UpdatedAtUtc = DateTime.UtcNow;
                    }
                    else
                    {
                        db.StudyGuideSections.Add(new StudyGuideSection
                        {
                            ExternalId = row.ExternalId!,
                            Title = row.Title,
                            ContentMarkdown = row.Content,
                            Role = row.Role,
                            Tags = row.Tags,
                            DisplayOrder = row.DisplayOrder,
                            CategoryId = catId
                        });
                        existingIds.Add(row.ExternalId!);
                    }

                    batchProcessed++;
                }
                catch (Exception ex)
                {
                    batchFailed++;
                    allErrors.Add(new RowImportErrorDto
                    {
                        ExternalId = row.ExternalId,
                        Message = $"DB error: {ex.Message}"
                    });
                }
            }

            await db.SaveChangesAsync(ct);
            await db.SaveChangesAsync(ct);
            if (tx != null) await tx.CommitAsync(ct);

            job.ProcessedRows += batchProcessed;
            job.FailedRows += batchFailed;
            job.LastProcessedBatch++;
            await db.SaveChangesAsync(ct);
        }
    }

    // ── Helpers ──────────────────────────────────────────────────────────────

    private static Dictionary<string, int> BuildCategoryPathMap(List<Category> categories)
    {
        // Build a path like "backend/security/jwt" → id
        var map = new Dictionary<string, int>(StringComparer.OrdinalIgnoreCase);
        foreach (var cat in categories)
            map[cat.Name.ToLowerInvariant()] = cat.Id;
        return map;
    }

    private static int? ResolveCategory(string? path, Dictionary<string, int> pathMap, int? defaultId)
    {
        if (string.IsNullOrWhiteSpace(path)) return defaultId;
        // Try last segment of slash-delimited path
        var segments = path.Split(['/', '\\', '>'], StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);
        foreach (var seg in segments.Reverse())
        {
            if (pathMap.TryGetValue(seg.ToLowerInvariant(), out var id))
                return id;
        }
        return defaultId;
    }

    private static InterviewPrepApp.Domain.Enums.QuizQuestionDifficulty ParseDifficulty(string? val)
    {
        if (string.IsNullOrWhiteSpace(val)) return InterviewPrepApp.Domain.Enums.QuizQuestionDifficulty.Medium;
        return val.Trim().ToLowerInvariant() switch
        {
            "easy" => InterviewPrepApp.Domain.Enums.QuizQuestionDifficulty.Easy,
            "hard" => InterviewPrepApp.Domain.Enums.QuizQuestionDifficulty.Hard,
            _ => InterviewPrepApp.Domain.Enums.QuizQuestionDifficulty.Medium
        };
    }
}

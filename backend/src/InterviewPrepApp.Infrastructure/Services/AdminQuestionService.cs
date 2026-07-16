using InterviewPrepApp.Application.DTOs;
using InterviewPrepApp.Application.DTOs.Admin;
using InterviewPrepApp.Application.Interfaces;
using InterviewPrepApp.Application.Validators;
using InterviewPrepApp.Domain.Entities;
using InterviewPrepApp.Domain.Enums;
using InterviewPrepApp.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;

namespace InterviewPrepApp.Infrastructure.Services;

public class AdminQuestionService : IAdminQuestionService
{
    private readonly ApplicationDbContext _db;
    private readonly IAuditLogService _audit;
    private readonly IQuestionImportValidator _importValidator;

    public AdminQuestionService(ApplicationDbContext db, IAuditLogService audit, IQuestionImportValidator importValidator)
    {
        _db = db;
        _audit = audit;
        _importValidator = importValidator;
    }

    public async Task<PagedAdminResult<QuestionAdminDto>> GetQuestionsAsync(
        AdminQuestionFilter filter, CancellationToken ct = default)
    {
        var query = _db.Questions
            .Include(q => q.Category)
            .Include(q => q.Answer)
            .Include(q => q.QuestionTags)
            .ThenInclude(qt => qt.Tag)
            .AsNoTracking();

        // If including deleted, bypass global filter (we don't use global filter here — manual filter)
        if (!filter.IncludeDeleted)
            query = query.Where(q => !q.IsDeleted);

        if (!string.IsNullOrWhiteSpace(filter.SearchTerm))
            query = query.Where(q =>
                (q.Title != null && q.Title.Contains(filter.SearchTerm)) ||
                q.QuestionText.Contains(filter.SearchTerm));

        if (!string.IsNullOrWhiteSpace(filter.Difficulty) &&
            Enum.TryParse<Difficulty>(filter.Difficulty, true, out var diff))
            query = query.Where(q => q.Difficulty == diff);

        if (!string.IsNullOrWhiteSpace(filter.Role))
        {
            var searchRole = filter.Role.ToLower();
            query = query.Where(q => q.QuestionTags.Any(qt => qt.Tag.Name.ToLower() == searchRole));
        }

        if (filter.CategoryId.HasValue)
            query = query.Where(q => q.CategoryId == filter.CategoryId.Value);

        if (!string.IsNullOrWhiteSpace(filter.Status) &&
            Enum.TryParse<QuestionStatus>(filter.Status, true, out var status))
            query = query.Where(q => q.Status == status);

        var total = await query.CountAsync(ct);
        var data = await query
            .OrderByDescending(q => q.CreatedAt)
            .Skip((filter.Page - 1) * filter.PageSize)
            .Take(filter.PageSize)
            .ToListAsync(ct);

        return new PagedAdminResult<QuestionAdminDto>
        {
            Data = data.Select(ToDto).ToList(),
            TotalRecords = total,
            PageNumber = filter.Page,
            PageSize = filter.PageSize
        };
    }

    public async Task<QuestionAdminDto?> GetByIdAsync(int id, bool includeDeleted = false, CancellationToken ct = default)
    {
        var query = _db.Questions
            .Include(q => q.Category)
            .Include(q => q.Answer)
            .Include(q => q.QuestionTags)
            .ThenInclude(qt => qt.Tag)
            .AsNoTracking();
        if (!includeDeleted) query = query.Where(q => !q.IsDeleted);
        var q = await query.FirstOrDefaultAsync(x => x.Id == id, ct);
        return q is null ? null : ToDto(q);
    }

    public async Task<QuestionAdminDto> CreateAsync(CreateQuestionDto dto, string userId, string userEmail, CancellationToken ct = default)
    {
        var question = new Question
        {
            Title = dto.Title,
            QuestionText = dto.QuestionText,
            Difficulty = dto.Difficulty,
            CategoryId = dto.CategoryId,
            Status = dto.Status,
            CreatedAt = DateTime.UtcNow,
            CreatedByUserId = userId
        };

        _db.Questions.Add(question);
        await _db.SaveChangesAsync(ct);

        await _audit.LogAsync(userId, userEmail, "CREATED", "Question",
            question.Id.ToString(), newValues: JsonSerializer.Serialize(new { question.Title, question.QuestionText, question.Difficulty }), ct: ct);

        return await GetByIdAsync(question.Id, ct: ct) ?? ToDto(question);
    }

    public async Task<QuestionAdminDto?> UpdateAsync(int id, UpdateQuestionDto dto, string userId, string userEmail, CancellationToken ct = default)
    {
        var question = await _db.Questions.FirstOrDefaultAsync(q => q.Id == id && !q.IsDeleted, ct);
        if (question is null) return null;

        // Snapshot before update for versioning
        var nextVersion = await _db.QuestionVersions
            .Where(v => v.QuestionId == id)
            .MaxAsync(v => (int?)v.VersionNumber, ct) ?? 0;

        _db.QuestionVersions.Add(new QuestionVersion
        {
            QuestionId = id,
            VersionNumber = nextVersion + 1,
            QuestionSnapshot = JsonSerializer.Serialize(new
            {
                question.Title, question.QuestionText, question.Difficulty, question.CategoryId
            }),
            EditedByUserId = userId,
            CreatedAt = DateTime.UtcNow
        });

        var oldSnapshot = JsonSerializer.Serialize(new { question.Title, question.QuestionText });

        question.Title = dto.Title;
        question.QuestionText = dto.QuestionText;
        question.Difficulty = dto.Difficulty;
        question.CategoryId = dto.CategoryId;
        question.Status = dto.Status;
        question.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync(ct);

        await _audit.LogAsync(userId, userEmail, "EDITED", "Question", id.ToString(),
            oldValues: oldSnapshot,
            newValues: JsonSerializer.Serialize(new { dto.Title, dto.QuestionText }),
            ct: ct);

        return await GetByIdAsync(id, ct: ct);
    }

    public async Task<bool> SoftDeleteAsync(int id, string userId, string userEmail, CancellationToken ct = default)
    {
        var question = await _db.Questions.FirstOrDefaultAsync(q => q.Id == id && !q.IsDeleted, ct);
        if (question is null) return false;

        question.IsDeleted = true;
        question.DeletedAt = DateTime.UtcNow;
        question.Status = QuestionStatus.Draft;
        await _db.SaveChangesAsync(ct);

        await _audit.LogAsync(userId, userEmail, "DELETED", "Question", id.ToString(), ct: ct);
        return true;
    }

    public async Task<bool> RestoreAsync(int id, string userId, string userEmail, CancellationToken ct = default)
    {
        var question = await _db.Questions.IgnoreQueryFilters()
            .FirstOrDefaultAsync(q => q.Id == id && q.IsDeleted, ct);
        if (question is null) return false;

        question.IsDeleted = false;
        question.DeletedAt = null;
        question.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync(ct);

        await _audit.LogAsync(userId, userEmail, "RESTORED", "Question", id.ToString(), ct: ct);
        return true;
    }

    public async Task<IReadOnlyList<QuestionVersionDto>> GetVersionsAsync(int id, CancellationToken ct = default)
    {
        var versions = await _db.QuestionVersions
            .Where(v => v.QuestionId == id)
            .OrderByDescending(v => v.VersionNumber)
            .AsNoTracking()
            .ToListAsync(ct);

        return versions.Select(v => new QuestionVersionDto
        {
            Id = v.Id,
            VersionNumber = v.VersionNumber,
            QuestionSnapshot = v.QuestionSnapshot,
            AnswerSnapshot = v.AnswerSnapshot,
            EditedByUserId = v.EditedByUserId,
            CreatedAt = v.CreatedAt
        }).ToList();
    }

    public async Task<BulkImportResultDto> ImportAsync(
        IEnumerable<ImportQuestionRowDto> rows,
        int? defaultCategoryId, bool dryRun, string userId, string userEmail, CancellationToken ct = default)
    {
        // ── Build dedup fingerprint set from existing DB questions ──
        // We use ExternalId if available, falling back to QuestionText fingerprint
        var existingFingerprints = (await _db.Questions
            .AsNoTracking()
            .Select(q => new { q.ExternalId, q.QuestionText })
            .ToListAsync(ct))
            .Select(q => !string.IsNullOrWhiteSpace(q.ExternalId)
                ? q.ExternalId
                : QuestionImportValidator.ComputeFingerprint(q.QuestionText))
            .ToHashSet(StringComparer.Ordinal);

        // ── Validate all rows ──
        var rowList = rows.ToList();
        var validation = await _importValidator.ValidateAsync(rowList, defaultCategoryId, existingFingerprints, ct);

        // ── Insert valid records ──
        int inserted = validation.ValidRecords.Count(r => !r.IsUpdate);
        int updated = validation.ValidRecords.Count(r => r.IsUpdate);

        if (!dryRun && (inserted > 0 || updated > 0))
        {
            // Resolve Tags before inserting Questions
            var uniqueTagNames = validation.ValidRecords
                .SelectMany(r => r.Tags)
                .Select(t => t.Trim())
                .Where(t => !string.IsNullOrWhiteSpace(t))
                .Distinct(StringComparer.OrdinalIgnoreCase)
                .ToList();

            var existingTags = await _db.Tags
                .Where(t => uniqueTagNames.Contains(t.Name))
                .ToDictionaryAsync(t => t.Name.ToLower(), t => t, ct);

            foreach (var tagName in uniqueTagNames)
            {
                if (!existingTags.ContainsKey(tagName.ToLower()))
                {
                    var newTag = new Tag
                    {
                        Name = tagName,
                        Slug = tagName.ToLower().Replace(" ", "-").Replace(".", "")
                    };
                    _db.Tags.Add(newTag);
                    existingTags[tagName.ToLower()] = newTag;
                }
            }

            var existingQuestions = new Dictionary<string, Question>(StringComparer.Ordinal);
            if (updated > 0)
            {
                var dbQuestions = await _db.Questions.Include(q => q.QuestionTags).ToListAsync(ct);
                foreach (var q in dbQuestions)
                {
                    var key = !string.IsNullOrWhiteSpace(q.ExternalId)
                        ? q.ExternalId
                        : QuestionImportValidator.ComputeFingerprint(q.QuestionText);
                    existingQuestions[key] = q;
                }
            }

            foreach (var rec in validation.ValidRecords)
            {
                var key = !string.IsNullOrWhiteSpace(rec.ExternalId) 
                    ? rec.ExternalId.Trim() 
                    : QuestionImportValidator.ComputeFingerprint(rec.QuestionText);

                if (rec.IsUpdate && existingQuestions.TryGetValue(key, out var question))
                {
                    if (string.IsNullOrWhiteSpace(question.ExternalId) && !string.IsNullOrWhiteSpace(rec.ExternalId))
                    {
                        question.ExternalId = rec.ExternalId.Trim();
                    }
                    question.Title = rec.Title;
                    question.QuestionText = rec.QuestionText;
                    question.Difficulty = rec.Difficulty;
                    question.CategoryId = rec.CategoryId;

                    // Reconcile tags
                    question.QuestionTags.Clear();
                    foreach (var tag in rec.Tags)
                    {
                        if (existingTags.TryGetValue(tag.Trim().ToLower(), out var existingTag))
                        {
                            question.QuestionTags.Add(new QuestionTag { Tag = existingTag });
                        }
                    }
                }
                else
                {
                    var newQuestion = new Question
                    {
                        ExternalId = rec.ExternalId,
                        Title = rec.Title,
                        QuestionText = rec.QuestionText,
                        Difficulty = rec.Difficulty,
                        CategoryId = rec.CategoryId,
                        Status = QuestionStatus.Published,
                        CreatedAt = DateTime.UtcNow
                    };

                    foreach (var tag in rec.Tags)
                    {
                        if (existingTags.TryGetValue(tag.Trim().ToLower(), out var existingTag))
                        {
                            newQuestion.QuestionTags.Add(new QuestionTag { Tag = existingTag });
                        }
                    }

                    _db.Questions.Add(newQuestion);
                }
            }

            await _db.SaveChangesAsync(ct);
            await _audit.LogAsync(
                userId,
                userEmail,
                "IMPORTED",
                "Questions",
                newValues: JsonSerializer.Serialize(new
                {
                    Imported = inserted,
                    Updated = updated,
                    Failed = validation.Failed,
                    Skipped = validation.Skipped
                }),
                ct: ct);
        }

        // ── Persist ImportLog ──
        var importLog = new ImportLog
        {
            Type = ImportJobType.Question,
            FileName = "questions.json",
            IsDryRun = dryRun,
            Status = validation.Failed == 0 ? ImportLogStatus.Completed : ImportLogStatus.PartiallyCompleted,
            TotalRows = rows.Count(),
            Inserted = inserted,
            Updated = updated, // Changed to support UPSERT
            Skipped = validation.Skipped,
            Warned = validation.Warnings.Count,
            Failed = validation.Failed,
            ErrorSummaryJson = validation.Errors.Count > 0 ? JsonSerializer.Serialize(validation.Errors) : null,
            WarningSummaryJson = validation.Warnings.Count > 0 ? JsonSerializer.Serialize(validation.Warnings) : null,
            ImportedByUserId = userId,
            ImportedByEmail = userEmail,
            StartedAt = DateTime.UtcNow,
            CompletedAt = DateTime.UtcNow
        };
        _db.ImportLogs.Add(importLog);
        await _db.SaveChangesAsync(ct);

        return new BulkImportResultDto
        {
            Imported = inserted,
            Updated = updated,
            Failed = validation.Failed,
            Skipped = validation.Skipped,
            IsDryRun = dryRun,
            Errors = validation.Errors,
            Warnings = validation.Warnings
        };
    }

    private static QuestionAdminDto ToDto(Question q) => new()
    {
        Id = q.Id,
        ExternalId = q.ExternalId,
        Title = q.Title,
        QuestionText = q.QuestionText,
        AnswerMarkdown = q.Answer?.InterviewAnswer,
        Definition = q.Answer?.Definition,
        InterviewAnswer = q.Answer?.InterviewAnswer,
        StructuredContent = q.Answer?.Content != null ? JsonSerializer.Deserialize<AnswerContentDto>(q.Answer.Content, new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase }) : null,
        Difficulty = q.Difficulty.ToString(),
        Tags = q.QuestionTags.Select(qt => qt.Tag.Name).ToList(),
        CategoryId = q.CategoryId,
        CategoryName = q.Category?.Name ?? string.Empty,
        Status = q.Status.ToString(),
        IsDeleted = q.IsDeleted,
        CreatedAt = q.CreatedAt,
        UpdatedAt = q.UpdatedAt,
        CreatedByUserId = q.CreatedByUserId
    };
}

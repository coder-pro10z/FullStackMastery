using InterviewPrepApp.Application.DTOs.Admin;
using InterviewPrepApp.Application.Interfaces;
using InterviewPrepApp.Domain.Entities;
using InterviewPrepApp.Domain.Enums;
using InterviewPrepApp.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace InterviewPrepApp.Infrastructure.Services;

public class AdminAnswerImportService : IAdminAnswerImportService
{
    private readonly ApplicationDbContext _db;
    private readonly IAuditLogService _audit;

    public AdminAnswerImportService(ApplicationDbContext db, IAuditLogService audit)
    {
        _db = db;
        _audit = audit;
    }

    public async Task<ImportLog> ImportAsync(
        IEnumerable<ImportAnswerRowDto> rows,
        bool dryRun,
        string userId,
        string userEmail,
        CancellationToken ct = default)
    {
        var rowList = rows.ToList();
        var totalRows = rowList.Count;

        var importLog = new ImportLog
        {
            Type = ImportJobType.Answer,
            FileName = "answers.json",
            IsDryRun = dryRun,
            TotalRows = totalRows,
            ImportedByUserId = userId,
            ImportedByEmail = userEmail,
            StartedAt = DateTime.UtcNow
        };

        // For answers, we match strictly by ExternalId
        var externalIds = rowList.Select(r => r.QuestionId).Distinct().ToList();
        
        var questions = await _db.Questions
            .Include(q => q.Answer)
            .Where(q => q.ExternalId != null && externalIds.Contains(q.ExternalId))
            .ToDictionaryAsync(q => q.ExternalId!, q => q, ct);

        var orphanedIds = new List<string>();
        var fieldChangeSummaries = new List<object>();
        var missingFieldsPerAnswer = new List<object>();
        var errors = new List<string>();
        var warnings = new List<string>();

        var serializerOptions = new JsonSerializerOptions 
        { 
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
            DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull 
        };

        // Completeness tracking counters
        int hasCodeSnippets = 0, hasMermaid = 0, hasComparisonTable = 0;
        int hasTroubleshooting = 0, hasFollowUpQuestions = 0, hasBestPractice = 0;

        foreach (var row in rowList)
        {
            if (!questions.TryGetValue(row.QuestionId, out var question))
            {
                orphanedIds.Add(row.QuestionId);
                warnings.Add($"Row question_id '{row.QuestionId}' not found in database — skipped.");
                importLog.Warned++;
                continue;
            }

            // Build structured content JSON
            var contentObj = new
            {
                TechnicalExplanation = row.TechnicalExplanation,
                BestPractice = row.BestPractice,
                RealProjectExample = row.RealProjectExample,
                CodeSnippets = row.CodeSnippets,
                ArchitectureNote = row.ArchitectureNote,
                Differentiator = row.Differentiator,
                Troubleshooting = row.Troubleshooting,
                FollowUpQuestions = row.FollowUpQuestions
            };
            var contentJson = JsonSerializer.Serialize(contentObj, serializerOptions);
            var contentHash = ComputeHash(contentJson);

            // Track completeness
            if (row.CodeSnippets?.Any() == true) hasCodeSnippets++;
            if (!string.IsNullOrWhiteSpace(row.ArchitectureNote?.MermaidGraph)) hasMermaid++;
            if (row.Differentiator?.ComparisonTable != null) hasComparisonTable++;
            if (row.Troubleshooting?.Table != null) hasTroubleshooting++;
            if (row.FollowUpQuestions?.Any() == true) hasFollowUpQuestions++;
            if (row.BestPractice != null) hasBestPractice++;

            var missingFields = GetMissingFields(row);
            if (missingFields.Any())
            {
                missingFieldsPerAnswer.Add(new { question_id = row.QuestionId, missing = missingFields });
            }

            if (question.Answer == null)
            {
                // INSERT
                var answer = new Answer
                {
                    QuestionId = question.Id,
                    Definition = row.Definition,
                    InterviewAnswer = row.InterviewAnswer,
                    Content = contentJson,
                    SourceSlideId = row.SourceSlide,
                    ContentHash = contentHash,
                    CreatedAt = DateTime.UtcNow
                };

                if (!dryRun)
                {
                    _db.Answers.Add(answer);
                }
                importLog.Inserted++;
            }
            else
            {
                // UPDATE
                if (question.Answer.ContentHash == contentHash && 
                    question.Answer.Definition == row.Definition &&
                    question.Answer.InterviewAnswer == row.InterviewAnswer)
                {
                    // Unchanged
                    importLog.Skipped++;
                    continue;
                }

                // Detect what changed for the summary
                var changes = DetectChanges(question.Answer.Content, contentObj);
                if (changes.Added.Any() || changes.Modified.Any())
                {
                    fieldChangeSummaries.Add(new { question_id = row.QuestionId, added = changes.Added, modified = changes.Modified });
                }

                if (!dryRun)
                {
                    question.Answer.Definition = row.Definition;
                    question.Answer.InterviewAnswer = row.InterviewAnswer;
                    question.Answer.Content = contentJson;
                    question.Answer.SourceSlideId = row.SourceSlide;
                    question.Answer.ContentHash = contentHash;
                    question.Answer.UpdatedAt = DateTime.UtcNow;
                }
                
                importLog.Updated++;
            }
        }

        importLog.Status = errors.Count > 0 ? ImportLogStatus.Failed : 
                           (warnings.Count > 0 ? ImportLogStatus.PartiallyCompleted : ImportLogStatus.Completed);
                           
        importLog.OrphanedQuestionIdsJson = orphanedIds.Count > 0 ? JsonSerializer.Serialize(orphanedIds) : null;
        importLog.FieldChangeSummaryJson = fieldChangeSummaries.Count > 0 ? JsonSerializer.Serialize(fieldChangeSummaries) : null;
        importLog.MissingFieldsPerAnswerJson = missingFieldsPerAnswer.Count > 0 ? JsonSerializer.Serialize(missingFieldsPerAnswer) : null;
        importLog.ErrorSummaryJson = errors.Count > 0 ? JsonSerializer.Serialize(errors) : null;
        importLog.WarningSummaryJson = warnings.Count > 0 ? JsonSerializer.Serialize(warnings) : null;
        
        importLog.ContentCompletenessSummaryJson = JsonSerializer.Serialize(new {
            has_code_snippets = hasCodeSnippets,
            has_mermaid = hasMermaid,
            has_comparison_table = hasComparisonTable,
            has_troubleshooting = hasTroubleshooting,
            has_follow_up_questions = hasFollowUpQuestions,
            has_best_practice = hasBestPractice
        });

        importLog.CompletedAt = DateTime.UtcNow;

        _db.ImportLogs.Add(importLog);
        await _db.SaveChangesAsync(ct);

        if (!dryRun)
        {
            await _audit.LogAsync(userId, userEmail, "IMPORTED", "Answers", 
                newValues: JsonSerializer.Serialize(new { 
                    importLog.Inserted, importLog.Updated, importLog.Skipped, importLog.Warned 
                }), ct: ct);
        }

        return importLog;
    }

    private static string ComputeHash(string jsonContent)
    {
        var hash = SHA256.HashData(Encoding.UTF8.GetBytes(jsonContent));
        return Convert.ToHexString(hash).ToLowerInvariant();
    }

    private static List<string> GetMissingFields(ImportAnswerRowDto row)
    {
        var missing = new List<string>();
        if (row.TechnicalExplanation == null) missing.Add("technical_explanation");
        if (row.BestPractice == null) missing.Add("best_practice");
        if (row.RealProjectExample == null) missing.Add("real_project_example");
        if (row.CodeSnippets == null || !row.CodeSnippets.Any()) missing.Add("code_snippets");
        if (row.ArchitectureNote == null) missing.Add("architecture_note");
        if (row.Differentiator == null) missing.Add("differentiator");
        if (row.Troubleshooting == null) missing.Add("troubleshooting");
        if (row.FollowUpQuestions == null || !row.FollowUpQuestions.Any()) missing.Add("follow_up_questions");
        return missing;
    }

    private static (List<string> Added, List<string> Modified) DetectChanges(string oldJson, object newObj)
    {
        var added = new List<string>();
        var modified = new List<string>();
        
        try 
        {
            var oldDict = JsonSerializer.Deserialize<Dictionary<string, JsonElement>>(oldJson) ?? new Dictionary<string, JsonElement>();
            var newJson = JsonSerializer.Serialize(newObj, new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase, DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull });
            var newDict = JsonSerializer.Deserialize<Dictionary<string, JsonElement>>(newJson) ?? new Dictionary<string, JsonElement>();

            foreach (var kvp in newDict)
            {
                if (!oldDict.ContainsKey(kvp.Key) || oldDict[kvp.Key].ValueKind == JsonValueKind.Null)
                {
                    added.Add(kvp.Key);
                }
                else if (oldDict[kvp.Key].ToString() != kvp.Value.ToString())
                {
                    modified.Add(kvp.Key);
                }
            }
        }
        catch { /* Fallback if parsing fails */ }

        return (added, modified);
    }
}

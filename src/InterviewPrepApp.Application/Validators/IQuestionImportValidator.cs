using InterviewPrepApp.Application.DTOs.Admin;
using InterviewPrepApp.Domain.Enums;

namespace InterviewPrepApp.Application.Validators;

/// <summary>
/// Validates a batch of ImportQuestionRowDto rows, producing validated records and per-row diagnostics.
/// Pure validation — no DB writes.
/// </summary>
public interface IQuestionImportValidator
{
    /// <summary>
    /// Validate rows against business rules, category lookup, and dedup fingerprints.
    /// </summary>
    Task<QuestionImportValidationResult> ValidateAsync(
        IReadOnlyList<ImportQuestionRowDto> rows,
        int? defaultCategoryId,
        HashSet<string> existingFingerprints,
        CancellationToken ct = default);
}

/// <summary>
/// Single validated question ready for DB insert.
/// </summary>
public class ValidatedQuestionRecord
{
    public string? Title { get; set; }
    public string QuestionText { get; set; } = string.Empty;
    public string? AnswerMarkdown { get; set; }
    public Difficulty Difficulty { get; set; }
    public string Role { get; set; } = string.Empty;
    public int CategoryId { get; set; }
}

/// <summary>
/// Result of batch validation: valid records + errors + warnings + skip count.
/// </summary>
public class QuestionImportValidationResult
{
    public List<ValidatedQuestionRecord> ValidRecords { get; set; } = [];
    public List<string> Errors { get; set; } = [];
    public List<string> Warnings { get; set; } = [];
    public int Skipped { get; set; }
    public int Failed { get; set; }
}

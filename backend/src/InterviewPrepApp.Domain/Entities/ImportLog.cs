using InterviewPrepApp.Domain.Enums;

namespace InterviewPrepApp.Domain.Entities;

/// <summary>
/// Persisted log record for every synchronous import run (Questions or Answers).
/// Supplements the existing ImportJob entity (used for async Quiz/StudyGuide imports)
/// with a lighter, structured record that captures per-run statistics and answer-specific
/// completeness analysis.
/// </summary>
public class ImportLog
{
    public int Id { get; set; }

    /// <summary>Type of import: Question or Answer.</summary>
    public ImportJobType Type { get; set; }

    /// <summary>Original filename provided by the admin (e.g. "answers.json").</summary>
    public string FileName { get; set; } = string.Empty;

    /// <summary>True if this was a dry-run validation pass; no data was written to the DB.</summary>
    public bool IsDryRun { get; set; }

    public ImportLogStatus Status { get; set; }

    // ── Row Counts ───────────────────────────────────────────────────────────
    public int TotalRows { get; set; }
    public int Inserted { get; set; }
    public int Updated { get; set; }

    /// <summary>Rows where the content hash was identical to the existing DB record — skipped with no write.</summary>
    public int Skipped { get; set; }

    /// <summary>Rows where question_id was not found in the DB (orphaned answers).</summary>
    public int Warned { get; set; }

    /// <summary>Rows that failed schema validation or threw an exception.</summary>
    public int Failed { get; set; }

    // ── Answer-Specific Fields (null for Question imports) ───────────────────

    /// <summary>
    /// JSON array of question_ids that had no matching Question in the DB.
    /// This is the actionable list behind the Warned count.
    /// e.g. ["Q_AUTH_JWT_EXPIRY", "Q_DEVOPS_K8S_PODS"]
    /// </summary>
    public string? OrphanedQuestionIdsJson { get; set; }

    /// <summary>
    /// Per-updated-row breakdown of which Content fields were added or modified.
    /// e.g. [{ "question_id": "Q_CSHARP_VAR", "added": ["code_snippets"], "modified": ["best_practice"] }]
    /// </summary>
    public string? FieldChangeSummaryJson { get; set; }

    /// <summary>
    /// Aggregate report of how many answers have each optional content block.
    /// e.g. { "has_code_snippets": 0, "has_mermaid": 312, "has_comparison_table": 198 }
    /// </summary>
    public string? ContentCompletenessSummaryJson { get; set; }

    /// <summary>
    /// Per-answer list of missing optional fields (from validation_metadata.missing_fields).
    /// e.g. [{ "question_id": "Q_SQL_DEADLOCK", "missing": ["code_snippets", "architecture_note"] }]
    /// </summary>
    public string? MissingFieldsPerAnswerJson { get; set; }

    // ── Row-Level Error & Warning Detail ─────────────────────────────────────

    /// <summary>JSON array of row-level hard errors (schema validation failures, exceptions).</summary>
    public string? ErrorSummaryJson { get; set; }

    /// <summary>JSON array of row-level warnings (orphaned IDs, non-critical issues).</summary>
    public string? WarningSummaryJson { get; set; }

    // ── Audit ────────────────────────────────────────────────────────────────
    public string ImportedByUserId { get; set; } = string.Empty;
    public string ImportedByEmail { get; set; } = string.Empty;
    public DateTime StartedAt { get; set; } = DateTime.UtcNow;
    public DateTime? CompletedAt { get; set; }
}

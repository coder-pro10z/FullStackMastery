namespace InterviewPrepApp.Domain.Entities;

/// <summary>
/// Stores the rich structured answer for a Question Bank question.
/// Replaces the legacy Question.AnswerText flat string.
/// Linked 1:1 to Question; cascade-deletes when the parent Question is deleted.
/// </summary>
public class Answer
{
    public int Id { get; set; }
    public int QuestionId { get; set; }
    public Question Question { get; set; } = null!;

    // ── Denormalized fast-access fields ─────────────────────────────────────
    // These are the most-frequently displayed fields (grid cards, interview prep).
    // Stored as top-level columns to avoid JSON parsing on list queries.

    /// <summary>One-to-two sentence definition. Shown as lead paragraph in modal.</summary>
    public string? Definition { get; set; }

    /// <summary>The concise, well-structured interview-ready answer. Shown as the primary card.</summary>
    public string? InterviewAnswer { get; set; }

    // ── Structured Content (JSONB) ───────────────────────────────────────────
    // All remaining rich blocks are serialized into a single JSON column.
    // Blocks: technical_explanation, best_practice, real_project_example,
    //         code_snippets[], architecture_note (+mermaid), differentiator (+table),
    //         troubleshooting (+table), follow_up_questions[]
    // These are rendered-only (not queried), so JSONB is the right trade-off.
    public string Content { get; set; } = "{}";

    // ── Import metadata ──────────────────────────────────────────────────────
    /// <summary>Source slide or lesson reference from the import file (e.g. "SLIDE_04_SOLID").</summary>
    public string? SourceSlideId { get; set; }

    /// <summary>SHA-256 hash of Content used for upsert skip detection (no-op if identical).</summary>
    public string? ContentHash { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
}

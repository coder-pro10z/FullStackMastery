namespace InterviewPrepApp.Domain.Entities;

/// <summary>
/// M:N bridge table between Question and Tag.
/// A question can have many tags; a tag can belong to many questions.
/// Composite PK (QuestionId, TagId).
/// </summary>
public class QuestionTag
{
    public int QuestionId { get; set; }
    public Question Question { get; set; } = null!;

    public int TagId { get; set; }
    public Tag Tag { get; set; } = null!;
}

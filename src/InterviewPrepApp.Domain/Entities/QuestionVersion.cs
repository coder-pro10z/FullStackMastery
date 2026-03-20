namespace InterviewPrepApp.Domain.Entities;

public class QuestionVersion
{
    public int Id { get; set; }
    public int QuestionId { get; set; }
    public Question Question { get; set; } = null!;
    public int VersionNumber { get; set; }
    public string QuestionSnapshot { get; set; } = string.Empty;  // JSON
    public string? AnswerSnapshot { get; set; }                   // JSON
    public string? EditedByUserId { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

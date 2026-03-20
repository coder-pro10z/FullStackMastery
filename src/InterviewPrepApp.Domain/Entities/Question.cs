using InterviewPrepApp.Domain.Enums;

namespace InterviewPrepApp.Domain.Entities;

public class Question
{
    public int Id { get; set; }
    public string? Title { get; set; }
    public string QuestionText { get; set; } = string.Empty;
    public string? AnswerText { get; set; }        // Legacy inline answer (kept for backwards compat)
    public Difficulty Difficulty { get; set; }
    public string Role { get; set; } = string.Empty;
    public int CategoryId { get; set; }
    public Category Category { get; set; } = null!;

    // Admin fields
    public QuestionStatus Status { get; set; } = QuestionStatus.Published;
    public bool IsDeleted { get; set; } = false;
    public DateTime? DeletedAt { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
    public string? CreatedByUserId { get; set; }

    // Navigation
    public ICollection<UserProgress> UserProgresses { get; set; } = new List<UserProgress>();
    public ICollection<QuestionVersion> Versions { get; set; } = new List<QuestionVersion>();
}

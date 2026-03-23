using InterviewPrepApp.Domain.Enums;

namespace InterviewPrepApp.Domain.Entities;

public class QuizAttempt
{
    public int Id { get; set; }
    public string UserId { get; set; } = string.Empty;
    public QuizMode Mode { get; set; }
    public QuizStatus Status { get; set; }
    public DateTime StartedAt { get; set; } = DateTime.UtcNow;
    public DateTime? CompletedAt { get; set; }
    public DateTime? ExpiresAtUtc { get; set; }
    public int TotalQuestions { get; set; }
    public int CorrectCount { get; set; }
    
    public ApplicationUser User { get; set; } = null!;
    public ICollection<QuizAttemptQuestion> Questions { get; set; } = new List<QuizAttemptQuestion>();
}

public class QuizAttemptQuestion
{
    public int Id { get; set; }
    public int QuizAttemptId { get; set; }
    public int QuestionId { get; set; }
    public int? QuestionVersionId { get; set; }
    public int OrderIndex { get; set; }
    public string QuestionTextSnapshot { get; set; } = string.Empty;
    public string AnswerTextSnapshot { get; set; } = string.Empty;
    public string TitleSnapshot { get; set; } = string.Empty;
    
    public QuizAttempt QuizAttempt { get; set; } = null!;
    public Question Question { get; set; } = null!;
    public QuizAttemptResponse? Response { get; set; }
}

public class QuizAttemptResponse
{
    public int Id { get; set; }
    public int QuizAttemptQuestionId { get; set; }
    public string? ResponseText { get; set; }
    public bool? IsSelfMarkedCorrect { get; set; }
    public DateTime? AnsweredAtUtc { get; set; }
    
    public QuizAttemptQuestion QuizAttemptQuestion { get; set; } = null!;
}

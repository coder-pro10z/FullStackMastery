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

    /// <summary>FK to QuizQuestion (MCQ). Not the long-form Question.</summary>
    public int QuizQuestionId { get; set; }

    public int OrderIndex { get; set; }

    // --- Text snapshots (immutable at attempt creation time) ---
    public string QuestionTextSnapshot { get; set; } = string.Empty;
    public string OptionASnapshot { get; set; } = string.Empty;
    public string OptionBSnapshot { get; set; } = string.Empty;
    public string OptionCSnapshot { get; set; } = string.Empty;
    public string OptionDSnapshot { get; set; } = string.Empty;
    public string ExplanationSnapshot { get; set; } = string.Empty;

    /// <summary>Stored server-side only — never serialised into response DTOs.</summary>
    public string CorrectAnswerSnapshot { get; set; } = string.Empty;

    public QuizAttempt QuizAttempt { get; set; } = null!;
    public QuizQuestion QuizQuestion { get; set; } = null!;
    public QuizAttemptResponse? Response { get; set; }
}

public class QuizAttemptResponse
{
    public int Id { get; set; }
    public int QuizAttemptQuestionId { get; set; }

    /// <summary>Key the user clicked: "A", "B", "C", or "D".</summary>
    public string? SelectedAnswer { get; set; }

    /// <summary>System-evaluated; never derived from self-marking.</summary>
    public bool? IsCorrect { get; set; }

    public DateTime? AnsweredAtUtc { get; set; }
    
    public QuizAttemptQuestion QuizAttemptQuestion { get; set; } = null!;
}


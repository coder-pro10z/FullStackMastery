namespace InterviewPrepApp.Domain.Entities;

using InterviewPrepApp.Domain.Enums;

/// <summary>
/// Represents an MCQ quiz question in the Quiz Engine bounded context.
/// Deliberately separate from the Question Bank entity.
/// </summary>
public class QuizQuestion
{
    public int Id { get; set; }

    /// <summary>Author-assigned stable identifier used for idempotent import.</summary>
    public string ExternalId { get; set; } = string.Empty;

    public string QuestionText { get; set; } = string.Empty;
    public string OptionA { get; set; } = string.Empty;
    public string OptionB { get; set; } = string.Empty;
    public string OptionC { get; set; } = string.Empty;
    public string OptionD { get; set; } = string.Empty;

    /// <summary>Valid values: A, B, C, D</summary>
    public string CorrectAnswer { get; set; } = string.Empty;

    public string? Explanation { get; set; }
    public string? Role { get; set; }
    public string? Tags { get; set; }

    public QuizQuestionDifficulty Difficulty { get; set; } = QuizQuestionDifficulty.Medium;

    public int? CategoryId { get; set; }
    public Category? Category { get; set; }

    public bool IsDeleted { get; set; }
    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAtUtc { get; set; }
}

using InterviewPrepApp.Domain.Enums;

namespace InterviewPrepApp.Application.DTOs;

public class CreateQuizAttemptDto
{
    public QuizMode Mode { get; set; } = QuizMode.Practice;
    public int? CategoryId { get; set; }
    public string? Role { get; set; }
    public Difficulty? Difficulty { get; set; }
    public int QuestionCount { get; set; } = 10;
}

public class QuizAttemptDto
{
    public int Id { get; set; }
    public string Mode { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public DateTime StartedAt { get; set; }
    public DateTime? CompletedAt { get; set; }
    public int TotalQuestions { get; set; }
    public int CorrectCount { get; set; }

    public List<QuizAttemptQuestionDto> Questions { get; set; } = new();
}

public class QuizAttemptQuestionDto
{
    public int Id { get; set; }
    public int OrderIndex { get; set; }
    public string Title { get; set; } = string.Empty;
    public string QuestionText { get; set; } = string.Empty;
    public string? AnswerText { get; set; } 
    public QuizAttemptResponseDto? Response { get; set; }
}

public class QuizAttemptResponseDto
{
    public int Id { get; set; }
    public bool? IsSelfMarkedCorrect { get; set; }
    public DateTime? AnsweredAtUtc { get; set; }
}

public class SubmitQuizResponseDto
{
    public bool IsCorrect { get; set; }
}

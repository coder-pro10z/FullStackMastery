using InterviewPrepApp.Domain.Enums;

namespace InterviewPrepApp.Application.DTOs;

public class CreateQuizAttemptDto
{
    public QuizMode Mode { get; set; } = QuizMode.Practice;
    public int? CategoryId { get; set; }
    public string? Role { get; set; }
    public QuizQuestionDifficulty? Difficulty { get; set; }
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
    public string QuestionText { get; set; } = string.Empty;

    // MCQ Options — always sent to client
    public string OptionA { get; set; } = string.Empty;
    public string OptionB { get; set; } = string.Empty;
    public string OptionC { get; set; } = string.Empty;
    public string OptionD { get; set; } = string.Empty;

    // Explanation — revealed after the user answers correctly
    public string? Explanation { get; set; }

    // CorrectAnswer is intentionally omitted — server-evaluated only

    public QuizAttemptResponseDto? Response { get; set; }
}

public class QuizAttemptResponseDto
{
    public int Id { get; set; }
    public string? SelectedAnswer { get; set; }   // "A", "B", "C", or "D"
    public bool? IsCorrect { get; set; }           // system-evaluated
    public DateTime? AnsweredAtUtc { get; set; }
}

/// <summary>Payload sent by the client when the user clicks a MCQ option.</summary>
public class SubmitAnswerDto
{
    public string SelectedAnswer { get; set; } = string.Empty; // "A", "B", "C", or "D"
}


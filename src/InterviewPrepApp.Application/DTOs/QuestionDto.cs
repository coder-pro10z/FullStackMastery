using InterviewPrepApp.Domain.Enums;

namespace InterviewPrepApp.Application.DTOs;

public class QuestionDto
{
    public int Id { get; set; }

    public string? Title { get; set; }

    public string QuestionText { get; set; } = string.Empty;

    public string? AnswerText { get; set; }

    public Difficulty Difficulty { get; set; }

    public string Role { get; set; } = string.Empty;

    public int CategoryId { get; set; }

    public string CategoryName { get; set; } = string.Empty;

    public bool IsSolved { get; set; }

    public bool IsRevision { get; set; }
}

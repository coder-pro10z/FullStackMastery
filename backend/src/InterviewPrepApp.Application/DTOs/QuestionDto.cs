using InterviewPrepApp.Domain.Enums;

namespace InterviewPrepApp.Application.DTOs;

public class QuestionDto
{
    public int Id { get; set; }

    public string? Title { get; set; }

    public string QuestionText { get; set; } = string.Empty;

    public string? ExternalId { get; set; }

    public string? AnswerText { get; set; }
    public string? Definition { get; set; }
    public string? InterviewAnswer { get; set; }
    public AnswerContentDto? StructuredContent { get; set; }

    public Difficulty Difficulty { get; set; }

    public List<string> Tags { get; set; } = [];

    public int CategoryId { get; set; }

    public string CategoryName { get; set; } = string.Empty;

    public bool IsSolved { get; set; }

    public bool IsRevision { get; set; }
}

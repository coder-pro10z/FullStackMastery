using InterviewPrepApp.Domain.Enums;

namespace InterviewPrepApp.Domain.Entities;

public class Question
{
    public int Id { get; set; }

    public string? Title { get; set; }

    public string QuestionText { get; set; } = string.Empty;

    public string? AnswerText { get; set; }

    public Difficulty Difficulty { get; set; }

    public string Role { get; set; } = string.Empty;

    public int CategoryId { get; set; }

    public Category Category { get; set; } = null!;

    public ICollection<UserProgress> UserProgresses { get; set; } = new List<UserProgress>();
}

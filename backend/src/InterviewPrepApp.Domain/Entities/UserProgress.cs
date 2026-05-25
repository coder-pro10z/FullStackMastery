namespace InterviewPrepApp.Domain.Entities;

public class UserProgress
{
    public string UserId { get; set; } = string.Empty;

    public int QuestionId { get; set; }

    public bool IsSolved { get; set; }

    public bool IsRevision { get; set; }

    public ApplicationUser User { get; set; } = null!;

    public Question Question { get; set; } = null!;
}

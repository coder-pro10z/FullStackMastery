namespace InterviewPrepApp.Domain.Entities;

public class InterviewRoundQuestion
{
    public Guid RoundId { get; set; }
    public InterviewRound Round { get; set; } = null!;

    public int QuestionId { get; set; }
    public Question Question { get; set; } = null!;

    public int OrderIndex { get; set; }
}

namespace InterviewPrepApp.Domain.Entities;

public class InterviewRound
{
    public Guid Id { get; set; }
    public Guid InterviewId { get; set; }
    public CompanyInterview Interview { get; set; } = null!;

    public int RoundNumber { get; set; }
    public string? FocusArea { get; set; }

    public ICollection<InterviewRoundQuestion> RoundQuestions { get; set; } = new List<InterviewRoundQuestion>();
}

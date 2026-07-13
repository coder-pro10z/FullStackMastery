namespace InterviewPrepApp.Domain.Entities;

public class CompanyInterview
{
    public Guid Id { get; set; }
    public Guid CompanyId { get; set; }
    public Company Company { get; set; } = null!;

    public string RoleName { get; set; } = string.Empty;
    public string? LevelTier { get; set; }
    public DateTime? InterviewDate { get; set; }

    public ICollection<InterviewRound> Rounds { get; set; } = new List<InterviewRound>();
}

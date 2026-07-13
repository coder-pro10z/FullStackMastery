namespace InterviewPrepApp.Domain.Entities;

public class Company
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? LogoUrl { get; set; }
    public string? IndustryType { get; set; }

    public ICollection<CompanyInterview> Interviews { get; set; } = new List<CompanyInterview>();
}

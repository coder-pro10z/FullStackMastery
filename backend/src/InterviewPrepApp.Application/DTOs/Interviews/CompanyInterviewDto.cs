using System.Text.Json.Serialization;

namespace InterviewPrepApp.Application.DTOs.Interviews;

public class CompanyInterviewDto
{
    [JsonPropertyName("id")]
    public Guid Id { get; set; }

    [JsonPropertyName("company_id")]
    public Guid CompanyId { get; set; }

    [JsonPropertyName("role_name")]
    public string RoleName { get; set; } = string.Empty;

    [JsonPropertyName("level_tier")]
    public string? LevelTier { get; set; }

    [JsonPropertyName("interview_date")]
    public DateTime? InterviewDate { get; set; }
}

using System.Text.Json.Serialization;

namespace InterviewPrepApp.Application.DTOs.Interviews;

public class CompanyDto
{
    [JsonPropertyName("id")]
    public Guid Id { get; set; }

    [JsonPropertyName("name")]
    public string Name { get; set; } = string.Empty;

    [JsonPropertyName("logo_url")]
    public string? LogoUrl { get; set; }

    [JsonPropertyName("industry_type")]
    public string? IndustryType { get; set; }
}

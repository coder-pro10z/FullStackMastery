using System.Text.Json.Serialization;

namespace InterviewPrepApp.Application.DTOs.Interviews;

public class InterviewRoundDto
{
    [JsonPropertyName("id")]
    public Guid Id { get; set; }

    [JsonPropertyName("interview_id")]
    public Guid InterviewId { get; set; }

    [JsonPropertyName("round_number")]
    public int RoundNumber { get; set; }

    [JsonPropertyName("focus_area")]
    public string? FocusArea { get; set; }
}

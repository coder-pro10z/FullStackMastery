namespace InterviewPrepApp.Domain.Entities;

/// <summary>
/// Represents a primary performance metric (e.g., "Sub-50ms latency", "500+ concurrent users").
/// </summary>
public class PrimaryMetric
{
    public int Id { get; set; }
    public string Value { get; set; } = string.Empty;

    // Foreign Key
    public int DevHexagonId { get; set; }
    public DevHexagon DevHexagon { get; set; } = null!;
}

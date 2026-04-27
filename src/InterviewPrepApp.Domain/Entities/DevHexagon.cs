namespace InterviewPrepApp.Domain.Entities;

/// <summary>
/// Root aggregate entity representing the developer's skill hexagon / dashboard profile.
/// Maps directly to the top-level "dev_hexagon" object in tech-stack.json.
/// </summary>
public class DevHexagon
{
    public int Id { get; set; }
    public string Version { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
    public string TargetLevel { get; set; } = string.Empty;

    // Navigation
    public ICollection<PrimaryMetric> PrimaryMetrics { get; set; } = new List<PrimaryMetric>();
    public ICollection<SkillCategory> Skills { get; set; } = new List<SkillCategory>();
}

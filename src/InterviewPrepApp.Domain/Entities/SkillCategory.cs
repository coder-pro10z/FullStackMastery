namespace InterviewPrepApp.Domain.Entities;

/// <summary>
/// Represents a category of skills (e.g., "Backend (.NET)", "Frontend (Angular)").
/// Contains metadata like high-level goals and interview gotchas.
/// </summary>
public class SkillCategory
{
    public int Id { get; set; }
    public string Category { get; set; } = string.Empty;
    public string HighLevelGoal { get; set; } = string.Empty;
    public string InterviewGotcha { get; set; } = string.Empty;

    // Foreign Key
    public int DevHexagonId { get; set; }
    public DevHexagon DevHexagon { get; set; } = null!;

    // Navigation
    public ICollection<Skill> KeyTopics { get; set; } = new List<Skill>();
}

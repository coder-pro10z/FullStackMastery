namespace InterviewPrepApp.Domain.Entities;

/// <summary>
/// Represents a single skill/topic within a skill category.
/// Maps to a row in the Skills table.
/// </summary>
public class Skill
{
    public int Id { get; set; }
    public string TopicName { get; set; } = string.Empty;

    // Foreign Key
    public int SkillCategoryId { get; set; }
    public SkillCategory SkillCategory { get; set; } = null!;
}

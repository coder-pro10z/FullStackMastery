namespace InterviewPrepApp.Application.DTOs;

/// <summary>
/// Root DTO matching the exact shape of tech-stack.json.
/// The frontend deserializes this directly.
/// </summary>
public sealed record TechStackDto(DevHexagonDto DevHexagon);

/// <summary>
/// DTO for the "dev_hexagon" object in the JSON contract.
/// Uses snake_case property names via System.Text.Json to match the frontend expectations.
/// </summary>
public sealed record DevHexagonDto(
    string Version,
    string Role,
    string TargetLevel,
    IReadOnlyList<string> PrimaryMetrics,
    IReadOnlyList<SkillCategoryDto> Skills
);

/// <summary>
/// DTO for each skill category entry (e.g., "Backend (.NET)").
/// </summary>
public sealed record SkillCategoryDto(
    string Category,
    string HighLevelGoal,
    string InterviewGotcha,
    IReadOnlyList<string> KeyTopics
);

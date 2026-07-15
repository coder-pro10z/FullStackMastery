namespace InterviewPrepApp.Domain.Entities;

/// <summary>
/// A classification tag that can be applied to Questions via the QuestionTag M:N bridge.
/// Replaces the free-text Question.Role field with a normalized, reusable tag system.
/// TagGroup organises tags by type (e.g. "Role", "Domain", "Technology") for UI grouping.
/// </summary>
public class Tag
{
    public int Id { get; set; }

    /// <summary>Human-readable label shown in the UI (e.g. "Backend", ".NET", "Full Stack").</summary>
    public string Name { get; set; } = string.Empty;

    /// <summary>URL-safe unique identifier used for filtering and import resolution (e.g. "backend", "dotnet").</summary>
    public string Slug { get; set; } = string.Empty;

    /// <summary>Optional grouping category for UI rendering (e.g. "Role", "Domain", "Technology").</summary>
    public string? TagGroup { get; set; }

    // Navigation
    public ICollection<QuestionTag> QuestionTags { get; set; } = [];
}

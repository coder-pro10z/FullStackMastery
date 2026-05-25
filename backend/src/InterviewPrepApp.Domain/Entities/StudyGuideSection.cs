namespace InterviewPrepApp.Domain.Entities;

/// <summary>
/// Represents a revision/study guide section in the Study Guide bounded context.
/// </summary>
public class StudyGuideSection
{
    public int Id { get; set; }

    /// <summary>Author-assigned stable identifier used for idempotent import.</summary>
    public string ExternalId { get; set; } = string.Empty;

    public string Title { get; set; } = string.Empty;
    public string ContentMarkdown { get; set; } = string.Empty;
    public string? Role { get; set; }
    public string? Tags { get; set; }
    public int DisplayOrder { get; set; }

    public int? CategoryId { get; set; }
    public Category? Category { get; set; }

    public bool IsDeleted { get; set; }
    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAtUtc { get; set; }
}

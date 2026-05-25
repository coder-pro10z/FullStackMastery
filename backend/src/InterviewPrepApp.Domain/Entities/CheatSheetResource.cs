namespace InterviewPrepApp.Domain.Entities;

using InterviewPrepApp.Domain.Enums;

public class CheatSheetResource
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public CheatSheetResourceType Type { get; set; }
    public string? Url { get; set; }
    public string? MarkdownContent { get; set; }
    public int CategoryId { get; set; }
    public Category Category { get; set; } = null!;
    public int DisplayOrder { get; set; }
    public bool IsDeleted { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
}

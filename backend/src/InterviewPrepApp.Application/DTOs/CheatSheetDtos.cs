namespace InterviewPrepApp.Application.DTOs;

public class CheatSheetResourceDto
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public string? Url { get; set; }
    public string? MarkdownContent { get; set; }
    public int CategoryId { get; set; }
    public string CategoryName { get; set; } = string.Empty;
    public int DisplayOrder { get; set; }
}

public class CreateCheatSheetDto
{
    public string Title { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public string? Url { get; set; }
    public string? MarkdownContent { get; set; }
    public int CategoryId { get; set; }
    public int DisplayOrder { get; set; }
}

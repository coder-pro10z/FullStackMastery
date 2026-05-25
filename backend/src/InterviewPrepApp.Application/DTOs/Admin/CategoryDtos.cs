namespace InterviewPrepApp.Application.DTOs.Admin;

public class CreateCategoryDto
{
    public string Name { get; set; } = string.Empty;
    public string? Slug { get; set; }
    public int? ParentId { get; set; }
}

public class UpdateCategoryDto
{
    public string Name { get; set; } = string.Empty;
    public string? Slug { get; set; }
    public int? ParentId { get; set; }
}

public class CategoryManageDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public int? ParentId { get; set; }
    public int QuestionCount { get; set; }
    public IReadOnlyList<CategoryManageDto> SubCategories { get; set; } = [];
}

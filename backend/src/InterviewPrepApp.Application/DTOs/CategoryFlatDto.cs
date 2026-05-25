namespace InterviewPrepApp.Application.DTOs;

public class CategoryFlatDto
{
    public int Id { get; set; }

    public string Name { get; set; } = string.Empty;

    public int? ParentCategoryId { get; set; }
}

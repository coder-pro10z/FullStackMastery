namespace InterviewPrepApp.Application.DTOs;

public class CategoryTreeDto
{
    public int Id { get; set; }

    public string Name { get; set; } = string.Empty;

    public List<CategoryTreeDto> SubCategories { get; set; } = new();
}

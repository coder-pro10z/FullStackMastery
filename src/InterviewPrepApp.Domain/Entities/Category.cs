namespace InterviewPrepApp.Domain.Entities;

public class Category
{
    public int Id { get; set; }

    public string Name { get; set; } = string.Empty;

    public int? ParentId { get; set; }

    public Category? Parent { get; set; }

    public ICollection<Category> SubCategories { get; set; } = new List<Category>();

    public ICollection<Question> Questions { get; set; } = new List<Question>();
}

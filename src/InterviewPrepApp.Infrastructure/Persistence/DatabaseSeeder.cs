using InterviewPrepApp.Domain.Entities;

namespace InterviewPrepApp.Infrastructure.Persistence;

public static class DatabaseSeeder
{
    public static IReadOnlyCollection<Category> GetSeedCategories()
    {
        var categoryTree = new Dictionary<string, IReadOnlyList<string>>
        {
            ["Fundamentals"] = new[]
            {
                "OOPS"
            },
            ["OOPS"] = new[]
            {
                "Abstraction"
            },
            ["Abstraction"] = Array.Empty<string>()
        };

        var seedCategories = new List<Category>();
        var assignedIds = new Dictionary<string, int>();
        var nextId = 1;

        foreach (var rootCategory in categoryTree.Keys.Where(category => categoryTree.Values.All(children => !children.Contains(category))))
        {
            AddCategoryTree(rootCategory, null, categoryTree, assignedIds, seedCategories, ref nextId);
        }

        return seedCategories;
    }

    private static void AddCategoryTree(
        string categoryName,
        int? parentId,
        IReadOnlyDictionary<string, IReadOnlyList<string>> categoryTree,
        IDictionary<string, int> assignedIds,
        ICollection<Category> seedCategories,
        ref int nextId)
    {
        if (!assignedIds.TryAdd(categoryName, nextId))
        {
            return;
        }

        var currentCategoryId = nextId;
        nextId++;

        seedCategories.Add(new Category
        {
            Id = currentCategoryId,
            Name = categoryName,
            ParentId = parentId
        });

        if (!categoryTree.TryGetValue(categoryName, out var childCategories))
        {
            return;
        }

        foreach (var childCategory in childCategories)
        {
            AddCategoryTree(childCategory, currentCategoryId, categoryTree, assignedIds, seedCategories, ref nextId);
        }
    }
}

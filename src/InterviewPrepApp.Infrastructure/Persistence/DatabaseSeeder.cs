using InterviewPrepApp.Domain.Entities;

namespace InterviewPrepApp.Infrastructure.Persistence;

public static class DatabaseSeeder
{
    // public static IReadOnlyCollection<Category> GetSeedCategories()
    // {
    //     var categoryTree = new Dictionary<string, IReadOnlyList<string>>
    //     {
    //         ["Fundamentals"] = new[]
    //         {
    //             "OOPS"
    //         },
    //         ["OOPS"] = new[]
    //         {
    //             "Abstraction"
    //         },
    //         ["Abstraction"] = Array.Empty<string>()
    //     };

    //     var seedCategories = new List<Category>();
    //     var assignedIds = new Dictionary<string, int>();
    //     var nextId = 1;

    //     foreach (var rootCategory in categoryTree.Keys.Where(category => categoryTree.Values.All(children => !children.Contains(category))))
    //     {
    //         AddCategoryTree(rootCategory, null, categoryTree, assignedIds, seedCategories, ref nextId);
    //     }

    //     return seedCategories;
    // }

public static IReadOnlyCollection<Category> GetSeedCategories()
{
    var categoryTree = new Dictionary<string, IReadOnlyList<string>>
    {
        // Existing categories
        ["Fundamentals"] = new[] { "OOPS", "SOLID" },
        ["OOPS"] = new[] { "Abstraction", "Encapsulation", "Inheritance", "Polymorphism" },
        ["SOLID"] = new[] { "Single Responsibility", "Open-Closed", "Liskov Substitution", "Interface Segregation", "Dependency Inversion" },
        ["Abstraction"] = new[] { "Abstract Classes", "Interfaces" },
        
        // Backend category and its hierarchy
        ["Backend"] = new[] { "Middleware", "Caching", "API Design", "Database", "Security", "Authentication" },
        
        // Middleware subcategories
        ["Middleware"] = new[] { "Request Pipeline", "Error Handling", "Logging" },
        ["Request Pipeline"] = Array.Empty<string>(),
        ["Error Handling"] = Array.Empty<string>(),
        ["Logging"] = Array.Empty<string>(),
        
        // Caching subcategories
        ["Caching"] = new[] { "HTTP Caching", "Cache Headers", "CDN" },
        ["HTTP Caching"] = Array.Empty<string>(),
        ["Cache Headers"] = new[] { "Cache-Control", "Expires", "ETag" },
        ["CDN"] = Array.Empty<string>(),
        
        // API Design subcategories
        ["API Design"] = new[] { "REST", "GraphQL", "gRPC" },
        ["REST"] = new[] { "HTTP Methods", "Status Codes", "Resource Design" },
        ["GraphQL"] = new[] { "Queries", "Mutations", "Subscriptions" },
        ["gRPC"] = Array.Empty<string>(),
        
        // Database subcategories
        ["Database"] = new[] { "SQL", "NoSQL", "ORM" },
        ["SQL"] = new[] { "Queries", "Indexes", "Transactions", "Joins" },
        ["NoSQL"] = new[] { "Document DB", "Key-Value", "Graph DB" },
        ["ORM"] = new[] { "Entity Framework", "Dapper", "NHibernate" },
        
        // Security subcategories
        ["Security"] = new[] { "Authentication", "Authorization", "Encryption", "CORS" },
        ["Authentication"] = new[] { "JWT", "OAuth", "Basic Auth" },
        ["Authorization"] = new[] { "Roles", "Policies", "Claims" },
        ["Encryption"] = Array.Empty<string>(),
        ["CORS"] = Array.Empty<string>(),
        
        // Keep existing categories for other domains
        [".NET"] = new[] { "ASP.NET Core", "Entity Framework Core" },
        ["Angular"] = new[] { "Components", "RxJS" },
        ["System Design"] = new[] { "High-Level Design", "Low-Level Design", "Scalability" }
    };

    var seedCategories = new List<Category>();
    var assignedIds = new Dictionary<string, int>();
    var nextId = 1;

    var allChildren = categoryTree.Values.SelectMany(x => x).ToHashSet();
    var rootCategories = categoryTree.Keys.Where(c => !allChildren.Contains(c)).ToList();

    foreach (var root in rootCategories)
    {
        AddCategoryTree(root, null, categoryTree, assignedIds, seedCategories, ref nextId);
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

using InterviewPrepApp.Domain.Entities;

namespace InterviewPrepApp.Infrastructure.Persistence;

public static class DatabaseSeeder
{
    public static IReadOnlyCollection<Category> GetSeedCategories()
    {
        // (name, slug, children)
        var categoryTree = new Dictionary<string, (string Slug, IReadOnlyList<string> Children)>
        {
            ["Fundamentals"]            = ("fundamentals",          new[] { "OOPS", "SOLID" }),
            ["OOPS"]                    = ("oops",                  new[] { "Abstraction", "Encapsulation", "Inheritance", "Polymorphism" }),
            ["SOLID"]                   = ("solid",                 new[] { "Single Responsibility", "Open-Closed", "Liskov Substitution", "Interface Segregation", "Dependency Inversion" }),
            ["Abstraction"]             = ("abstraction",           new[] { "Abstract Classes", "Interfaces" }),
            ["Encapsulation"]           = ("encapsulation",         Array.Empty<string>()),
            ["Inheritance"]             = ("inheritance",           Array.Empty<string>()),
            ["Polymorphism"]            = ("polymorphism",          Array.Empty<string>()),
            ["Abstract Classes"]        = ("abstract-classes",      Array.Empty<string>()),
            ["Interfaces"]              = ("interfaces",            Array.Empty<string>()),
            ["Single Responsibility"]   = ("srp",                   Array.Empty<string>()),
            ["Open-Closed"]             = ("ocp",                   Array.Empty<string>()),
            ["Liskov Substitution"]     = ("lsp",                   Array.Empty<string>()),
            ["Interface Segregation"]   = ("isp",                   Array.Empty<string>()),
            ["Dependency Inversion"]    = ("dip",                   Array.Empty<string>()),
            ["Backend"]                 = ("backend",               new[] { "Middleware", "Caching", "API Design", "Database", "Security" }),
            ["Middleware"]              = ("middleware",             new[] { "Request Pipeline", "Error Handling", "Logging" }),
            ["Request Pipeline"]        = ("request-pipeline",      Array.Empty<string>()),
            ["Error Handling"]          = ("error-handling",        Array.Empty<string>()),
            ["Logging"]                 = ("logging",               Array.Empty<string>()),
            ["Caching"]                 = ("caching",               new[] { "HTTP Caching", "Cache Headers", "CDN" }),
            ["HTTP Caching"]            = ("http-caching",          Array.Empty<string>()),
            ["Cache Headers"]           = ("cache-headers",         new[] { "Cache-Control", "Expires", "ETag" }),
            ["Cache-Control"]           = ("cache-control",         Array.Empty<string>()),
            ["Expires"]                 = ("expires",               Array.Empty<string>()),
            ["ETag"]                    = ("etag",                  Array.Empty<string>()),
            ["CDN"]                     = ("cdn",                   Array.Empty<string>()),
            ["API Design"]              = ("api-design",            new[] { "REST", "GraphQL", "gRPC" }),
            ["REST"]                    = ("rest",                  new[] { "HTTP Methods", "Status Codes", "Resource Design" }),
            ["HTTP Methods"]            = ("http-methods",          Array.Empty<string>()),
            ["Status Codes"]            = ("status-codes",          Array.Empty<string>()),
            ["Resource Design"]         = ("resource-design",       Array.Empty<string>()),
            ["GraphQL"]                 = ("graphql",               new[] { "Queries", "Mutations", "Subscriptions" }),
            ["Queries"]                 = ("queries",               Array.Empty<string>()),
            ["Mutations"]               = ("mutations",             Array.Empty<string>()),
            ["Subscriptions"]           = ("subscriptions",         Array.Empty<string>()),
            ["gRPC"]                    = ("grpc",                  Array.Empty<string>()),
            ["Database"]                = ("database",              new[] { "SQL", "NoSQL", "ORM" }),
            ["SQL"]                     = ("sql",                   new[] { "Indexes", "Transactions" }),
            ["Indexes"]                 = ("indexes",               Array.Empty<string>()),
            ["Transactions"]            = ("transactions",          Array.Empty<string>()),
            ["NoSQL"]                   = ("nosql",                 new[] { "Document DB", "Key-Value" }),
            ["Document DB"]             = ("document-db",           Array.Empty<string>()),
            ["Key-Value"]               = ("key-value",             Array.Empty<string>()),
            ["ORM"]                     = ("orm",                   new[] { "Entity Framework", "Dapper" }),
            ["Entity Framework"]        = ("entity-framework",      Array.Empty<string>()),
            ["Dapper"]                  = ("dapper",                Array.Empty<string>()),
            ["Security"]                = ("security",              new[] { "Authentication", "Authorization", "Encryption", "CORS" }),
            ["Authentication"]          = ("authentication",        new[] { "JWT", "OAuth", "Basic Auth" }),
            ["JWT"]                     = ("jwt",                   Array.Empty<string>()),
            ["OAuth"]                   = ("oauth",                 Array.Empty<string>()),
            ["Basic Auth"]              = ("basic-auth",            Array.Empty<string>()),
            ["Authorization"]           = ("authorization",         new[] { "Roles", "Policies", "Claims" }),
            ["Roles"]                   = ("roles",                 Array.Empty<string>()),
            ["Policies"]                = ("policies",              Array.Empty<string>()),
            ["Claims"]                  = ("claims",                Array.Empty<string>()),
            ["Encryption"]              = ("encryption",            Array.Empty<string>()),
            ["CORS"]                    = ("cors",                  Array.Empty<string>()),
            [".NET"]                    = ("dotnet",                new[] { "ASP.NET Core", "Entity Framework Core" }),
            ["ASP.NET Core"]            = ("aspnet-core",           Array.Empty<string>()),
            ["Entity Framework Core"]   = ("ef-core",               Array.Empty<string>()),
            ["Angular"]                 = ("angular",               new[] { "Components", "RxJS" }),
            ["Components"]              = ("components",            Array.Empty<string>()),
            ["RxJS"]                    = ("rxjs",                  Array.Empty<string>()),
            ["System Design"]           = ("system-design",         new[] { "High-Level Design", "Low-Level Design", "Scalability" }),
            ["High-Level Design"]       = ("hld",                   Array.Empty<string>()),
            ["Low-Level Design"]        = ("lld",                   Array.Empty<string>()),
            ["Scalability"]             = ("scalability",           Array.Empty<string>()),
        };

        var seedCategories = new List<Category>();
        var assignedIds = new Dictionary<string, int>();
        var nextId = 1;

        var allChildren = categoryTree.Values.SelectMany(x => x.Children).ToHashSet();
        var rootCategories = categoryTree.Keys.Where(c => !allChildren.Contains(c)).ToList();

        foreach (var root in rootCategories)
            AddCategoryTree(root, null, categoryTree, assignedIds, seedCategories, ref nextId);

        return seedCategories;
    }

    private static void AddCategoryTree(
        string categoryName,
        int? parentId,
        IReadOnlyDictionary<string, (string Slug, IReadOnlyList<string> Children)> categoryTree,
        IDictionary<string, int> assignedIds,
        ICollection<Category> seedCategories,
        ref int nextId)
    {
        if (!assignedIds.TryAdd(categoryName, nextId)) return;

        var currentId = nextId++;
        var (slug, children) = categoryTree.TryGetValue(categoryName, out var val)
            ? val : (categoryName.ToLower().Replace(" ", "-"), Array.Empty<string>() as IReadOnlyList<string>);

        seedCategories.Add(new Category { Id = currentId, Name = categoryName, Slug = slug, ParentId = parentId });

        foreach (var child in children)
            AddCategoryTree(child, currentId, categoryTree, assignedIds, seedCategories, ref nextId);
    }
}

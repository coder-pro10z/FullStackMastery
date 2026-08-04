---
id: "QuestionService"
type: "service-impl"
domain: "Backend"
layer: "Infrastructure"
module: "Questions"
feature:
  - "[[Feature Question Bank]]"
technology: ".NET 8"
framework: "EF Core 8"
language: "C#"
project: "InterviewPrepApp.Infrastructure"
namespace: "InterviewPrepApp.Infrastructure.Services"
api_endpoint: ""
database_table: "Questions | Answers | UserProgresses | Categories"
depends_on:
  - "[[ApplicationDbContext]]"
  - "[[Question]]"
  - "[[UserProgress]]"
  - "[[Category]]"
used_by:
  - "[[IQuestionService]]"
implements:
  - "[[IQuestionService]]"
calls:
  - "[[ApplicationDbContext]]"
related_to:
  - "[[IQuestionService]]"
status: "implemented"
tags:
  - backend/service
  - feature/question-bank
---

# Service: QuestionService

## Overview
Infrastructure service executing data operations for questions. Implements `[[IQuestionService]]` and queries database tables through `[[ApplicationDbContext]]`.

## Key Implementations

### 1. `GetQuestionsAsync`
Queries questions from the `[[QuestionsTable]]`, applying filters and mappings:
* **AsNoTracking**: Used to optimize query performance for read-only listings.
* **Category Tree Filter**: Resolves child categories recursively to include sub-category records when querying a parent category.
* **Text Filters**: Matches search strings against `QuestionText` or `Title`.
* **Tag Checks**: Matches specified roles to tags associated with the questions.
* **Progress Lookup**: If a `userId` is present, joins with `[[UserProgressesTable]]` to append `IsSolved` and `IsRevision` states to the DTO payload.
* **Includes**: Eagerly loads related `Category`, `Answer`, and `QuestionTags` properties to prevent N+1 query execution bottlenecks.

### 2. Recursive Category Lookup (`GetCategoryIdsAsync`)
Walks down self-referencing category paths recursively using hierarchical queries:
```csharp
private async Task<List<int>> GetCategoryIdsAsync(int categoryId, CancellationToken cancellationToken)
{
    var ids = new List<int> { categoryId };
    var childIds = await _context.Categories
        .AsNoTracking()
        .Where(c => c.ParentId == categoryId)
        .Select(c => c.Id)
        .ToListAsync(cancellationToken);

    foreach (var childId in childIds)
    {
        ids.AddRange(await GetCategoryIdsAsync(childId, cancellationToken));
    }
    return ids;
}
```

---

## 🔗 Architecture Graph Relations

* **Implements**: `[[IQuestionService]]`
* **Injects**: `[[ApplicationDbContext]]`
* **Queries Entities**: `[[Question]]`, `[[Category]]`, `[[UserProgress]]`

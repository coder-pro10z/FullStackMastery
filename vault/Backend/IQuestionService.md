---
id: "IQuestionService"
type: "service-interface"
domain: "Backend"
layer: "Application"
module: "Questions"
feature:
  - "[[Feature Question Bank]]"
technology: ".NET 8"
framework: "Clean Architecture"
language: "C#"
project: "InterviewPrepApp.Application"
namespace: "InterviewPrepApp.Application.Interfaces"
api_endpoint: ""
database_table: ""
depends_on: []
used_by:
  - "[[QuestionsController]]"
implements: []
calls: []
related_to:
  - "[[QuestionService]]"
status: "implemented"
tags:
  - backend/interface
  - feature/question-bank
---

# Interface: IQuestionService

## Overview
Defines the contract for querying question lists with hierarchical scopes, paging, and user-specific status checks. Decoupled from EF Core or data persistence structures.

## Contract Definition
```csharp
public interface IQuestionService
{
    Task<PagedResponse<QuestionDto>> GetQuestionsAsync(
        int? categoryId = null,
        string? searchTerm = null,
        Difficulty? difficulty = null,
        string? role = null,
        int pageNumber = 1,
        int pageSize = 20,
        string? userId = null,
        CancellationToken cancellationToken = default);
}
```

---

## 🔗 Architecture Graph Relations

* **Implemented By**: `[[QuestionService]]` (Infrastructure service implementation)
* **Used By**: `[[QuestionsController]]` (API layer controller)

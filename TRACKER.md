Here's a comprehensive tracker table based on the TRD and PRD. Use this to track progress and guide further development.

---

# 📊 Project Tracker – Full Stack .NET + Angular Interview Prep Platform

## Legend
- ✅ **Done** – implemented and tested  
- 🔄 **In Progress** – partially done or under review  
- ⏳ **Pending** – not started  
- 🚫 **Out of Scope** – for future phases  

---

## 1. Backend – Domain Layer (`InterviewPrepApp.Domain`)

| Component | Status | Notes |
|-----------|--------|-------|
| `Difficulty` enum | ✅ | Defined (Easy, Medium, Hard) |
| `Category` entity | ✅ | Self-referencing, proper navigation |
| `Question` entity | ✅ | All properties, enums, relations |
| `ApplicationUser` (extends IdentityUser) | ✅ | Includes `UserProgresses` |
| `UserProgress` entity | ✅ | Composite key, IsSolved, IsRevision |
| `Result<T>` class (shared) | ✅ | In `Domain.Shared` |
| `IExcelExtractor` interface | ✅ | Moved to Application layer |

---

## 2. Backend – Infrastructure Layer (`InterviewPrepApp.Infrastructure`)

| Component | Status | Notes |
|-----------|--------|-------|
| `ApplicationDbContext` | ✅ | Inherits `IdentityDbContext`, configures relationships |
| Self-referencing Category (DeleteBehavior.Restrict) | ✅ | Configured |
| UserProgress composite key | ✅ | Configured |
| Database seeding (categories) | ✅ | Flexible dictionary-based seeder |
| Migrations | ✅ | Initial migration applied |
| `ExcelExtractionService` | ✅ | Handles merged cells, Category column, Role fallback |
| ClosedXML integration | ✅ | NuGet added |
| Register services in DI | ✅ | `AddScoped<IExcelExtractor, ExcelExtractionService>()` |

---

## 3. Backend – Application Layer (`InterviewPrepApp.Application`)

| Component | Status | Notes |
|-----------|--------|-------|
| DTOs – `CategoryTreeDto` | ⏳ | Needed for tree view |
| DTOs – `CategoryFlatDto` | ✅ | Used for admin dropdown |
| DTOs – `QuestionDto` | ⏳ | For API responses |
| DTOs – `ProgressSummaryDto` | ⏳ | Dashboard stats |
| DTOs – `FileValidationResult` | ⏳ | For import feedback |
| DTOs – `PagedResponse<T>` | ⏳ | For paginated questions |
| Interfaces – `ICategoryService` | ⏳ | `GetTreeAsync()` |
| Interfaces – `IQuestionService` | ⏳ | Filtering, pagination |
| Interfaces – `IUserProgressService` | ⏳ | Toggle solved/revision, summary |
| Services – `CategoryService` | ⏳ | Implement tree building |
| Services – `QuestionService` | ⏳ | Query with filters |
| Services – `UserProgressService` | ⏳ | Update user progress |

---

## 4. Backend – API Layer (`InterviewPrepApp.Api`)

| Component | Status | Notes |
|-----------|--------|-------|
| JWT Authentication | ✅ | Configured in `Program.cs` |
| CORS policy (Angular) | ✅ | Allows `http://localhost:4200` |
| Global Exception Handler (`IExceptionHandler`) | ⏳ | RFC 7807 ProblemDetails |
| `AuthController` – Register/Login | ⏳ | Returns JWT |
| `CategoriesController` – tree endpoint | ⏳ | `GET /api/categories/tree` |
| `QuestionsController` – paged endpoint | ⏳ | `GET /api/questions?categoryId=...` |
| `UserProgressController` – summary & toggles | ⏳ | `[Authorize]` endpoints |
| `AdminController` – import questions | ✅ | `POST /api/admin/import-questions` |
| `AdminController` – category management | ⏳ | CRUD for categories (optional) |
| Debug endpoints (temporary) | ✅ | `/debug-categories`, `/debug-questions` |

---

## 5. Frontend – Angular (`src/app`)

### Core (`core/`)

| Component | Status | Notes |
|-----------|--------|-------|
| `auth.guard.ts` | ⏳ | Protect routes, check JWT |
| `auth.interceptor.ts` | ⏳ | Attach Bearer token |
| Models (interfaces) | ⏳ | `CategoryTreeDto`, `QuestionDto`, etc. |
| Services – `AuthService` | ⏳ | Login, register |
| Services – `CategoryService` | ⏳ | Fetch tree, flat list |
| Services – `QuestionService` | ⏳ | Get questions (paged, filtered) |
| Services – `ProgressService` | ⏳ | Summary, toggles |
| Services – `AdminService` | ✅ | Import questions, category management |

### Shared Components (`shared/components/`)

| Component | Status | Notes |
|-----------|--------|-------|
| `SidebarComponent` | ⏳ | Recursive category tree |
| `ProgressCardComponent` | ⏳ | Shows solved counts |
| `QuestionBadgeComponent` | ⏳ | Role/difficulty pills |
| `ActionToggleComponent` | ⏳ | Solved/revision icons |
| `FilterBarComponent` | ⏳ | Search, dropdowns |

### Features (`features/`)

| Component | Status | Notes |
|-----------|--------|-------|
| `DashboardComponent` | ⏳ | Main user dashboard |
| `QuestionTableComponent` | ⏳ | Expandable rows for answers |
| `LoginComponent` | ⏳ | Auth form |
| `RegisterComponent` | ⏳ | Registration form |
| `AdminDashboardComponent` | ✅ | File upload, category dropdown |
| `CategoryManagementComponent` | ⏳ | Add/edit/delete categories (if needed) |

### Layouts (`layouts/`)

| Component | Status | Notes |
|-----------|--------|-------|
| `AppLayoutComponent` | ⏳ | Sidebar + main content |
| `AdminLayoutComponent` | ⏳ | Admin navigation |

### Routing & Config

| Component | Status | Notes |
|-----------|--------|-------|
| `app.routes.ts` | ⏳ | Define all routes, guards |
| `app.config.ts` | ⏳ | Provide HttpClient, interceptors |
| `environment.ts` | ⏳ | Store API base URL |

---

## 6. Excel Import Enhancements (Recent Work)

| Feature | Status | Notes |
|---------|--------|-------|
| Two‑row format with merged cells | ✅ | Handled by `IsCellEmptyForAnswer` |
| Category column with hierarchical paths | ✅ | Supports `->` and `/` |
| Role column fallback (as category name) | ✅ | Used if no Category column |
| Conditional default category validation | ✅ | Only validated when needed |

---

## 7. Remaining High‑Priority Tasks (Next Steps)

| Task | Priority | Notes |
|------|----------|-------|
| Implement `ICategoryService` + `CategoryService` | High | Needed for sidebar tree |
| Create `CategoriesController` with `/tree` | High | API for frontend |
| Implement `IQuestionService` + `QuestionsController` | High | Filtering & pagination |
| Add `UserProgressController` with toggles | High | Track solved/revision |
| Build `AuthController` (register/login) | High | JWT generation |
| Add global exception handler | Medium | Consistent error responses |
| Start Angular – core services & models | Medium | Connect to API |
| Create reusable shared components | Medium | Sidebar, cards, etc. |
| Implement dashboard UI with question table | Medium | User facing |

---

## 8. Out of Scope (Phase 2+)

| Feature | Reason |
|---------|--------|
| AI Interview Copilot | Phase 2 |
| Resume Analyzer | Phase 2 |
| Payments / Monetization | Phase 3 |
| Social features (leaderboards, comments) | Phase 3 |
| Code execution (IDE) | Phase 3 |

---

**Instructions for the Agent:**  
- Update this tracker after completing each task.  
- Focus on **High Priority** tasks first (backend foundation).  
- Keep code aligned with the TRD’s architectural rules (no CQRS/MediatR, Result pattern, etc.).  
- When starting Angular, follow the provided folder structure and use standalone components.  

Let me know if you need details on any pending item!
---

🚀 Next Step – Generate APP-01 (Core DTOs)
I'll now provide the code for the Core DTOs to clear the first bottleneck. After that, we can proceed with CategoryService, QuestionService, etc.

1. CategoryTreeDto – for hierarchical categories
csharp
// InterviewPrepApp.Application/DTOs/CategoryTreeDto.cs
namespace InterviewPrepApp.Application.DTOs
{
    public class CategoryTreeDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public List<CategoryTreeDto> SubCategories { get; set; } = new();
    }
}
2. QuestionDto – for API responses
csharp
// InterviewPrepApp.Application/DTOs/QuestionDto.cs
using InterviewPrepApp.Domain.Enums;

namespace InterviewPrepApp.Application.DTOs
{
    public class QuestionDto
    {
        public int Id { get; set; }
        public string? Title { get; set; }
        public string QuestionText { get; set; } = string.Empty;
        public string? AnswerText { get; set; }
        public Difficulty Difficulty { get; set; }
        public string Role { get; set; } = string.Empty;
        public int CategoryId { get; set; }
        public string CategoryName { get; set; } = string.Empty; // optional, for display
        public bool IsSolved { get; set; }      // for authenticated user
        public bool IsRevision { get; set; }    // for authenticated user
    }
}
3. PagedResponse<T> – generic wrapper
csharp
// InterviewPrepApp.Application/DTOs/PagedResponse.cs
namespace InterviewPrepApp.Application.DTOs
{
    public class PagedResponse<T>
    {
        public IEnumerable<T> Data { get; set; } = Enumerable.Empty<T>();
        public int TotalRecords { get; set; }
        public int PageNumber { get; set; }
        public int PageSize { get; set; }
        public int TotalPages => (int)Math.Ceiling((double)TotalRecords / PageSize);
    }
}
4. ProgressSummaryDto – dashboard stats
csharp
// InterviewPrepApp.Application/DTOs/ProgressSummaryDto.cs
namespace InterviewPrepApp.Application.DTOs
{
    public class ProgressSummaryDto
    {
        public int TotalQuestions { get; set; }
        public int TotalSolved { get; set; }

        public int EasyTotal { get; set; }
        public int EasySolved { get; set; }

        public int MediumTotal { get; set; }
        public int MediumSolved { get; set; }

        public int HardTotal { get; set; }
        public int HardSolved { get; set; }
    }
}
5. (Optional) FileValidationResult – if you want structured import feedback
csharp
// InterviewPrepApp.Application/DTOs/FileValidationResult.cs
namespace InterviewPrepApp.Application.DTOs
{
    public class FileValidationResult
    {
        public bool IsValid { get; set; }
        public List<string> Errors { get; set; } = new();
        public string? DetectedFormat { get; set; }
        public int ExpectedRowCount { get; set; }
    }
}
📝

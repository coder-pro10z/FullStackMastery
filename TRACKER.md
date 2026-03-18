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
| DTOs – `CategoryTreeDto` | ✅ | Added for hierarchical API responses |
| DTOs – `CategoryFlatDto` | ✅ | Added for flat dropdown/list use cases |
| DTOs – `QuestionDto` | ✅ | Added application contract for question APIs |
| DTOs – `ProgressSummaryDto` | ✅ | Added dashboard/progress summary contract |
| DTOs – `FileValidationResult` | ✅ | Added structured import validation model |
| DTOs – `PagedResponse<T>` | ✅ | Added generic pagination wrapper |
| Interfaces – `ICategoryService` | ✅ | Added tree + flat list contract |
| Interfaces – `IQuestionService` | ✅ | Added filtered/paginated question query contract |
| Interfaces – `IUserProgressService` | ✅ | Added progress summary and toggle contract |
| Services – `CategoryService` | ✅ | EF-backed tree + flat category queries |
| Services – `QuestionService` | ✅ | Added paginated question query with category subtree filters |
| Services – `UserProgressService` | ✅ | Added summary aggregation and solved/revision toggles |

---

## 4. Backend – API Layer (`InterviewPrepApp.Api`)

| Component | Status | Notes |
|-----------|--------|-------|
| JWT Authentication | ✅ | Configured in `Program.cs` |
| CORS policy (Angular) | ✅ | Allows `http://localhost:4200` |
| Global Exception Handler (`IExceptionHandler`) | ✅ | Centralized RFC 7807 `ProblemDetails` responses |
| `AuthController` – Register/Login | ✅ | Added register/login endpoints with JWT responses |
| `CategoriesController` – tree endpoint | ✅ | `GET /api/categories/tree` and `GET /api/categories/flat` |
| `QuestionsController` – paged endpoint | ✅ | `GET /api/questions` with filters and pagination |
| `UserProgressController` – summary & toggles | ✅ | Added authorized summary and toggle endpoints |
| `AdminController` – import questions | ✅ | `POST /api/admin/import-questions` |
| `AdminController` – category management | ⏳ | CRUD for categories (optional) |
| Debug endpoints (temporary) | ✅ | `/debug-categories`, `/debug-questions` |

---

## 5. Frontend – Angular (`src/app`)

### Core (`core/`)

| Component | Status | Notes |
|-----------|--------|-------|
| `auth.guard.ts` | ✅ | Added route protection for authenticated areas |
| `auth.interceptor.ts` | ✅ | Adds Bearer token from local auth session |
| Models (interfaces) | ✅ | Added auth, category, question, progress, and admin models |
| Services – `AuthService` | ✅ | Login, register, local session persistence |
| Services – `CategoryService` | ✅ | Fetch tree and flat category lists |
| Services – `QuestionService` | ✅ | Fetch paged/filtered question data |
| Services – `ProgressService` | ✅ | Fetch summary and toggle progress state |
| Services – `AdminService` | ✅ | Import questions and load category dropdown |

### Shared Components (`shared/components/`)

| Component | Status | Notes |
|-----------|--------|-------|
| `SidebarComponent` | ✅ | Extracted reusable recursive routed category tree |
| `ProgressCardComponent` | ✅ | Extracted solved-count summary card |
| `QuestionBadgeComponent` | ✅ | Added reusable role/difficulty pill component |
| `ActionToggleComponent` | ✅ | Added reusable solved/revision toggle chip |
| `FilterBarComponent` | ✅ | Added search, difficulty, and role filters |
| `SubCategoryNavComponent` | ✅ | Added horizontal sub-category pill navigation below progress cards |

### Features (`features/`)

| Component | Status | Notes |
|-----------|--------|-------|
| `DashboardComponent` | ✅ | Added baseline dashboard page with summary and question table |
| `QuestionTableComponent` | ✅ | Added baseline question list table |
| `LoginComponent` | ✅ | Added standalone login form |
| `RegisterComponent` | ✅ | Added standalone registration form |
| `AdminDashboardComponent` | ✅ | Added standalone import form and category dropdown |
| `CategoryManagementComponent` | ⏳ | Add/edit/delete categories (if needed) |

### Layouts (`layouts/`)

| Component | Status | Notes |
|-----------|--------|-------|
| `AppLayoutComponent` | ✅ | Added app shell with category sidebar |
| `AdminLayoutComponent` | ✅ | Added admin shell and navigation actions |

### Routing & Config

| Component | Status | Notes |
|-----------|--------|-------|
| `app.routes.ts` | ✅ | Added guarded app, auth, and admin routes |
| `app.config.ts` | ✅ | Added router and HttpClient with auth interceptor |
| `environment.ts` | ✅ | Configured API base URL |

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
| Implement `ICategoryService` + `CategoryService` | ✅ | Completed with EF-backed tree + flat queries |
| Create `CategoriesController` with `/tree` | ✅ | `tree` and `flat` endpoints added |
| Implement `IQuestionService` + `QuestionsController` | ✅ | Completed with pagination, search, role, difficulty, and category subtree filters |
| Add `UserProgressController` with toggles | ✅ | Added summary, toggle-solved, and toggle-revision endpoints |
| Build `AuthController` (register/login) | ✅ | Added JWT-based register/login flow |
| Add `UserProgressController` with toggles | High | Track solved/revision |
| Build `AuthController` (register/login) | High | JWT generation |
| Add global exception handler | Medium | Consistent error responses |
| Start Angular – core services & models | Medium | Connect to API |
| Create reusable shared components | ✅ | Sidebar, progress cards, badges, toggles, and filter bar extracted and wired |
| Extract reusable `SidebarComponent` with recursive routed tree | ✅ | Completed and moved out of `AppLayoutComponent` |
| Eliminate full table reload on progress toggles | MAX | Update local question/progress state without refetching the questions list |
| Compact responsive dashboard layout | MAX | Reduce spacing and density so cards, filters, and rows fit cleanly |
| Replace tablet table with stacked mobile cards | MAX | Prevent 768px layout breakage by switching away from dense table columns |
| Root-category sidebar + sub-category top nav | MAX | Keep sidebar minimal and move child-category navigation into a horizontal pill bar |
| Expand question table interactions | High | Answer expansion and richer row interactions still pending after compact/mobile refactor |
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
---
Added the global exception handler in GlobalExceptionHandler.cs and wired it in Program.cs with AddProblemDetails(), AddExceptionHandler<...>(), and UseExceptionHandler(). Unhandled exceptions now return centralized RFC 7807 ProblemDetails responses, with basic status mapping for 400, 401, 404, and 500.

I updated Tracker.md to mark that API item complete. Verification passed with:
dotnet build src\InterviewPrepApp.Api\InterviewPrepApp.Api.csproj -p:OutDir=bin\VerifyBuild\
The only remaining build issue is still the existing nullable warning in ExcelExtractionService.cs (line 43).

The next real step is the Angular baseline, but the current frontend workspace is not set up enough to build yet: frontend/package.json, frontend/src/main.ts, and frontend/src/app/app.config.ts are still stubs. I can take the next pass on that and scaffold the core Angular app properly.



# Technical Requirements Document (TRD)

**Product Name:** Interview Preparation Platform
**Version:** 2.0 (Aligned to Current Implementation)
**Date:** March 2026

> This TRD reflects the **actual implemented architecture** plus specifications for planned Phase 2 modules (CheatSheet, Quiz).

---

## 1. Implemented Architecture Overview

### 1.1 Technology Stack (Actual)

| Layer | Technology |
|-------|-----------|
| Backend Framework | .NET 8 Web API (ASP.NET Core) |
| Database | Microsoft SQL Server |
| ORM | Entity Framework Core 8 (Code-First) |
| Authentication | ASP.NET Core Identity + JWT Bearer |
| File Parsing | ClosedXML (Excel import) |
| Frontend Framework | Angular 17+ (Standalone Components) |
| Styling | Custom CSS (dark SaaS theme — **not Tailwind** as originally scoped) |
| API Documentation | Swagger / OpenAPI (Development only) |

> **Design Reality:** The TRD originally specified Tailwind CSS (`#121212` dark mode). The implementation uses a custom CSS system with equivalent dark aesthetics. All future work should preserve this custom CSS approach unless a formal migration to Tailwind is decided.

### 1.2 Architectural Rules (Enforced)

- ✅ **4-Layer Clean Architecture:** Domain → Application → Infrastructure → Api
- ✅ **No MediatR / CQRS** — Standard interface-based DI services only
- ✅ **Result`<T>` pattern** — Service returns never throw business exceptions
- ✅ **EF Core Code-First** — No raw SQL in production paths
- ✅ **Angular Standalone Components** — No NgModules

---

## 2. Solution Structure (Actual)

```
InterviewPrepApp/
├── src/
│   ├── InterviewPrepApp.Domain/
│   │   ├── Entities/ (Question, Answer, Category, AuditLog, QuestionVersion, ApplicationUser, UserProgress)
│   │   ├── Enums/ (Difficulty, QuestionStatus, CheatSheetResourceType*)
│   │   └── Shared/ (Result<T>)
│   ├── InterviewPrepApp.Application/
│   │   ├── Interfaces/ (ICategoryService, IQuestionService, IUserProgressService,
│   │   │               IAdminDashboardService, IQuestionImportService, IAuditLogService)
│   │   └── DTOs/ (Admin/, Category/, Progress/, Shared/)
│   ├── InterviewPrepApp.Infrastructure/
│   │   ├── Persistence/ (ApplicationDbContext, DatabaseSeeder, Configurations/)
│   │   ├── Migrations/
│   │   └── Services/ (CategoryService, QuestionService, UserProgressService,
│   │                  ExcelExtractionService, AdminDashboardService, AuditLogService)
│   └── InterviewPrepApp.Api/
│       ├── Controllers/
│       │   ├── Admin/ (AdminQuestionsController, AdminCategoriesController,
│       │   │           AdminDashboardController, AdminImportController)
│       │   ├── AuthController
│       │   ├── CategoriesController
│       │   ├── QuestionsController
│       │   └── UserProgressController
│       ├── Middleware/ (AuditLogMiddleware, RateLimitingMiddleware*)
│       └── Infrastructure/ (GlobalExceptionHandler)
├── frontend/
│   └── src/app/
│       ├── core/ (guards, interceptors, models, services)
│       ├── shared/components/ (action-toggle, filter-bar, progress-card,
│       │                        question-badge, sub-category-nav)
│       ├── features/ (auth/login, auth/register, dashboard/, admin/)
│       └── layouts/ (app-layout/, admin-layout/)
└── docs/

  * = Planned but not yet implemented
```

---

## 3. Domain Model (Actual)

### 3.1 Core Entities

| Entity | Status | Key Properties |
|--------|--------|---------------|
| `Category` | ✅ | Self-referencing (`ParentId`), `Slug`, `SortOrder` |
| `Question` | ✅ | Soft-delete (`IsDeleted`, `DeletedAt`), `Status`, `CreatedByUserId` |
| `Answer` | ✅ | 1:1 with Question, `MarkdownContent` |
| `UserProgress` | ✅ | Composite PK `(UserId, QuestionId)`, `IsSolved`, `IsRevision` |
| `ApplicationUser` | ✅ | Inherits `IdentityUser` |
| `AuditLog` | ✅ | Immutable, append-only, JSON snapshots |
| `QuestionVersion` | ✅ | Append-only history with question/answer snapshots |

### 3.2 EF Core Rules (Actual)

- `Category.ParentId` → `DeleteBehavior.Restrict` (no cascade)
- `UserProgress` composite PK: `(UserId, QuestionId)`
- `Question` → global query filter: `WHERE IsDeleted = 0`
- `QuestionVersion` → `DeleteBehavior.Cascade` from Question
- Indexes: `CategoryId`, `IsDeleted+Status`, `Difficulty`

---

## 4. API Surface (Actual)

### 4.1 Authentication
| Method | Endpoint | Auth | Notes |
|--------|----------|------|-------|
| POST | `/api/auth/register` | Public | Creates user, returns JWT |
| POST | `/api/auth/login` | Public | Returns JWT + roles |

### 4.2 Categories
| Method | Endpoint | Auth | Notes |
|--------|----------|------|-------|
| GET | `/api/categories/tree` | Public | Nested tree |
| GET | `/api/categories/flat` | Public | Flat list for dropdowns |

### 4.3 Questions
| Method | Endpoint | Auth | Notes |
|--------|----------|------|-------|
| GET | `/api/questions` | Public/Auth | `[FromQuery]` categoryId, role, difficulty, searchTerm, pageNumber, pageSize |

### 4.4 User Progress
| Method | Endpoint | Auth | Notes |
|--------|----------|------|-------|
| GET | `/api/userprogress/summary` | `[Authorize]` | Per-user stats |
| POST | `/api/userprogress/{id}/toggle-solved` | `[Authorize]` | Flip solved state |
| POST | `/api/userprogress/{id}/toggle-revision` | `[Authorize]` | Flip revision state |

### 4.5 Admin — Questions
| Method | Endpoint | Auth | Notes |
|--------|----------|------|-------|
| GET | `/api/admin/questions` | Admin | Paged with all filters |
| POST | `/api/admin/questions` | Admin | Create new question |
| PUT | `/api/admin/questions/{id}` | Admin | Update question |
| DELETE | `/api/admin/questions/{id}` | Admin | Soft-delete |
| POST | `/api/admin/questions/{id}/restore` | Admin | Restore soft-deleted |
| GET | `/api/admin/questions/{id}/versions` | Admin | Version history |

### 4.6 Admin — Categories
| Method | Endpoint | Auth | Notes |
|--------|----------|------|-------|
| GET | `/api/admin/categories/tree` | Admin | Full tree |
| POST | `/api/admin/categories` | Admin | Create category |
| DELETE | `/api/admin/categories/{id}` | Admin | Delete (guarded) |

### 4.7 Admin — Import & Dashboard
| Method | Endpoint | Auth | Notes |
|--------|----------|------|-------|
| POST | `/api/admin/import-questions` | Admin | Excel `.xlsx` upload |
| GET | `/api/admin/dashboard/stats` | Admin | Platform-wide statistics |
| GET | `/api/admin/dashboard/audit-logs` | Admin | Audit log listing |

> **Security Gap (Action Required):** Admin endpoints currently use `[Authorize]` but not `[Authorize(Roles = "Admin")]`. Full role enforcement must be enabled.

---

## 5. Frontend Architecture (Actual)

### 5.1 Routing (Actual — differs from original TRD)

| Path | Component | Guard | Notes |
|------|-----------|-------|-------|
| `/login` | `LoginComponent` | `redirectIfLoggedIn` | |
| `/register` | `RegisterComponent` | `redirectIfLoggedIn` | |
| `/` | `AppLayoutComponent` → `DashboardPageComponent` | `authGuard` | TRD expected `/dashboard` |
| `/admin` | `AdminLayoutComponent` → `AdminDashboardComponent` | `authGuard` | Role guard not yet added |

> **Route Reality:** Original TRD specified `/dashboard`. Actual implementation uses `/` with redirect. Both achieve the same user experience.

### 5.2 Component Inventory (Actual)

| Component | Type | Status |
|-----------|------|--------|
| `AppLayoutComponent` | Layout | ✅ |
| `AdminLayoutComponent` | Layout | ✅ |
| `SidebarComponent` | Shared | ✅ Root categories + collapsible |
| `SubCategoryNavComponent` | Shared | ✅ Horizontal pills |
| `ProgressCardComponent` | Shared | ✅ |
| `QuestionBadgeComponent` | Shared | ✅ |
| `ActionToggleComponent` | Shared | ✅ |
| `FilterBarComponent` | Shared | ✅ |
| `DashboardPageComponent` | Feature | ✅ |
| `QuestionTableComponent` | Feature | ✅ |
| `LoginComponent` | Feature | ✅ |
| `RegisterComponent` | Feature | ✅ |
| `AdminDashboardComponent` | Feature | ✅ |

---

## 6. Planned Module Specifications (Phase 2)

### 6.1 CheatSheet Module (Planned)

**Principle:** Non-breaking addition. Zero changes to existing `Question`/`Answer` domain.

#### Backend
```
Domain:
  CheatSheetResource { Id, Title, Type (enum), Url?, MarkdownContent?, CategoryId, DisplayOrder, IsDeleted }
  CheatSheetResourceType { Pdf=1, Markdown=2, ExternalLink=3 }

Application:
  ICheatSheetService { GetByCategoryAsync(categoryId), CreateAsync(dto), DeleteAsync(id) }
  CheatSheetResourceDto, CreateCheatSheetDto

API:
  GET  /api/resources?categoryId=
  POST /api/admin/resources     [Authorize(Roles = "Admin")]
  DELETE /api/admin/resources/{id}  [Authorize(Roles = "Admin")]
```

#### Frontend
```
features/cheatsheet/cheatsheet-page.component.ts
shared/components/resource-card/resource-card.component.ts
core/services/cheatsheet.service.ts
Route: /cheatsheets (under AppLayoutComponent, authGuard)
Sidebar: fixed nav entry above category tree
```

### 6.2 Quiz Module (Planned)

**Principle:** Read-only reference to existing QA bank. The quiz domain NEVER modifies `Question` or `Answer` entities.

#### Backend
```
Domain (New Entities):
  QuizAttempt { Id, UserId, Mode (Mock|Real), StartedAt, CompletedAt, Score, TimeLimitSeconds }
  QuizQuestion { Id, QuizAttemptId, OriginalQuestionId }  ← bridge entity
  QuizUserAnswer { Id, QuizQuestionId, SelectedAnswerOptionId }
  QuizMode enum { Mock=1, Real=2 }

Application:
  IQuizGeneratorService { GenerateAsync(categoryId, difficulty, count, mode) }
  IScoringService { ScoreAsync(attemptId) }
  QuizAttemptDto, QuizQuestionDto (masked for Real mode), QuizResultDto

API:
  POST /api/quizzes/start
  POST /api/quizzes/attempts/{id}/answers   (Mock mode partial submit)
  POST /api/quizzes/attempts/{id}/submit    (Final submission)
  GET  /api/quizzes/attempts/{id}/result
```

#### Frontend
```
features/quiz/quiz-dashboard.component.ts  (config/start)
features/quiz/quiz-player.component.ts     (question display, timer, navigation)
features/quiz/quiz-review.component.ts     (score, breakdown, review)
core/services/quiz.service.ts
Route: /quiz (under AppLayoutComponent, authGuard)
```

---

## 7. Validation Strategy

| Current | Planned |
|---------|---------|
| Ad hoc null checks in services | FluentValidation for all DTOs |
| Basic file size/extension check on import | Structured validation with per-row error reporting |
| No request rate limiting | ASP.NET Core rate limiting middleware |

---

## 8. Security Requirements

| Requirement | Status | Action |
|-------------|--------|--------|
| JWT Bearer auth | ✅ | — |
| Admin role enforcement on API | 🔄 | Enable `[Authorize(Roles = "Admin")]` on all admin controllers |
| Frontend `adminGuard` | ⏳ | Build guard reading `roles` claim from auth state |
| JWT secret in environment variable | ⏳ | Move from `appsettings.json` to secrets/env |
| Default admin account dev-only | ⏳ | Wrap creation in environment check |
| Identity lockout + password policy | ⏳ | Configure ASP.NET Identity options |

---

## 9. Error Handling

- Global handler: `.NET 8 IExceptionHandler` returning RFC 7807 `ProblemDetails`
- Service layer: `Result<T>` pattern (no thrown business exceptions)
- Frontend: Angular error handling per service (basic); toast system ⏳ planned

# 📊 Project Tracker — Full Stack Interview Preparation Platform

> **Version:** 2.0 | **Last Updated:** March 2026

## Legend

- ✅ **Done** — implemented and tested
- 🔄 **In Progress** — partially done or under review
- ⏳ **Pending** — not started
- 🚫 **Out of Scope** — deferred to future phases

---

## 1. Backend — Domain Layer (`InterviewPrepApp.Domain`)

| Component | Status | Notes |
|-----------|--------|-------|
| `Difficulty` enum | ✅ | Easy, Medium, Hard |
| `Category` entity | ✅ | Self-referencing tree with `ParentId` |
| `Question` entity | ✅ | All properties, soft delete, versioning |
| `Answer` entity | ✅ | 1:1 with Question, Markdown content |
| `ApplicationUser` (IdentityUser) | ✅ | Includes `UserProgresses` |
| `UserProgress` entity | ✅ | Composite key `(UserId, QuestionId)` |
| `Result<T>` class | ✅ | In `Domain.Shared` |
| `AuditLog` entity | ✅ | Immutable append-only log |
| `QuestionVersion` entity | ✅ | Append-only version history |
| `QuestionStatus` enum | ✅ | Draft, Published |

---

## 2. Backend — Infrastructure Layer (`InterviewPrepApp.Infrastructure`)

| Component | Status | Notes |
|-----------|--------|-------|
| `ApplicationDbContext` | ✅ | Inherits `IdentityDbContext<ApplicationUser>` |
| Self-referencing Category (`DeleteBehavior.Restrict`) | ✅ | Configured |
| `UserProgress` composite key | ✅ | Configured |
| Soft-delete query filters | ✅ | `Question.IsDeleted` global filter |
| Database seeding (categories) | ✅ | Dictionary-based hierarchical seeder |
| Migrations (`InitialCreate` + `AddAdminTables`) | ✅ | Applied |
| `ExcelExtractionService` | ✅ | Merged cells, Category column, Role fallback |
| `CategoryService` | ✅ | Tree + flat queries |
| `QuestionService` | ✅ | Paginated, filtered, subtree-aware |
| `UserProgressService` | ✅ | Summary aggregation + toggles |
| ClosedXML integration | ✅ | NuGet added |
| DI service registration | ✅ | All services registered |

---

## 3. Backend — Application Layer (`InterviewPrepApp.Application`)

| Component | Status | Notes |
|-----------|--------|-------|
| `CategoryTreeDto` / `CategoryFlatDto` | ✅ | Hierarchical + flat responses |
| `QuestionDto` / `QuestionAdminDto` | ✅ | User-facing + admin DTOs |
| `CreateQuestionDto` / `UpdateQuestionDto` | ✅ | Admin CRUD DTOs |
| `ImportQuestionDto` | ✅ | Bulk import DTO |
| `DashboardStatsDto` | ✅ | Admin dashboard statistics |
| `AuditLogDto` | ✅ | Audit trail DTO |
| `ProgressSummaryDto` | ✅ | Dashboard progress stats |
| `FileValidationResult` | ✅ | Structured import validation |
| `PagedResponse<T>` | ✅ | Generic pagination wrapper |
| `ICategoryService` | ✅ | Tree + flat list contract |
| `IQuestionService` | ✅ | Filtered/paginated queries |
| `IUserProgressService` | ✅ | Progress summary + toggles |
| `IAdminDashboardService` | ✅ | Admin stats contract |
| `IQuestionImportService` | ✅ | Import pipeline contract |
| `IAuditLogService` | ✅ | Audit trail contract |
| FluentValidation setup | ⏳ | Planned for input validation |

---

## 4. Backend — API Layer (`InterviewPrepApp.Api`)

| Component | Status | Notes |
|-----------|--------|-------|
| JWT Authentication | ✅ | Configured in `Program.cs` |
| CORS policy (`localhost:4200`) | ✅ | Configured |
| Global Exception Handler (`IExceptionHandler`) | ✅ | RFC 7807 `ProblemDetails` |
| Swagger with Bearer auth | ✅ | Development environment |
| `AuthController` — Register/Login | ✅ | JWT-based auth flow |
| `CategoriesController` — `/tree`, `/flat` | ✅ | Public endpoints |
| `QuestionsController` — filtered + paged | ✅ | `[FromQuery]` params |
| `UserProgressController` — summary + toggles | ✅ | `[Authorize]` protected |
| `AdminController` — import questions | ✅ | Excel upload endpoint |
| `AdminQuestionsController` — CRUD | ✅ | Create, update, soft-delete, restore |
| `AdminCategoriesController` — tree + CRUD | ✅ | Hierarchical management |
| `AdminDashboardController` — stats | ✅ | Dashboard analytics |
| Admin role enforcement `[Authorize(Roles)]` | ✅ | Full role guard on controllers + frontend guard |
| `AdminUsersController` — role assignment | ⏳ | Planned |
| Rate limiting middleware | ⏳ | Planned |
| Debug endpoints | ✅ | `/debug-categories`, `/debug-questions` |

---

## 5. Frontend — Angular Core (`core/`)

| Component | Status | Notes |
|-----------|--------|-------|
| `auth.guard.ts` | ✅ | Route protection |
| `redirect-if-logged-in.guard.ts` | ✅ | Prevents authed users hitting `/login` |
| `auth.interceptor.ts` | ✅ | Bearer token attachment |
| Models (TypeScript interfaces) | ✅ | Auth, category, question, progress, admin |
| `AuthService` | ✅ | Login, register, session persistence |
| `CategoryService` | ✅ | Tree + flat category lists |
| `QuestionService` | ✅ | Paged/filtered question data |
| `ProgressService` | ✅ | Summary + toggle progress |
| `AdminService` | ✅ | Import + category dropdown |
| `AdminApiService` | ✅ | Admin CRUD operations |

---

## 6. Frontend — Shared Components (`shared/components/`)

| Component | Status | Notes |
|-----------|--------|-------|
| `SidebarComponent` | ✅ | Recursive category tree, collapsible |
| `ProgressCardComponent` | ✅ | Dark cards with gradient accents |
| `QuestionBadgeComponent` | ✅ | Role/difficulty pill badges |
| `ActionToggleComponent` | ✅ | Solved/revision toggles with micro-animations |
| `FilterBarComponent` | ✅ | Search, difficulty, role dropdowns |
| `SubCategoryNavComponent` | ✅ | Horizontal scrollable pills |

---

## 7. Frontend — Features (`features/`)

| Component | Status | Notes |
|-----------|--------|-------|
| `DashboardPageComponent` | ✅ | Progress cards + filters + question cards |
| `QuestionTableComponent` | ✅ | Card-based layout with accordion answers |
| `LoginComponent` | ✅ | Dark SaaS-style auth with glow effects |
| `RegisterComponent` | ✅ | Matching dark auth page |
| `AdminDashboardComponent` | ✅ | Drag-drop upload, stats, question CRUD |
| Pagination UI controls | ⏳ | Backend supports it, but UI not yet wired |
| Revision-only filter mode | ⏳ | Toggle exists, workflow not operationalized |
| Answer expand/collapse UX | 🔄 | Basic inline — no deliberate reveal |

---

## 8. Frontend — Layouts, Routing & Config

| Component | Status | Notes |
|-----------|--------|-------|
| `AppLayoutComponent` | ✅ | Sidebar + top navbar + responsive drawer |
| `AdminLayoutComponent` | ✅ | Top navigation + workspace |
| `app.routes.ts` | ✅ | Guarded app, auth, and admin routes |
| `app.config.ts` | ✅ | Router + HttpClient + auth interceptor |
| `environment.ts` | ✅ | API base URL configured |
| Responsive design | ✅ | Desktop / tablet / mobile |
| Loading skeletons | ✅ | Shimmer animations |

---

## 9. CheatSheet Hub Feature *(NEW)*

> Source: [CheetSheet.md](file:///c:/Users/Praveen/Desktop/Interview_PrepApp/docs/CheetSheet.md)

### 9.1 Backend

| Component | Status | Notes |
|-----------|--------|-------|
| `CheatSheetResource` entity | ⏳ | Title, Type, URL, MarkdownContent, CategoryId |
| `CheatSheetResourceType` enum | ⏳ | Pdf, Markdown, ExternalLink |
| DbContext `DbSet` + EF config | ⏳ | FK to Category, indexes, enum conversion |
| `CheatSheetResourceDto` | ⏳ | API response DTO |
| `CreateCheatSheetDto` | ⏳ | Admin creation DTO |
| `ICheatSheetService` interface | ⏳ | GetByCategory, Create, Delete |
| `CheatSheetService` implementation | ⏳ | EF Core backed, filtered by category |
| `ResourcesController` (public) | ⏳ | `GET /api/resources?categoryId=` |
| `AdminResourcesController` | ⏳ | `POST / DELETE /api/admin/resources` |
| EF Migration for new table | ⏳ | `AddCheatSheetResources` |

### 9.2 Frontend

| Component | Status | Notes |
|-----------|--------|-------|
| `CheatSheetPageComponent` | ⏳ | Browse resources by category |
| `ResourceCardComponent` (shared) | ⏳ | Title, type badge, open/download action |
| `CheatSheetService` (Angular) | ⏳ | API calls to `/api/resources` |
| `/cheatsheets` route | ⏳ | Under `AppLayoutComponent` |
| Sidebar navigation link | ⏳ | Fixed nav entry above category tree |
| Admin resources tab | ⏳ | Create/list/delete resources |
| Question table "Resources" link | ⏳ | Lightweight cross-reference |

---

## 10. Quiz & Assessment System *(NEW)*

> Source: [QUIZ.md](file:///c:/Users/Praveen/Desktop/Interview_PrepApp/docs/QUIZ.md)

### 10.1 Backend — Domain

| Component | Status | Notes |
|-----------|--------|-------|
| `QuizAttempt` entity | ⏳ | User session tracking, mode, timer, score |
| `QuizQuestion` entity (bridge) | ⏳ | Links to `OriginalQuestionId` (read-only ref) |
| `QuizUserAnswer` entity | ⏳ | Selected answers per question |
| `QuizMode` enum | ⏳ | Mock, Real |

### 10.2 Backend — Services & API

| Component | Status | Notes |
|-----------|--------|-------|
| `IQuizGeneratorService` | ⏳ | Randomized quiz from QA bank |
| `IScoringService` | ⏳ | Score calculation + analysis |
| `QuizController` | ⏳ | Start, submit, review endpoints |
| Quiz DTO masking (Real Mode) | ⏳ | Strip answers for assessment security |
| Timer validation (backend) | ⏳ | Re-validate client timer on submission |
| Update `UserProgress` on completion | ⏳ | Feed quiz results into progress stats |

### 10.3 Frontend

| Component | Status | Notes |
|-----------|--------|-------|
| Quiz Dashboard (config/start) | ⏳ | Category, difficulty, mode selection |
| Quiz Player Component | ⏳ | Question display, navigation, timer |
| Quiz Reflection/Review Component | ⏳ | Score breakdown, answer review |
| Shared Question Card (`displayContext`) | ⏳ | Context-aware reusable component |
| `/quiz` route | ⏳ | Under `AppLayoutComponent` |
| Quiz API service (Angular) | ⏳ | Start, submit, fetch results |

---

## 11. Improvements & Refactoring

> Source: [Improvements.md](file:///c:/Users/Praveen/Desktop/Interview_PrepApp/docs/Improvements.md)

### 11.1 Security (Tier 1 — Critical)

| Improvement | Status | Notes |
|-------------|--------|-------|
| Admin API role enforcement `[Authorize(Roles = "Admin")]` | ✅ | Done on all admin controllers |
| Frontend `adminGuard` (role-based) | ✅ | Applied adminGuard to admin route |
| Move JWT secret to env/secret store | ✅ | Moved to `.NET User Secrets` / env variables |
| Restrict default admin creation to dev only | ✅ | Wrapped in `IsDevelopment()` check |
| ASP.NET Identity lockout + password policy | ⏳ | No hardening configured |

### 11.2 Feature Completeness (Tier 1–2)

| Improvement | Status | Notes |
|-------------|--------|-------|
| Dashboard pagination UI | ✅ | Backend supports pages, UI controls added |
| Revision-only filter/workflow | ✅ | Added `isRevision` filter to dashboard UI and backend API |
| Answer expand/collapse interaction | ✅ | Implemented accordion button in `QuestionTableComponent` |
| Role dropdown from stable source | ✅ | Droplist now loads from `api/questions/roles` |
| Admin import validation feedback | ✅ | Catch and map HttpErrorResponse to UI result state |

### 11.3 Architecture (Tier 2)

| Improvement | Status | Notes |
|-------------|--------|-------|
| Move admin import behind application service | ✅ | `IQuestionImportService` exists |
| Centralize validation (FluentValidation) | ⏳ | Not yet added |
| Extract startup bootstrap to hosted service | ⏳ | Role/user seeding in `Program.cs` |
| Formalize API contract boundaries | ⏳ | Some frontend/backend DTO drift exists |

### 11.4 Performance & Scalability (Tier 3)

| Improvement | Status | Notes |
|-------------|--------|-------|
| DB indexes for common filters | ⏳ | `CategoryId`, `Difficulty`, `Role` |
| Consolidate progress summary queries | ⏳ | Multiple separate count queries |
| Cache category tree | ⏳ | Repeated reads for stable data |
| Move route filters to URL query params | ⏳ | Filters not shareable/bookmarkable |
| Debounced search | ⏳ | Risk of chatty requests |
| Separate migrations from app startup | ⏳ | Auto-migrate on startup currently |

### 11.5 Testing (Tier 1 — Critical)

| Improvement | Status | Notes |
|-------------|--------|-------|
| Backend integration tests (auth, import, progress) | ⏳ | No test suite exists |
| Frontend unit/component tests | ⏳ | No test suite exists |
| Security-focused tests | ⏳ | Admin authorization verification |

### 11.6 Observability (Tier 3)

| Improvement | Status | Notes |
|-------------|--------|-------|
| Structured logging with context | ⏳ | Basic `ILogger` usage |
| Audit trail for admin actions | ✅ | `AuditLog` entity exists |
| Import metrics and diagnostics | ⏳ | No structured reporting |

---

## 12. PRD/TRD Alignment Status

| Area | PRD/TRD Expectation | Actual Implementation | Aligned? |
|------|---------------------|----------------------|----------|
| UI Theme | Dark mode (`#121212`) + Tailwind | Custom CSS, dark SaaS theme | ✅ (adapted) |
| Dashboard route | `/dashboard` | `/` (redirects) | ✅ (equivalent) |
| Category sidebar | Infinite nested tree | Root categories + sub-nav pills | ✅ |
| Question table + answers | Collapsible row reveal | Implemented | ✅ |
| Pagination | Backend + UI | Fully Implemented | ✅ |
| Revision workflow | Bookmark → revision queue | Implemented via filter | ✅ |
| Admin role protection | `[Authorize(Roles)]` | Fully enabled | ✅ |
| JWT auth | Full flow | Working | ✅ |
| Excel import | Bulk upload | Working | ✅ |
| `Result<T>` pattern | Service returns | Implemented | ✅ |
| Clean Architecture | 4-layer, no MediatR | Preserved | ✅ |
| Angular standalone | No NgModules | Fully standalone | ✅ |

---

## 13. Out of Scope (Future Phases)

| Feature | Phase | Notes |
|---------|-------|-------|
| AI Interview Copilot | Phase 2 | Voice/text evaluation |
| Resume Analyzer | Phase 2 | PDF upload + ATS scoring |
| Payments / Monetization | Phase 3 | Stripe integration |
| Social features | Phase 3 | Leaderboards, comments, forums |
| Code execution (IDE) | Phase 3 | Browser-based compiler |
| Real file upload (PDF storage) | Phase 2 | CheatSheet Phase 2 |

---

## 🔥 Next Execution Plan

### MAX Priority — Must Fix Now

| # | Task | Impact |
|---|------|--------|
| 1 | Dashboard pagination UI | Core feature incomplete | ✅ |
| 2 | Full admin role enforcement (backend + frontend guard) | Security vulnerability | ✅ |
| 3 | Eliminate full table reload on progress toggles | Performance | ✅ |
| 4 | Move secrets out of committed config | Deployment safety | ✅ |

### HIGH Priority — Next Features

| # | Task | Impact |
|---|------|--------|
| 5 | Quiz System — Mock Mode basic version | Assessment capability |
| 6 | Quiz System — Real Exam Mode with timer | Full assessment engine |
| 7 | CheatSheet Hub MVP (metadata-based resources) | Product expansion |
| 8 | Revision-only filter and dedicated queue | Complete study workflow | ✅ |
| 9 | Answer expand/collapse interaction | Study quality | ✅ |
| 10 | Admin user management API | Role assignment | ✅ |

### MEDIUM Priority — Polish & Quality

| # | Task | Impact |
|---|------|--------|
| 11 | FluentValidation for DTOs | Input safety |
| 12 | Backend integration test suite | Change confidence |
| 13 | Loading/empty/error state polish | Product feel |
| 14 | Markdown rendering for answers | Rich content display |
| 15 | Admin import preview + `ProblemDetails` rendering | Operator experience |
| 16 | Cache category tree (server + client) | Performance |

### LOW Priority — Advanced / Senior-Level

| # | Task | Impact |
|---|------|--------|
| 17 | Structured logging + observability | Production readiness |
| 18 | Full-text search strategy | Scale preparation |
| 19 | Separate migrations from startup | Deployment discipline |
| 20 | API versioning / contract discipline | Long-term maintainability |

---

## 14. Alignment Fixes (PRD ↔ TRD ↔ Implementation)

> This section tracks every detected mismatch between planning documents and actual code reality. Each item should be closed by either fixing the code or formally updating the doc to match reality.

| # | Issue | Source | Status | Action Required |
|---|-------|--------|--------|----------------|
| 1 | Dashboard pagination: backend pages, no UI controls | PRD §1, TRD §5, README §15 | ✅ | Added `app-pagination` to `DashboardPageComponent` |
| 2 | Admin role enforcement missing (`[Authorize]` not `[Authorize(Roles)]`) | TRD §8, Improvements §4.2 | ✅ | Enabled full role guards on all admin controllers + frontend `adminGuard` |
| 3 | JWT secret stored in committed `appsettings.json` | TRD §8, Improvements §4.6 | ✅ | Moved to .NET User Secrets / environment variable |
| 4 | Default admin bootstrap runs unconditionally in `Program.cs` | Improvements §4.6 | ✅ | Wrapped in `IsDevelopment()` check |
| 5 | UI theme: TRD specified Tailwind CSS; implementation uses custom CSS | TRD §1 | ✅ (doc fixed) | TRD updated to reflect custom CSS as the actual approach |
| 6 | Route: TRD specified `/dashboard`; app uses `/` | TRD §5.1 | ✅ (doc fixed) | TRD updated to reflect actual routes |
| 7 | Revision workflow: toggle exists but no dedicated queue or filter | PRD §1, Improvements §4.1 | ✅ | Added `isRevision` parameter to API and checkbox in `FilterBarComponent` |
| 8 | Answer display: TRD specified collapsible row; current shows inline | README §11 | ✅ | Implemented `expandedQuestionId` logic and toggles in `QuestionTableComponent` |
| 9 | Role dropdown derives from current page results only | Improvements §4.5 | ✅ | Added `/api/questions/roles` endpoint and bound dropdown to it |
| 10 | Admin import feedback: no `ProblemDetails` rendering in Angular | Improvements §4.4 | ✅ | Surface structured error in import UI |
| 11 | No test suite (backend or frontend) | Improvements §5.1 | ⏳ | Add integration tests for auth, import, progress |
| 12 | FluentValidation not integrated | TRD §7 | ✅ | Added validators for all create/update DTOs |
| 13 | CheatSheet Hub: documented (QUIZ.md, CheetSheet.md) but not started | PRD §2.1 | ✅ | Implemented CheatSheetResource entity, backend services, and controllers per CheatSheet.md |
| 14 | Quiz System: documented (QUIZ.md) but not started | PRD §2.2 | ✅ | Implemented Practice/Assessment modes over existing quiz models with snapshotting |
| 15 | Category seeding: name-based; duplicates across branches unsupported | README §16 | ✅ | Block creation if slug exists |

---

**Instructions for the Agent:**
- Update this tracker after completing each task.
- Follow the priority order defined in § Next Execution Plan.
- Keep code aligned with Clean Architecture (no MediatR, `Result<T>`, DTO-based APIs).
- Use Angular standalone components for all new frontend work.

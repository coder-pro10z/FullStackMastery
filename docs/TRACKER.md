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
| `ExcelExtractionService` | ✅ | Merged cells, Category column, Role fallback, DTO-based `ExtractImportRows` with per-row `ExcelRowDiagnostic` |
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
| `IQuestionImportValidator` | ✅ | Dedicated validator class with dedup, difficulty, category resolution. Registered in DI. |
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
| `AdminController` — import questions (legacy) | ✅ | Excel upload endpoint (direct entity insert) |
| `AdminImportController` — unified import | ✅ | `.xlsx`, `.csv`, `.json` all flow through `ImportAsync` pipeline |
| `AdminQuestionsController` — CRUD | ✅ | Create, update, soft-delete, restore |
| `AdminCategoriesController` — tree + CRUD | ✅ | Hierarchical management |
| `AdminDashboardController` — stats | ✅ | Dashboard analytics |
| `ResourcesController` — cheat sheet read API | ✅ | Auth-protected category resource listing |
| `AdminResourcesController` — cheat sheet CRUD | ✅ | Admin create/delete endpoints |
| `QuizzesController` — attempt/play/submit | ✅ | Practice/Assessment quiz flow |
| Admin role enforcement `[Authorize(Roles)]` | 🔄 | New admin controllers are role-protected, legacy `AdminController` is not |
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
| Pagination UI controls | 🔄 | Dashboard now uses `PagedResponse` metadata with previous/next controls and page-size switching; remaining closeout is browser validation on desktop and mobile |
| Revision-only filter mode | ⏳ | Toggle exists, workflow not operationalized |
| Answer expand/collapse UX | ✅ | Accordion toggle implemented in question cards |
| Quiz Dashboard Component | ✅ | Quiz setup flow under `/quiz/new` |
| Quiz Player Component | ✅ | Attempt flow under `/quiz/:id` |
| Quiz Review Component | ✅ | Review flow under `/quiz/:id/review` |

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
| `CheatSheetResource` entity | ✅ | Title, type, URL/markdown, category, display order |
| `CheatSheetResourceType` enum | ✅ | Pdf, Markdown, ExternalLink |
| DbContext `DbSet` + EF config | ✅ | FK to Category, indexes, enum conversion |
| `CheatSheetResourceDto` | ✅ | API response DTO |
| `CreateCheatSheetDto` | ✅ | Admin creation DTO |
| `ICheatSheetService` interface | ✅ | GetByCategory, Create, Delete |
| `CheatSheetService` implementation | ✅ | EF Core backed, filtered by category |
| `ResourcesController` | ✅ | `GET /api/resources?categoryId=` auth-protected |
| `AdminResourcesController` | ✅ | `POST / DELETE /api/admin/resources` |
| EF Migration for new table | ✅ | `AddCheatSheets` applied in codebase |

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
| `QuizAttempt` entity | ✅ | User session tracking, mode, status, scoring |
| `QuizQuestion` entity (bridge) | ✅ | Snapshot-based quiz attempt questions |
| `QuizUserAnswer` entity | ✅ | Attempt responses per quiz question |
| `QuizMode` enum | ✅ | Practice, Assessment |

### 10.2 Backend — Services & API

| Component | Status | Notes |
|-----------|--------|-------|
| `IQuizService` | ✅ | Attempt create, fetch, save response, submit |
| Quiz scoring | ✅ | Self-marked correctness aggregated on submit |
| `QuizzesController` | ✅ | Create, load, answer, submit endpoints |
| Quiz DTO masking (Assessment Mode) | ✅ | Answer text hidden during active assessment |
| Timer validation (backend) | ⏳ | `ExpiresAtUtc` exists, enforcement not implemented |
| Update `UserProgress` on completion | ⏳ | Quiz completion does not feed progress stats yet |

### 10.3 Frontend

| Component | Status | Notes |
|-----------|--------|-------|
| Quiz Dashboard (config/start) | ✅ | Category, difficulty, role, count, mode selection |
| Quiz Player Component | ✅ | Question display, navigation, answer marking |
| Quiz Reflection/Review Component | ✅ | Score breakdown and answer review |
| Shared Question Card (`displayContext`) | ⏳ | Context-aware reusable component |
| `/quiz` routes | ✅ | `/quiz/new`, `/quiz/:id`, `/quiz/:id/review` |
| Quiz API service (Angular) | ✅ | Create, load, save response, submit |

---

## 11. Improvements & Refactoring

> Source: [Improvements.md](file:///c:/Users/Praveen/Desktop/Interview_PrepApp/docs/Improvements.md)

### 11.1 Security (Tier 1 — Critical)

| Improvement | Status | Notes |
|-------------|--------|-------|
| Admin API role enforcement `[Authorize(Roles = "Admin")]` | 🔄 | Newer admin controllers use roles, legacy `AdminController` does not |
| Frontend `adminGuard` (role-based) | ⏳ | Guard file exists locally but route still uses `authGuard` only |
| Move JWT secret to env/secret store | ⏳ | JWT key still committed in `appsettings.json` |
| Restrict default admin creation to dev only | 🔄 | `Program.cs` now gates seeded admin creation to Development; validate startup behavior in Development and non-Development environments before closing |
| ASP.NET Identity lockout + password policy | ⏳ | No hardening configured |

### 11.2 Feature Completeness (Tier 1–2)

| Improvement | Status | Notes |
|-------------|--------|-------|
| Dashboard pagination UI | 🔄 | Dashboard now surfaces page counts, range summary, previous/next controls, and page-size switching; remaining closeout is manual UI validation |
| Revision-only filter/workflow | ⏳ | Toggle exists, no dedicated filter wired |
| Answer expand/collapse interaction | ✅ | Implemented accordion button in `QuestionTableComponent` |
| Role dropdown from stable source | ⏳ | Roles still derived from the current loaded page |
| Admin import validation feedback | ✅ | `.xlsx` + `.csv` (column-name-based, RFC-4180 quotes) + `.json` — all through unified pipeline |

### 11.3 Architecture (Tier 2)

| Improvement | Status | Notes |
|-------------|--------|-------|
| Move admin import behind application service | 🔄 | `AdminImportController` now uses `IExcelExtractor.ExtractImportRows` → `ImportAsync`; legacy `AdminController` still uses direct entity path |
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
| Backend unit tests — Extractor + Validator | ✅ | `ExcelExtractionServiceTests`, `QuestionImportValidatorTests`, `AdminQuestionServiceTests` passing |
| Backend integration tests — Import Worker | 🔄 | `ImportBackgroundWorkerTests`: 23 passing / **3 failing** — gate blocker for StudyGuide parity |
| TDD blueprint — all 3 import modules | ✅ | `tests/integration/import-flow.spec.ts` created; 4-step validation path defined |
| Test fixtures | ✅ | `tests/fixtures/import-fixtures.json` created; covers Question, Quiz, CheatSheet |
| New backend test suite (`Import/` directory) | ⏳ | `QuestionImportServiceTests`, `QuizAttemptServiceTests`, `CheatSheetServiceTests`, controller tests, security boundary tests — defined in blueprint, not yet implemented |
| Frontend unit/component tests | ⏳ | No `.spec.ts` files exist; manual walkthrough required until scaffold created |
| Security-focused tests | ⏳ | `ImportSecurityBoundaryTests.cs` blueprint created; `[GAP-VERIFY]` test for GAP-01 will fail red until legacy AdminController is fixed |

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
| Pagination | Backend + UI | Backend only, no UI controls | ❌ |
| Revision workflow | Bookmark → revision queue | Toggle only, no dedicated filter | ❌ |
| Admin role protection | `[Authorize(Roles)]` | Partial: mixed protected and legacy unprotected admin APIs | ❌ |
| JWT auth | Full flow | Working | ✅ |
| Excel import | Bulk upload | Working | ✅ |
| `Result<T>` pattern | Service returns | Implemented | ✅ |
| Clean Architecture | 4-layer, no MediatR | Preserved | ✅ |
| Angular standalone | No NgModules | Fully standalone | ✅ |

---

## 13. Out of Scope (Future Phases)

| Feature | Phase | Notes |
|---------|-------|-------|
| AI Interview Copilot | Phase 3 | Voice/text evaluation |
| Resume Analyzer | Phase 3 | PDF upload + ATS scoring |
| Payments / Monetization | Phase 3 | Stripe integration |
| Social features | Phase 3 | Leaderboards, comments, forums |
| Code execution (IDE) | Phase 3 | Browser-based compiler |
| Real file upload (PDF storage) | Phase 3 | CheatSheet Phase 2 server-side upload |

---

## 🔥 Next Execution Plan

### MAX Priority — Must Fix Now

| # | Task | Impact |
|---|------|--------|
| 1 | Dashboard pagination UI | Core feature incomplete |
| 2 | Full admin role enforcement (backend + frontend guard) | Security vulnerability |
| 3 | Eliminate full table reload on progress toggles | Performance | ✅ |
| 4 | Move secrets out of committed config | Deployment safety |
| 5 | Fix Admin Dashboard is not loading throwing 404 Error | Production readiness |


### HIGH Priority — Next Features

| # | Task | Impact |
|---|------|--------|
| 5 | Quiz System — Practice mode hardening | Assessment capability |
| 6 | Quiz System — Assessment timer enforcement | Full assessment engine |
| 7 | CheatSheet Hub MVP (metadata-based resources) | Product expansion |
| 8 | Revision-only filter and dedicated queue | Complete study workflow |
| 9 | Answer expand/collapse interaction | Study quality | ✅ |
| 10 | Admin user management API | Role assignment |

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
| 1 | Dashboard pagination: backend pages, no UI controls | PRD §1, TRD §5, README §15 | 🔄 | Dashboard now wires `PagedResponse` metadata and exposes pagination controls; remaining closeout is README/TRD sync plus manual validation |
| 2 | Admin role enforcement missing (`[Authorize]` not `[Authorize(Roles)]`) | TRD §8, Improvements §4.2 | 🔄 | New admin controllers protected; legacy `AdminController` and `/admin` route still need guardrails |
| 3 | JWT secret stored in committed `appsettings.json` | TRD §8, Improvements §4.6 | ⏳ | Move JWT settings to user secrets / environment variables |
| 4 | Default admin bootstrap runs unconditionally in `Program.cs` | Improvements §4.6 | 🔄 | `Program.cs` now wraps default admin creation in `IsDevelopment()`; remaining closeout is runtime validation plus README/TRD sync |
| 5 | UI theme: TRD specified Tailwind CSS; implementation uses custom CSS | TRD §1 | ✅ (doc fixed) | TRD updated to reflect custom CSS as the actual approach |
| 6 | Route: TRD specified `/dashboard`; app uses `/` | TRD §5.1 | ✅ (doc fixed) | TRD updated to reflect actual routes |
| 7 | Revision workflow: toggle exists but no dedicated queue or filter | PRD §1, Improvements §4.1 | ⏳ | Add API/query support and dashboard filter UI |
| 8 | Answer display: TRD specified collapsible row; current shows inline | README §11 | ✅ | Implemented `expandedQuestionId` logic and toggles in `QuestionTableComponent` |
| 9 | Role dropdown derives from current page results only | Improvements §4.5 | ⏳ | Add stable roles endpoint or admin dictionary source |
| 10 | Admin import feedback: no `ProblemDetails` rendering in Angular | Improvements §4.4 | ⏳ | Improve admin upload UI and structured error rendering |
| 11 | No test suite (backend or frontend) | Improvements §5.1 | 🔄 | Backend: 23 passing / 3 failing `ImportBackgroundWorkerTests`. New `Import/` test suite blueprinted. Frontend: 0 spec files — manual verification required. See `docs/TDD_STRATEGY.md` |
| 12 | FluentValidation not integrated | TRD §7 | ⏳ | Add validators and register them in the API pipeline |
| 13 | CheatSheet Hub: documented (QUIZ.md, CheetSheet.md) but not started | PRD §2.1 | 🔄 | Backend API/data model exists; frontend pages and navigation are still pending |
| 14 | Quiz System: documented (QUIZ.md) but not started | PRD §2.2 | 🔄 | Core quiz flow exists; timer enforcement and some UX polish remain |
| 15 | Category seeding: name-based; duplicates across branches unsupported | README §16 | ✅ | Block creation if slug exists |
| 16 | QuestionImportValidator bug: intra-file deduplication warnings incorrectly flagged as DB duplicates | Bug Report | ✅ | Fixed duplicate evaluation order and updated tests with precise warning match validation (`result.Warnings.Should().Contain(...)`) |

---

## 15. TDD Initiative — Import Pipeline Test Scaffolding

> **Created:** April 2026 | **Classification:** Class A (Additive — test infrastructure, no application code)
> **TDD Strategy Doc:** [`docs/TDD_STRATEGY.md`](TDD_STRATEGY.md)

### Artifacts Created

| Artifact | Path | Status |
|---|---|---|
| Test fixtures | `tests/fixtures/import-fixtures.json` | ✅ Created |
| E2E test blueprint | `tests/integration/import-flow.spec.ts` | ✅ Created |
| TDD strategy document | `docs/TDD_STRATEGY.md` | ✅ Created |
| Engineering Playbook | `docs/ENGINEERING_PLAYBOOK.md` | ✅ Created (prior session) |

### Test Cases Blueprinted (by module)

| Module | Step 1 (FE Payload) | Step 2 (BE Unit) | Step 3 (BE API) | Step 4 (FE UI) | Total |
|---|---|---|---|---|---|
| Question Import | 4 cases | 8 cases | 4 cases | 4 cases | **20** |
| Quiz Attempt | 3 cases | 6 cases | 5 cases | 5 cases | **19** |
| CheatSheet Import | 5 cases | 9 cases | 8 cases | 6 cases | **28** |
| Security Boundary | — | — | 4 cases | — | **4** |
| **Total** | | | | | **71 test cases** |

### Next Steps (ordered)

| # | Action | Classification | Gate |
|---|---|---|---|
| 1 | Fix 3 failing `ImportBackgroundWorkerTests` | Class B | Must complete before StudyGuide parity |
| 2 | Resolve GAP-01: legacy AdminController role enforcement | Class B | After fix, `LegacyImport_NonAdminUser_Returns403` turns green |
| 3 | Create `tests/InterviewPrepApp.Tests/Import/` directory and implement all `[TODO-IMPLEMENT]` C# test classes | Class A | All Step 2 & 3 tests must pass before APPROVE AND IMPLEMENT |
| 4 | Implement application code to satisfy all failing tests | Class A/B | Reply 'APPROVE AND IMPLEMENT' to begin |
| 5 | Create Angular test scaffold (`.spec.ts`) for Steps 1 & 4 | Class A | After CheatSheet frontend sprint |

---

**Instructions for the Agent:**
- **Read `docs/ENGINEERING_PLAYBOOK.md` before starting any task.** It is the authority for process, architecture, and Definition of Done.
- Update this tracker after completing each task.
- Identify the Modification Class (A / B / C) before writing any code.
- Follow the priority order defined in § Next Execution Plan.
- Keep code aligned with Clean Architecture (no MediatR, `Result<T>`, DTO-based APIs).
- Use Angular standalone components for all new frontend work.
- Reference `tests/fixtures/import-fixtures.json` for all test data — no inline magic strings.

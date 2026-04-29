# FullStack Mastery — Interview Preparation Platform

> A production-grade, full-stack interview preparation platform for .NET and Angular engineers.\
> Built with **ASP.NET Core 8**, **Entity Framework Core**, **SQL Server**, **ASP.NET Identity + JWT**, and **Angular 17 Standalone Components**.

---

## Table of Contents

1. [What This Is](#1-what-this-is)
2. [Live Feature Status](#2-live-feature-status)
3. [Architecture Overview](#3-architecture-overview)
4. [Solution Structure](#4-solution-structure)
5. [Domain Model](#5-domain-model)
6. [API Reference](#6-api-reference)
7. [Security Model](#7-security-model)
8. [Frontend Architecture](#8-frontend-architecture)
9. [Import Pipeline](#9-import-pipeline)
10. [Quiz & Assessment Engine](#10-quiz--assessment-engine)
11. [CheatSheet Hub](#11-cheatsheet-hub)
12. [Test Coverage](#12-test-coverage)
13. [Getting Started](#13-getting-started)
14. [Roadmap](#14-roadmap)
15. [Known Gaps (Honest Status)](#15-known-gaps-honest-status)
16. [Agent / AI Tool Orientation](#16-agent--ai-tool-orientation)

---

## 1. What This Is

Software engineers preparing for Full Stack .NET and Angular interviews face a fragmented learning experience. Existing platforms over-index on raw DSA while neglecting framework-specific concepts, system design, and scenario-based questions.

**FullStack Mastery** solves this with a centralized, distraction-free web platform providing:

- A curated, hierarchically organized question bank for `.NET` and `Angular` roles
- Per-user progress tracking (solved / revision) with optimistic UI updates
- A Quiz & Assessment engine with Practice and Assessment modes
- An admin-grade bulk import pipeline supporting `.xlsx`, `.csv`, and `.json`
- A CheatSheet Hub for linking category-scoped reference resources (backend complete; frontend in progress)

This repository serves a dual purpose: a functional study tool **and** a showcase of production-minded full-stack architecture patterns.

---

## 2. Live Feature Status

### ✅ Implemented & Verified

| Feature | Notes |
|---|---|
| JWT-based Register / Login | Full auth flow; token stored in `localStorage` |
| Hierarchical category sidebar | Root categories + horizontal sub-nav pills |
| Question browsing with filters | Search, difficulty, role, category subtree |
| Paginated question API | `PagedResponse<T>` — *UI controls pending* |
| Solved / Revision toggles | Optimistic updates; `UserProgress` join table |
| Dashboard progress summary cards | Total, Easy, Medium, Hard breakdown |
| Answer expand/collapse accordion | Per-question toggle interaction |
| Admin Excel bulk import | `.xlsx` / `.csv` / `.json` → unified `ImportAsync` pipeline |
| Admin question CRUD | Create, update, soft-delete, restore |
| Admin category management APIs | Hierarchical tree CRUD |
| Admin dashboard stats + audit logs | Question counts by difficulty/status |
| Immutable audit logging | Append-only `AuditLog` entity |
| Question version history | Rollback-ready snapshots |
| Responsive dark-mode-adjacent UI | Custom CSS warm-parchment SaaS theme |
| Angular standalone components | No NgModules throughout |
| Clean Architecture backend | 4-layer: Domain → Application → Infrastructure → Api |
| CheatSheet backend (API + DB) | `GET /api/resources`, `POST/DELETE /api/admin/resources` — fully wired |
| Quiz backend (domain + API) | Entities, scoring, attempt lifecycle — fully wired |
| Quiz frontend (all 3 screens) | Setup → Player → Review flow live at `/quiz/*` |

### 🔄 Implemented — Hardening In Progress

| Feature | Remaining Work |
|---|---|
| Admin role enforcement | New controllers role-protected; legacy `AdminController` still uses `[Authorize]` only |
| Quiz timer/assessment rules | `ExpiresAtUtc` field exists; backend enforcement not yet active |
| Quiz → UserProgress feed | Quiz completion does not yet update progress summary counts |
| Import background worker | 23 passing tests / 3 failing `ImportBackgroundWorkerTests` |

### ⏳ Planned — Not Yet Started

| Feature | Notes |
|---|---|
| CheatSheet frontend | Page, resource cards, sidebar nav, admin UI — 7 Angular components |
| Dashboard pagination UI | Backend pages, UI controls not yet surfaced |
| Smart Revision Mode | Dedicated revision queue and focused study workflow |
| Frontend `adminGuard` | Guard file exists locally; active route still uses `authGuard` only |
| JWT secret → environment variable | Currently committed in `appsettings.json` |
| StudyGuide import parity | Next import pipeline target after quiz hardening |
| Frontend unit/component tests | No `.spec.ts` files currently exist |
| FluentValidation | Planned for all admin input DTOs |

---

## 3. Architecture Overview

```
┌─────────────────────────────────────────┐
│         Angular 17 SPA (Frontend)        │
│  Standalone Components │ No NgModules    │
│  authGuard │ Interceptor │ Services      │
└─────────────────────┬───────────────────┘
                      │ HTTP / REST
                      ▼
┌─────────────────────────────────────────┐
│       ASP.NET Core 8 Web API             │
│  Global Exception Handler (RFC 7807)     │
│  JWT Bearer Auth │ CORS │ Swagger        │
│                                          │
│  ┌───────────┐  ┌────────────────────┐  │
│  │ Controllers│  │  Background Workers│  │
│  └─────┬─────┘  └────────┬───────────┘  │
│        │ DI services      │              │
│        ▼                  ▼              │
│  ┌─────────────────────────────────┐    │
│  │    Application Layer            │    │
│  │  Service Interfaces │ DTOs      │    │
│  └─────────────┬───────────────────┘    │
│                 │ EF Core                │
│        ▼                                │
│  ┌─────────────────────────────────┐    │
│  │  Infrastructure Layer           │    │
│  │  Services │ DbContext │ Parsers  │    │
│  └─────────────────────────────────┘    │
│                 │ SQL                    │
│        ▼                                │
│       SQL Server (EF Code-First)        │
└─────────────────────────────────────────┘
```

### Enforced Architectural Rules

| Rule | Status |
|---|---|
| 4-Layer Clean Architecture (Domain → Application → Infrastructure → Api) | ✅ |
| No MediatR / CQRS — standard interface-based DI only | ✅ |
| `Result<T>` pattern — services never throw business exceptions | ✅ |
| EF Core Code-First — no raw SQL in production paths | ✅ |
| Angular Standalone Components — no NgModules | ✅ |
| Non-breaking module additions — Quiz / CheatSheet never modify existing `Question`/`Answer` entities | ✅ |

---

## 4. Solution Structure

```
Interview_PrepApp/
├── src/
│   ├── InterviewPrepApp.Domain/
│   │   ├── Entities/          ← Question, Answer, Category, AuditLog,
│   │   │                          QuestionVersion, ApplicationUser, UserProgress,
│   │   │                          CheatSheetResource, QuizAttempt, QuizQuestion, QuizUserAnswer
│   │   ├── Enums/             ← Difficulty, QuestionStatus, CheatSheetResourceType, QuizMode
│   │   └── Shared/            ← Result<T>
│   ├── InterviewPrepApp.Application/
│   │   ├── Interfaces/        ← ICategoryService, IQuestionService, IUserProgressService,
│   │   │                          IAdminDashboardService, IQuestionImportService,
│   │   │                          IAuditLogService, ICheatSheetService, IQuizService
│   │   └── DTOs/              ← Admin/, Category/, Progress/, Shared/, Quiz/, CheatSheet/
│   ├── InterviewPrepApp.Infrastructure/
│   │   ├── Persistence/       ← ApplicationDbContext, DatabaseSeeder, EF Configurations
│   │   ├── Migrations/        ← InitialCreate, AddAdminTables, AddCheatSheets, (quiz migration)
│   │   └── Services/          ← CategoryService, QuestionService, UserProgressService,
│   │                              ExcelExtractionService, AdminDashboardService,
│   │                              AuditLogService, CheatSheetService, QuizService
│   └── InterviewPrepApp.Api/
│       ├── Controllers/
│       │   ├── Admin/         ← AdminQuestionsController, AdminCategoriesController,
│       │   │                      AdminDashboardController, AdminImportController,
│       │   │                      AdminResourcesController
│       │   ├── AuthController.cs
│       │   ├── CategoriesController.cs
│       │   ├── QuestionsController.cs
│       │   ├── UserProgressController.cs
│       │   ├── ResourcesController.cs
│       │   └── QuizzesController.cs
│       ├── Middleware/        ← AuditLogMiddleware, RateLimitingMiddleware (⏳ planned)
│       └── Infrastructure/   ← GlobalExceptionHandler
├── frontend/
│   └── src/app/
│       ├── core/             ← guards, interceptors, models, services
│       ├── shared/components/ ← action-toggle, filter-bar, progress-card,
│       │                          question-badge, sub-category-nav, resource-card (⏳)
│       ├── features/         ← auth/, dashboard/, admin/, quiz/, cheatsheet/ (⏳)
│       └── layouts/          ← app-layout/, admin-layout/
├── tests/
│   └── InterviewPrepApp.Tests/  ← xUnit backend tests (import pipeline coverage)
└── docs/
    ├── PRD.md                ← Product Requirements Document
    ├── TRD.md                ← Technical Requirements Document
    ├── TRACKER.md            ← Execution tracker + alignment fixes
    ├── DESIGN_UPDATE_PLAN.md ← Current realignment and gate plan
    ├── Improvements.md       ← Deep gap analysis
    ├── QUIZ.md               ← Quiz system deep-dive
    └── CheetSheet.md         ← CheatSheet Hub feature spec
```

---

## 5. Domain Model

### Core Entities

| Entity | Status | Key Properties |
|---|---|---|
| `Category` | ✅ | Self-referencing (`ParentId`), `Slug`, `SortOrder` |
| `Question` | ✅ | Soft-delete (`IsDeleted`, `DeletedAt`), `Status`, `CreatedByUserId` |
| `Answer` | ✅ | 1:1 with Question, `MarkdownContent` |
| `UserProgress` | ✅ | Composite PK `(UserId, QuestionId)`, `IsSolved`, `IsRevision` |
| `ApplicationUser` | ✅ | Inherits `IdentityUser` |
| `AuditLog` | ✅ | Immutable, append-only, JSON snapshots |
| `QuestionVersion` | ✅ | Append-only history with question/answer snapshots |
| `CheatSheetResource` | ✅ | `Title`, `Type` (enum), `Url?`, `MarkdownContent?`, `CategoryId`, `DisplayOrder` |
| `QuizAttempt` | ✅ | `UserId`, `Mode (Practice\|Assessment)`, `StartedAt`, `CompletedAt`, `Score`, `ExpiresAtUtc` |
| `QuizQuestion` | ✅ | Bridge entity: `QuizAttemptId` → `OriginalQuestionId` (read-only reference) |
| `QuizUserAnswer` | ✅ | Per-question attempt response |

### EF Core Rules

```
UserProgress    ← composite PK: (UserId, QuestionId)
Category        ← self-referencing, DeleteBehavior.Restrict (no cascade)
Question        ← global query filter: WHERE IsDeleted = 0
QuestionVersion ← DeleteBehavior.Cascade from Question
CheatSheetResource ← FK to Category

Indexes: CategoryId, IsDeleted+Status, Difficulty
```

### Entity Relationships (simplified)

```
ApplicationUser (1) ── (many) UserProgress (many) ── (1) Question
Category        (1) ── (many) Question
Category        (1 parent) ── (many children) Category
Category        (1) ── (many) CheatSheetResource
QuizAttempt     (1) ── (many) QuizQuestion ── (1) Question [read-only ref]
QuizAttempt     (1) ── (many) QuizUserAnswer
```

---

## 6. API Reference

Base URL: `http://localhost:5000/api`

### Authentication

| Method | Endpoint | Auth | Notes |
|---|---|---|---|
| POST | `/api/auth/register` | Public | Creates user, returns JWT |
| POST | `/api/auth/login` | Public | Returns JWT + roles array |

```json
// Request
{ "email": "user@example.com", "password": "string" }

// Response
{ "token": "jwt", "email": "...", "userId": "...", "roles": ["Admin"] }
```

### Categories

| Method | Endpoint | Auth | Notes |
|---|---|---|---|
| GET | `/api/categories/tree` | Public | Nested JSON tree |
| GET | `/api/categories/flat` | Public | Flat list for dropdowns |

### Questions

| Method | Endpoint | Auth | Query Params |
|---|---|---|---|
| GET | `/api/questions` | Public/Auth | `categoryId`, `searchTerm`, `difficulty`, `role`, `pageNumber`, `pageSize` |

Returns `PagedResponse<QuestionDto>` — includes `totalRecords`, `pageNumber`, `pageSize`.

### User Progress

| Method | Endpoint | Auth |
|---|---|---|
| GET | `/api/userprogress/summary` | `[Authorize]` |
| POST | `/api/userprogress/{questionId}/toggle-solved` | `[Authorize]` |
| POST | `/api/userprogress/{questionId}/toggle-revision` | `[Authorize]` |

### Admin — Questions

| Method | Endpoint | Auth |
|---|---|---|
| GET | `/api/admin/questions` | Admin |
| POST | `/api/admin/questions` | Admin |
| PUT | `/api/admin/questions/{id}` | Admin |
| DELETE | `/api/admin/questions/{id}` | Admin |
| POST | `/api/admin/questions/{id}/restore` | Admin |
| GET | `/api/admin/questions/{id}/versions` | Admin |

### Admin — Categories

| Method | Endpoint | Auth |
|---|---|---|
| GET | `/api/admin/categories/tree` | Admin |
| POST | `/api/admin/categories` | Admin |
| DELETE | `/api/admin/categories/{id}` | Admin |

### Admin — Import

| Method | Endpoint | Auth | Notes |
|---|---|---|---|
| POST | `/api/admin/import-questions` | Admin | Unified pipeline: `.xlsx`, `.csv`, `.json` |
| POST | `/api/admin/import` *(legacy)* | `[Authorize]` ⚠️ | Direct-insert path; role guard **not yet applied** |

> ⚠️ The legacy `/api/admin/import` endpoint uses only `[Authorize]`, not `[Authorize(Roles = "Admin")]`. Any authenticated user can currently reach it. This is a tracked security gap — see [§15](#15-known-gaps-honest-status).

### Admin — Dashboard

| Method | Endpoint | Auth |
|---|---|---|
| GET | `/api/admin/dashboard/stats` | Admin |
| GET | `/api/admin/dashboard/audit-logs` | Admin |

### CheatSheet Resources

| Method | Endpoint | Auth |
|---|---|---|
| GET | `/api/resources?categoryId=` | `[Authorize]` |
| POST | `/api/admin/resources` | Admin |
| DELETE | `/api/admin/resources/{id}` | Admin |

### Quiz & Assessment

| Method | Endpoint | Auth | Notes |
|---|---|---|---|
| POST | `/api/quizzes` | `[Authorize]` | Create attempt; `mode: Practice\|Assessment` |
| GET | `/api/quizzes/{id}` | `[Authorize]` | Load attempt; answers masked in Assessment mode |
| POST | `/api/quizzes/{id}/responses/{questionId}` | `[Authorize]` | Save per-question response |
| POST | `/api/quizzes/{id}/submit` | `[Authorize]` | Final submission + scoring |

---

## 7. Security Model

### Current State

| Requirement | Status | Notes |
|---|---|---|
| JWT Bearer auth | ✅ | Configured in `Program.cs` |
| Admin role enforcement (new controllers) | ✅ | `[Authorize(Roles = "Admin")]` on all new admin controllers |
| Admin role enforcement (legacy controller) | 🔄 | `AdminController` uses `[Authorize]` only — gap tracked |
| Frontend `adminGuard` | ⏳ | Guard file exists; active route still uses `authGuard` |
| JWT secret in environment variable | ⏳ | Currently committed in `appsettings.json` |
| Default admin restricted to dev-only | ⏳ | Bootstrap runs unconditionally — gap tracked |
| ASP.NET Identity lockout + password policy | ⏳ | Not yet configured |

### Startup Bootstrap Behavior

On API startup the following run **unconditionally** (gap — needs `IsDevelopment()` gate):

- `Admin` role is created if missing
- Default admin user is created with committed credentials
- Pending EF Core migrations are applied

**Default dev credentials** *(do not use in production)*:
```
Email:    admin@interviewprep.com
Password: Admin@123
```

### JWT Storage (Frontend)

JWT is stored in `localStorage`. Auth interceptor attaches `Authorization: Bearer <token>` to all API requests. This design avoids CSRF but increases XSS blast radius — tracked for future hardening.

---

## 8. Frontend Architecture

### Technology

| Concern | Choice |
|---|---|
| Framework | Angular 17, Standalone Components, no NgModules |
| Styling | Custom CSS — warm parchment/beige SaaS theme, not Tailwind |
| Auth | JWT in `localStorage`; `auth.interceptor.ts` |
| State | Service-based; no NgRx or signals |

### Routes

| Path | Component | Guard | Status |
|---|---|---|---|
| `/login` | `LoginComponent` | `redirectIfLoggedIn` | ✅ |
| `/register` | `RegisterComponent` | `redirectIfLoggedIn` | ✅ |
| `/` | `AppLayoutComponent` → `DashboardPageComponent` | `authGuard` | ✅ |
| `/admin` | `AdminLayoutComponent` → `AdminDashboardComponent` | `authGuard` ⚠️ | 🔄 Role guard pending |
| `/quiz/new` | `QuizDashboardComponent` | `authGuard` | ✅ |
| `/quiz/:id` | `QuizPlayerComponent` | `authGuard` | ✅ |
| `/quiz/:id/review` | `QuizReviewComponent` | `authGuard` | ✅ |
| `/cheatsheets` | `CheatSheetPageComponent` | `authGuard` | ⏳ Not yet built |

### Component Inventory

| Component | Layer | Status |
|---|---|---|
| `AppLayoutComponent` | Layout | ✅ |
| `AdminLayoutComponent` | Layout | ✅ |
| `SidebarComponent` | Shared | ✅ Root categories + collapsible |
| `SubCategoryNavComponent` | Shared | ✅ Horizontal pills |
| `ProgressCardComponent` | Shared | ✅ |
| `QuestionBadgeComponent` | Shared | ✅ |
| `ActionToggleComponent` | Shared | ✅ |
| `FilterBarComponent` | Shared | ✅ |
| `ResourceCardComponent` | Shared | ⏳ Planned |
| `DashboardPageComponent` | Feature | ✅ |
| `QuestionTableComponent` | Feature | ✅ |
| `LoginComponent` | Feature | ✅ |
| `RegisterComponent` | Feature | ✅ |
| `AdminDashboardComponent` | Feature | ✅ |
| `QuizDashboardComponent` | Feature | ✅ |
| `QuizPlayerComponent` | Feature | ✅ |
| `QuizReviewComponent` | Feature | ✅ |
| `CheatSheetPageComponent` | Feature | ⏳ Planned |

### Design Tokens (custom CSS)

Defined in `frontend/src/styles.css`:

- **Background:** warm beige / parchment gradient
- **Accent:** orange (`--accent`, `--accent-deep`)
- **Panels:** translucent surfaces, `backdrop-filter: blur(...)`, large rounded corners, soft drop-shadows
- **Status:** success green / warning amber / danger red
- **Typography:** custom font stack, not browser defaults

---

## 9. Import Pipeline

The import system is the platform's most hardened subsystem, running through a unified `ImportAsync` pipeline.

### Supported Formats

| Format | Parser | Status |
|---|---|---|
| `.xlsx` | `ExcelExtractionService` (ClosedXML) | ✅ |
| `.csv` | Column-name-based, RFC-4180 quotes | ✅ |
| `.json` | JSON deserialization | ✅ |

### Pipeline Stages

```
File Upload (AdminImportController)
    │
    ▼
ExcelExtractionService.ExtractImportRows()
    ├─ Merged cell handling
    ├─ Category column resolution (path or role fallback)
    └─ Per-row ExcelRowDiagnostic reporting
    │
    ▼
IQuestionImportValidator.ValidateAsync()
    ├─ SHA-256 deduplication (intra-file + DB)
    ├─ Difficulty normalization
    ├─ Category resolution
    └─ Structured validation result
    │
    ▼
ImportAsync() → Persistence
    │
    ▼
ImportBackgroundWorker (async job processing)
```

### Test Coverage

| Test Area | Status |
|---|---|
| Extractor unit tests (Long-form, Quiz, StudyGuide) | ✅ |
| Validator unit tests | ✅ |
| `ImportBackgroundWorkerTests` (integration) | 🔄 23 passing / **3 failing** |

> The authoritative test project is `tests/InterviewPrepApp.Tests`. All 3 failing tests are in the async background worker integration suite and must be resolved before the StudyGuide import parity gate is marked complete.

---

## 10. Quiz & Assessment Engine

The quiz system references the existing question bank **read-only**. It never modifies `Question` or `Answer` entities.

### Modes

| Mode | Behavior |
|---|---|
| **Practice** | Instant per-question feedback; answer text visible immediately |
| **Assessment** | Timed; answer text masked until submission |

### Attempt Lifecycle

```
POST /api/quizzes              → creates QuizAttempt (Practice | Assessment)
GET  /api/quizzes/{id}         → loads attempt with questions (answers masked in Assessment)
POST /api/quizzes/{id}/responses/{questionId} → saves per-question answer
POST /api/quizzes/{id}/submit  → finalizes attempt, calculates score
```

### Frontend Screens

| Screen | Route | Status |
|---|---|---|
| Setup / Configuration | `/quiz/new` | ✅ Category, difficulty, role, count, mode selection |
| Player | `/quiz/:id` | ✅ Question display, navigation, self-marked correctness |
| Review | `/quiz/:id/review` | ✅ Score breakdown, answer review |

### Remaining Hardening

| Item | Status |
|---|---|
| Backend timer enforcement (`ExpiresAtUtc` validation) | ⏳ |
| Quiz completion → `UserProgress` update | ⏳ |
| Shared `QuestionCard` with `displayContext` (quiz vs. dashboard) | ⏳ |

---

## 11. CheatSheet Hub

A centralized resource library linked to the existing category tree. Allows users to access topic-specific reference materials alongside questions.

### Resource Types

`Pdf` · `Markdown` · `ExternalLink`

### Backend Status (✅ Complete)

| Component | Status |
|---|---|
| `CheatSheetResource` entity + `CheatSheetResourceType` enum | ✅ |
| `DbSet`, EF config, FK to Category, indexes, enum conversion | ✅ |
| `CheatSheetResourceDto` + `CreateCheatSheetDto` | ✅ |
| `ICheatSheetService` + `CheatSheetService` implementation | ✅ |
| `ResourcesController` (`GET /api/resources`) | ✅ |
| `AdminResourcesController` (`POST / DELETE /api/admin/resources`) | ✅ |
| EF Migration (`AddCheatSheets`) | ✅ |

### Frontend Status (⏳ All Pending)

| Component | Status |
|---|---|
| `CheatSheetPageComponent` | ⏳ |
| `ResourceCardComponent` (shared) | ⏳ |
| `CheatSheetService` (Angular) | ⏳ |
| `/cheatsheets` route | ⏳ |
| Sidebar navigation link | ⏳ |
| Admin resources tab | ⏳ |
| Question table "Resources" cross-link | ⏳ |

---

## 12. Test Coverage

| Area | Status | Notes |
|---|---|---|
| Backend import unit tests | ✅ | Covers Long-form, Quiz, StudyGuide extractors and validators |
| Backend import integration tests | 🔄 | 23 passing / 3 failing (`ImportBackgroundWorkerTests`) |
| Security-focused tests | ⏳ | Admin authorization verification not yet written |
| Frontend unit/component tests | ⏳ | No `.spec.ts` files exist; manual verification only |

> **Gate rule:** The 3 failing background worker tests must be fixed **before** the StudyGuide import parity milestone can close.

---

## 13. Getting Started

### Prerequisites

| Tool | Version |
|---|---|
| .NET SDK | 8.x |
| SQL Server / SQL Express | Any recent |
| Node.js | 18+ |
| npm | 9+ |

### Backend

```powershell
# From repo root
dotnet run --project src\InterviewPrepApp.Api\InterviewPrepApp.Api.csproj
```

**Startup behavior:**
- Applies pending EF Core migrations automatically
- Ensures `Admin` role exists
- Ensures default admin user exists *(unconditional — dev-only gate pending)*

**Swagger:** available in `Development` mode at `https://localhost:<port>/swagger`

**Connection string:** currently in `src/InterviewPrepApp.Api/appsettings.json` (SQL Server, default DB: `InterviewPrepAppDb`)

### Frontend

```powershell
cd frontend
npm install
npm start
# → http://localhost:4200
```

### Default Dev Credentials

```
Admin:  admin@interviewprep.com / Admin@123
```

> ⚠️ These credentials are hard-coded in startup bootstrap and are committed to the repository. Do not use this configuration in any public or shared environment.

---

## 14. Roadmap

The delivery order is locked by a hard feature gate: each milestone requires code complete, tests passing, manual UI verification, documentation updated, and TRACKER closed before the next begins.

### Current Gate: Quiz Completion Hardening

- [ ] Backend timer enforcement (`ExpiresAtUtc`)
- [ ] Quiz completion → `UserProgress` update
- [ ] Fix 3 failing `ImportBackgroundWorkerTests`
- [ ] Frontend `adminGuard` activation
- [ ] Dashboard pagination UI

### Next Gate: StudyGuide Import Parity

Match Question / Quiz import standards across parser rules, validation, background-job behavior, and admin feedback.

### Following Gate: CheatSheet Frontend

Complete all 7 pending Angular components: page, resource card, service, route, sidebar link, admin tab, and question cross-link.

### Future (Phase 3 — Out of Scope Now)

| Feature | Reason Deferred |
|---|---|
| AI Interview Copilot | LLM + voice evaluation infrastructure |
| Resume Analyzer | Document parsing pipeline |
| Monetization / Payments | Business model decision pending |
| Social Features | Community infrastructure not yet warranted |
| Code Execution IDE | Browser-based compiler is a significant subsystem |

---

## 15. Known Gaps (Honest Status)

This section is deliberately honest. These are real gaps, not disclaimers.

### Security (Critical)

| Gap | Impact |
|---|---|
| Legacy `AdminController` not role-protected | Any authenticated user can invoke the legacy import path |
| Frontend `/admin` route uses `authGuard` only | Non-admin users can reach the admin UI |
| JWT secret committed in `appsettings.json` | Unsafe for any shared or deployed environment |
| Default admin creation unconditional | Bootstrap leaks dev credentials into production |
| Identity lockout + password policy not configured | Auth endpoint is unbounded |

### Feature Completeness

| Gap | Impact |
|---|---|
| Dashboard pagination UI | Users cannot navigate beyond page 1 of results |
| Revision-only filter / dedicated queue | Revision toggle exists; workflow does not |
| CheatSheet frontend (7 components) | Backend is live; no user-facing surface yet |
| Quiz timer enforcement | Assessment mode has no real time pressure |
| Quiz → UserProgress feed | Completing quizzes doesn't yet update dashboard stats |

### Testing

| Gap | Impact |
|---|---|
| 3 failing `ImportBackgroundWorkerTests` | Import pipeline not fully verified end-to-end |
| Zero frontend `.spec.ts` files | UI behavior is unverified outside manual testing |
| No security-focused tests | Auth boundary regressions have no automated safety net |

### Architecture

| Gap | Impact |
|---|---|
| Legacy `AdminController` bypasses application service | Inconsistent abstraction; direct `DbContext` access |
| FluentValidation not wired | Input DTOs rely on ad hoc null checks only |
| Frontend/backend DTO drift exists | Contract mismatch risk in edge cases |

---

## 16. Agent / AI Tool Orientation

If you are an AI coding agent, LLM tool, or MCP client entering this repository, start here.

### Step 0 — Mandatory Pre-Task Reading (ALL agents)

Before touching any code, read these three documents in order:

| # | Document | Why |
|---|---|---|
| 1 | [`docs/ENGINEERING_PLAYBOOK.md`](docs/ENGINEERING_PLAYBOOK.md) | Architecture rules, feature lifecycle, Definition of Done — the authority |
| 2 | [`docs/TRACKER.md`](docs/TRACKER.md) | Current task status, §14 Alignment Fixes, §15 TDD Initiative |
| 3 | [`docs/TDD_STRATEGY.md`](docs/TDD_STRATEGY.md) | Test coverage map, fixture protocol, test classification tags |

### Critical files

| Purpose | Path |
|---|---|
| Backend entrypoint | `src/InterviewPrepApp.Api/Program.cs` |
| EF Core model + config | `src/InterviewPrepApp.Infrastructure/Persistence/ApplicationDbContext.cs` |
| Seed data | `src/InterviewPrepApp.Infrastructure/Persistence/DatabaseSeeder.cs` |
| All backend services | `src/InterviewPrepApp.Infrastructure/Services/` |
| All API controllers | `src/InterviewPrepApp.Api/Controllers/` |
| Angular routes | `frontend/src/app/app.routes.ts` |
| App shell | `frontend/src/app/layouts/app-layout/app-layout.component.ts` |
| Dashboard page | `frontend/src/app/features/dashboard/dashboard-page/dashboard-page.component.ts` |
| Global styles | `frontend/src/styles.css` |
| Test suite | `tests/InterviewPrepApp.Tests/` |

### Test infrastructure

| Artifact | Path | Purpose |
|---|---|---|
| Test fixtures | `tests/fixtures/import-fixtures.json` | Single source of truth for all import test data |
| E2E blueprint | `tests/integration/import-flow.spec.ts` | 71 test cases mapped across 4-step validation path |
| xUnit test project | `tests/InterviewPrepApp.Tests/` | Backend test runner (xUnit + FluentAssertions + Moq) |
| TDD strategy | `docs/TDD_STRATEGY.md` | Coverage maps, run commands, risk register |

**Current test baseline:** 23 passing / 3 failing (`ImportBackgroundWorkerTests`). The 3 failures are a gate blocker for the StudyGuide parity milestone.

### Rules for all agents

1. **Never modify `Question` or `Answer` entities from the Quiz or CheatSheet modules.** All new modules reference existing QA entities read-only.
2. **Preserve Clean Architecture dependency direction.** Domain has no references to Application/Infrastructure. Infrastructure depends on Domain + Application. Api depends on all others.
3. **No MediatR.** All service calls are direct interface-based DI.
4. **All service returns use `Result<T>`.** Services do not throw business exceptions.
5. **Angular standalone components only.** No NgModules for any new component.
6. **Custom CSS only.** Do not introduce Tailwind unless a formal migration decision is made.
7. **Check TRACKER.md §14 Alignment Fixes** before starting any task — it documents every known mismatch between planning docs and code reality.
8. **Apply the feature closure gate** before marking any feature done: code ✅ → tests ✅ → UI verified ✅ → Improvements.md reviewed ✅ → PRD/TRD updated ✅ → TRACKER closed ✅.

---

*README reflects implementation state as of April 2026. For the full gap analysis see [`docs/Improvements.md`](docs/Improvements.md). For the execution tracker see [`docs/TRACKER.md`](docs/TRACKER.md).*

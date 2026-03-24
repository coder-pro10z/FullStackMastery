# Interview Prep App

Full-stack interview preparation platform built with ASP.NET Core 8, Entity Framework Core, SQL Server, ASP.NET Identity, JWT auth, and Angular 17 standalone components.

This README is written for engineers, editor agents, and MCP tools that need fast project context from the codebase as it exists today.

## 1. Agent Start Here

If you are a code editor agent, start with these files:

- Backend entrypoint: `src/InterviewPrepApp.Api/Program.cs`
- API controllers: `src/InterviewPrepApp.Api/Controllers/`
- EF Core model: `src/InterviewPrepApp.Infrastructure/Persistence/ApplicationDbContext.cs`
- Seed data: `src/InterviewPrepApp.Infrastructure/Persistence/DatabaseSeeder.cs`
- Core backend services: `src/InterviewPrepApp.Infrastructure/Services/`
- Angular routes: `frontend/src/app/app.routes.ts`
- Dashboard shell: `frontend/src/app/layouts/app-layout/app-layout.component.ts`
- Main user page: `frontend/src/app/features/dashboard/dashboard-page/dashboard-page.component.ts`
- Global frontend styling: `frontend/src/styles.css`

## 2. What The App Does

The platform helps candidates study for Full Stack .NET and Angular interviews by:

**Candidate features (implemented):**
- Browsing a curated question bank organized by hierarchical categories
- Filtering questions by search text, difficulty (Easy/Medium/Hard), and role (Frontend/Backend)
- Expanding answers with an accordion per question
- Marking questions as Solved or flagging for Revision
- Viewing progress summary cards (total, easy, medium, hard breakdowns)
- Registering and logging in with JWT-based authentication
- Starting quizzes in Practice or Assessment mode
- Playing through quiz attempts and reviewing completed quiz results

**Admin features (implemented):**
- Importing question banks from Excel (`.xlsx`) files via the current upload form
- Full CRUD for questions: create, edit, soft-delete, restore
- Hierarchical category management APIs (create, view, delete)
- Dashboard statistics (totals by difficulty, status, recent activity)
- Immutable audit log of all content changes
- Question version history (rollback-ready snapshots)
- CheatSheet resource APIs on the backend (`/api/resources`, `/api/admin/resources`)

**Partially implemented / still incomplete:**
- CheatSheet frontend pages, navigation, and admin UI
- Quiz timer enforcement and deeper assessment rules
- Revision-only queue/filter UI
- Dashboard pagination UI
- Full admin role enforcement across the legacy admin import path and frontend route

**Planned next:**
- Smart Revision Queue (dedicated revision study mode)

## 3. Current Architecture

The solution follows a practical 4-layer backend split plus a separate Angular frontend.

### Backend projects

- `src/InterviewPrepApp.Domain`
  - entities, enums, shared result type
- `src/InterviewPrepApp.Application`
  - DTOs and service interfaces
- `src/InterviewPrepApp.Infrastructure`
  - EF Core `ApplicationDbContext`, migrations, seed logic, service implementations, Excel parsing
- `src/InterviewPrepApp.Api`
  - ASP.NET Core API host, controllers, auth, Swagger, exception handling

### Frontend project

- `frontend`
  - Angular 17 standalone app
  - route guards, interceptor, models, API services
  - layout components, dashboard, auth screens, admin import page

## 4. Repository Map

```text
Interview_PrepApp/
|-- src/
|   |-- InterviewPrepApp.Api/
|   |   |-- Controllers/
|   |   |   |-- Admin/
|   |   |   |   |-- AdminQuestionsController.cs
|   |   |   |   |-- AdminCategoriesController.cs
|   |   |   |   |-- AdminDashboardController.cs
|   |   |   |   `-- AdminImportController.cs
|   |   |   |-- AuthController.cs
|   |   |   |-- CategoriesController.cs
|   |   |   |-- QuestionsController.cs
|   |   |   `-- UserProgressController.cs
|   |   |-- Infrastructure/
|   |   `-- Program.cs
|   |-- InterviewPrepApp.Application/
|   |   |-- DTOs/
|   |   `-- Interfaces/
|   |-- InterviewPrepApp.Domain/
|   |   |-- Entities/
|   |   |-- Enums/
|   |   `-- Shared/
|   `-- InterviewPrepApp.Infrastructure/
|       |-- Migrations/
|       |-- Persistence/
|       `-- Services/
|-- frontend/
|   |-- src/app/
|   |   |-- core/         (guards, interceptors, models, services)
|   |   |-- shared/       (reusable presentation components)
|   |   |-- features/     (smart page components)
|   |   `-- layouts/      (app shell, admin shell)
|   `-- package.json
|-- docs/
|   |-- ADMIN.MD          (Admin panel design & architecture)
|   |-- APPLICATION_FLOW.MD (End-to-end application flow)
|   |-- CheetSheet.md     (CheatSheet Hub feature spec)
|   |-- Command.md        (CLI command reference)
|   |-- Gemini_Backend.md (Backend TRD prompt)
|   |-- Gemini_Frontend.md (Frontend TRD prompt)
|   |-- Improvements.md   (Deep gap analysis & improvement plan)
|   |-- PRD.md            (Product Requirements Document)
|   |-- QUIZ.md           (Quiz system architecture)
|   |-- Steps.md          (Development phases)
|   |-- TRACKER.md        (Project tracker & execution plan)
|   `-- TRD.md            (Technical Requirements Document)
`-- README.md
```

## 5. Backend Domain Model

### Entities

#### `Category`

- `Id: int`
- `Name: string`
- `ParentId: int?`
- `Parent: Category?`
- `SubCategories: ICollection<Category>`
- `Questions: ICollection<Question>`

Purpose:
- Represents a hierarchical taxonomy.
- Supports nested topic trees like `Backend -> Security -> Authentication -> JWT`.

#### `Question`

- `Id: int`
- `Title: string?`
- `QuestionText: string`
- `AnswerText: string?`
- `Difficulty: Difficulty`
- `Role: string`
- `CategoryId: int`
- `Category: Category`
- `UserProgresses: ICollection<UserProgress>`

Purpose:
- Main study unit.
- Can hold both prompt and optional answer text.

#### `UserProgress`

- `UserId: string`
- `QuestionId: int`
- `IsSolved: bool`
- `IsRevision: bool`
- `User: ApplicationUser`
- `Question: Question`

Purpose:
- Join table between users and questions.
- Stores per-user solved/revision state.

#### `ApplicationUser`

- Inherits `IdentityUser`
- `UserProgresses: ICollection<UserProgress>`

Purpose:
- ASP.NET Identity user for login/register and JWT auth.

### Enum

#### `Difficulty`

- `Easy = 1`
- `Medium = 2`
- `Hard = 3`

### Entity Relationships

```text
ApplicationUser (1) --- (many) UserProgress (many) --- (1) Question

Category (1) --- (many) Question

Category (1 parent) --- (many children) Category
```

Important EF rules in `ApplicationDbContext`:

- `UserProgress` uses composite primary key: `(UserId, QuestionId)`
- `Category.ParentId` is self-referencing with `DeleteBehavior.Restrict`
- `Question.CategoryId` is a standard required FK
- categories are seeded during model creation via `DatabaseSeeder.GetSeedCategories()`

## 6. Database Notes

### Database provider

- SQL Server
- connection string is currently committed in `src/InterviewPrepApp.Api/appsettings.json`
- default DB name: `InterviewPrepAppDb`

### Identity tables

Because `ApplicationDbContext` inherits from `IdentityDbContext<ApplicationUser>`, the database contains:

- ASP.NET Identity tables for users, roles, claims, logins, tokens
- app tables for `Categories`, `Questions`, and `UserProgresses`

### Current seeded category shape

The seeder currently includes roots and nested children across:

- `Fundamentals`
- `Backend`
- `.NET`
- `Angular`
- `System Design`

Examples of deeper branches:

- `Fundamentals -> OOPS -> Abstraction -> Interfaces`
- `Backend -> Security -> Authentication -> JWT`
- `Backend -> Database -> ORM -> Entity Framework`
- `Backend -> API Design -> REST -> HTTP Methods`

Important constraint:
- The seeder keys categories by name only. That means duplicate category names in different branches are not currently possible without changing the seeding approach.

## 7. Backend Services

### `CategoryService`

File: `src/InterviewPrepApp.Infrastructure/Services/CategoryService.cs`

Responsibilities:

- reads flat categories from EF Core
- builds an in-memory tree response
- also returns a flat list for dropdown usage

Endpoints backed by this service:

- `GET /api/categories/tree`
- `GET /api/categories/flat`

### `QuestionService`

File: `src/InterviewPrepApp.Infrastructure/Services/QuestionService.cs`

Responsibilities:

- filtered question retrieval
- pagination
- subtree category expansion
- optional per-user solved/revision hydration

Supported filters:

- `categoryId`
- `searchTerm`
- `difficulty`
- `role`
- `pageNumber`
- `pageSize`

Behavior notes:

- category filtering includes all descendants of the selected category
- question ordering is by category name, then title/question text
- if a user is authenticated and their id is available, question DTOs include `IsSolved` and `IsRevision`

### `UserProgressService`

File: `src/InterviewPrepApp.Infrastructure/Services/UserProgressService.cs`

Responsibilities:

- computes dashboard totals
- toggles solved state
- toggles revision state
- creates/removes `UserProgress` rows as needed

Behavior notes:

- if both `IsSolved` and `IsRevision` become `false`, the row is deleted
- if a question id does not exist, a `KeyNotFoundException` is thrown and mapped by the global exception handler

### `ExcelExtractionService`

File: `src/InterviewPrepApp.Infrastructure/Services/ExcelExtractionService.cs`

Responsibilities:

- parses uploaded Excel question sheets using ClosedXML
- validates expected columns
- resolves category assignment
- constructs `Question` entities before persistence

Supported Excel assumptions:

- first worksheet only
- required headers: `Question`, `Role`, `Difficulty`
- optional header: `Category`
- two-row question/answer format is supported
- merged-cell answer rows are partially handled

Category resolution order:

1. `Category` column path, if present
2. `Role` matching a category name
3. `DefaultCategoryId` supplied by admin upload request

Accepted category path styles:

- `Backend/Security/JWT`
- `Backend -> Security -> JWT`

## 8. API Surface

Base URL from Angular environment:

- `http://localhost:5000/api`

### Auth

- `POST /api/auth/register`
- `POST /api/auth/login`

Request model:

```json
{
  "email": "user@example.com",
  "password": "string"
}
```

Response model:

```json
{
  "token": "jwt",
  "email": "user@example.com",
  "userId": "identity-user-id",
  "roles": ["Admin"]
}
```

### Categories

- `GET /api/categories/tree`
- `GET /api/categories/flat`

### Questions

- `GET /api/questions`

Query params:

- `categoryId`
- `searchTerm`
- `difficulty`
- `role`
- `pageNumber`
- `pageSize`

Returns:
- `PagedResponse<QuestionDto>`

Current reality:
- there is no `/api/questions/roles` endpoint
- there is no `isRevision` filter on the current public questions endpoint

### User Progress

Protected by `[Authorize]`:

- `GET /api/userprogress/summary`
- `POST /api/userprogress/{questionId}/toggle-solved`
- `POST /api/userprogress/{questionId}/toggle-revision`

### Admin

- `POST /api/admin/import-questions`
- `GET /api/admin/debug-categories`

Important reality:
- the legacy `AdminController` import/debug endpoints are **not** currently role-protected
- newer admin controllers under `src/InterviewPrepApp.Api/Controllers/Admin/` do use role attributes

### CheatSheet Resources

- `GET /api/resources?categoryId=`
- `POST /api/admin/resources`
- `DELETE /api/admin/resources/{id}`

Current reality:
- backend endpoints and persistence exist
- there is no finished CheatSheet frontend route or page yet

### Quizzes

- `POST /api/quizzes`
- `GET /api/quizzes/{id}`
- `POST /api/quizzes/{id}/responses/{questionId}`
- `POST /api/quizzes/{id}/submit`

Current reality:
- quiz supports `Practice` and `Assessment` modes
- assessment mode masks answer text until submission
- timer enforcement is not implemented yet

## 9. Auth And Security

### Backend

- JWT bearer auth configured in `Program.cs`
- issuer/audience/key are read from config
- Swagger is configured with Bearer auth support
- CORS allows `http://localhost:4200`
- global exception handling uses `.NET 8 IExceptionHandler`

Important reality:
- JWT settings are still committed in `src/InterviewPrepApp.Api/appsettings.json`
- legacy `AdminController` endpoints are still missing `[Authorize(Roles = "Admin")]`

### Startup bootstrap behavior

On API startup:

- `Admin` role is created if missing
- default admin user is created if missing
- migrations are applied automatically

Current default admin credentials:

- email: `admin@interviewprep.com`
- password: `Admin@123`

Important reality:
- default admin creation is currently unconditional, not wrapped in `IsDevelopment()`
- the default password is still hard-coded

### Frontend

- JWT is stored in `localStorage`
- auth interceptor attaches `Authorization: Bearer <token>`
- auth guard redirects unauthenticated users to `/login`

Important reality:
- `/admin` currently uses `authGuard` only in `app.routes.ts`
- an `adminGuard` file exists locally but is not the active route guard

## 10. Frontend Architecture

The Angular app uses standalone components and is organized into:

- `core/`
  - models, services, guards, interceptor
- `shared/components/`
  - reusable presentation components
- `features/`
  - page-level smart components
- `layouts/`
  - shell components for app and admin areas

### Current routes

Defined in `frontend/src/app/app.routes.ts`:

- `/login`
- `/register`
- `/`
  - guarded
  - renders `AppLayoutComponent` with `DashboardPageComponent`
- `/admin`
  - guarded
  - renders `AdminLayoutComponent` with `AdminDashboardComponent`
- `/quiz/new`
  - guarded
  - renders `QuizDashboardComponent`
- `/quiz/:id`
  - guarded
  - renders `QuizPlayerComponent`
- `/quiz/:id/review`
  - guarded
  - renders `QuizReviewComponent`

Important reality:
- the implemented routes do **not** match the older TRD path design that expected `/dashboard`
- the admin route is not role-guarded on the frontend yet

## 11. Frontend Screen Design

### Design direction as implemented

The current UI is **not** the dark Tailwind design described in earlier planning docs.

It is currently:

- custom CSS, not Tailwind
- warm light theme
- parchment/beige background gradients
- glassmorphism-like translucent panels
- orange/brown accent palette
- rounded cards and pill controls
- responsive desktop table plus mobile card layout

### Global design tokens

Defined in `frontend/src/styles.css`:

- background: warm beige gradient
- accent: orange (`--accent`, `--accent-deep`)
- status colors:
  - success green
  - warning amber
  - danger red
- panels:
  - translucent surfaces
  - blurred backdrop
  - large rounded corners
  - soft drop shadow

### Main user layout

`AppLayoutComponent` renders:

- left sidebar on desktop
- top scrollable category strip behavior on smaller screens
- main content area with router outlet

### Dashboard page composition

`DashboardPageComponent` renders, in order:

1. page header
2. progress summary cards
3. horizontal sub-category nav when a root category is selected
4. filter bar
5. question table

### Sidebar behavior

`SidebarComponent` currently shows only root categories plus `All`.

Behavior:

- active root category is highlighted if the selected category is the root or one of its descendants
- links navigate using query param `categoryId`

### Sub-category navigation

`SubCategoryNavComponent` appears only when a root category is selected.

Behavior:

- shows `All {RootCategory}`
- shows direct child categories of the current root
- uses horizontal pill navigation

### Progress cards

The dashboard summary currently shows:

- `Solved`
- `Easy`
- `Medium`
- `Hard`

Each card is a simple solved/total ratio display.

### Filter bar

Current filters:

- search text
- difficulty
- role

Important behavior:
- available role options are derived from the currently loaded question page, not from a global role dictionary
- there is no revision-only filter in the current filter bar

### Question table

Desktop:

- table layout
- columns: Question, Role, Difficulty, Category, Actions

Mobile:

- stacked cards
- difficulty badge on top row
- role badge and category below

Question display:

- title if present, else `Untitled question`
- question text
- answer text snippet inline if available
- solved toggle
- revision toggle

Important reality:
- answers use an expand/collapse accordion interaction
- dashboard currently requests `pageSize: 10` and does not expose pagination controls in the UI

### Auth screens

`LoginComponent` and `RegisterComponent` are:

- centered card layouts
- basic email/password forms
- inline error message text
- simple navigation between login and register

### Admin screen

`AdminLayoutComponent` gives:

- top bar
- dashboard navigation button
- logout button

`AdminDashboardComponent` gives:

- dropdown for default category
- file input for Excel upload
- plain success/failure message text

Important reality:
- admin upload is a standard file input form, not drag-and-drop
- there is no category management UI yet
- there is no structured display of backend `ProblemDetails` payloads yet
- there is no CheatSheet admin UI yet

### Quiz screens

Current quiz UI includes:

- setup screen for mode/category/role/difficulty/count
- player screen with sequential navigation and self-marked correctness
- review screen showing score breakdown and submitted answers

Important reality:
- there is no timer countdown or timeout enforcement in the current UI

## 12. Frontend Data Flow

### Category flow

- layout fetches category tree
- selected category comes from URL query param
- sidebar highlights current root
- dashboard resolves selected root and selected node from same category tree

### Question flow

- dashboard combines:
  - selected category from route query params
  - local filter state from `FilterBarComponent`
- dashboard calls `QuestionService.getQuestions(...)`
- returned items populate question table

### Progress flow

- dashboard loads summary once on init
- solved/revision toggles update UI optimistically
- failed toggle requests revert local state
- solved transitions also patch summary counts optimistically

## 13. DTOs And Frontend Models

The frontend models mirror backend DTOs under `frontend/src/app/core/models/`.

Key models:

- `auth.models.ts`
- `category.models.ts`
- `question.models.ts`
- `progress.models.ts`
- `admin.models.ts`

The main response wrapper is:

```ts
interface PagedResponse<T> {
  data: T[];
  totalRecords: number;
  pageNumber: number;
  pageSize: number;
}
```

## 14. Setup And Run

### Backend

Requirements:

- .NET 8 SDK
- SQL Server / SQL Express

Run:

```powershell
dotnet run --project src\InterviewPrepApp.Api\InterviewPrepApp.Api.csproj
```

Backend behavior on startup:

- applies pending EF migrations
- ensures admin role exists
- ensures default admin user exists

Swagger:

- available in Development environment
- typical URL: `https://localhost:<port>/swagger`

### Frontend

Requirements:

- Node.js
- npm

Run:

```powershell
cd frontend
npm install
npm start
```

Angular dev server:

- default URL: `http://localhost:4200`

## 15. Upcoming Features

The platform is evolving from a Question Practice App into a **Full Interview Preparation Platform**.

### CheatSheet Hub

The backend data model and APIs exist, but the end-user/frontend experience is still pending. The intended experience is a centralized resource library linked to the category tree. See [CheetSheet.md](file:///c:/Users/Praveen/Desktop/Interview_PrepApp/docs/CheetSheet.md).

### Quiz & Assessment Engine

The core quiz flow is already in the repository and uses read-only/snapshotted quiz attempts over the question bank. The next work is hardening it with timer enforcement and UX polish. See [QUIZ.md](file:///c:/Users/Praveen/Desktop/Interview_PrepApp/docs/QUIZ.md).

### Smart Revision Mode

A dedicated revision queue that surfaces bookmarked questions as a focused study workflow, moving beyond simple toggle-marking.

---

## 16. Known Gaps And Code Reality

These are important for any future agent working in the repo.

### Security gaps

- JWT key and connection settings are still committed in `appsettings.json`
- legacy `AdminController` endpoints are not role-protected
- frontend `/admin` route is not role-guarded
- default admin creation is still unconditional

### UX and feature gaps

- No dashboard pagination UI
- No revision-only filter UI
- CheatSheet frontend is not implemented
- Admin import feedback does not render `ProblemDetails` richly

### Architecture gaps

- No `IQuestionImportService` abstraction in the current application layer
- No automated test suite (backend or frontend)
- FluentValidation is not wired into the current API pipeline
- Some frontend/backend DTO drift exists

### Data/model caveats

- Category seeding blocks duplicates through slug-based validation.

For the full gap analysis, see [Improvements.md](file:///c:/Users/Praveen/Desktop/Interview_PrepApp/docs/Improvements.md).

---

## 17. Recommended Next Work

Prioritized execution plan (see [TRACKER.md](file:///c:/Users/Praveen/Desktop/Interview_PrepApp/docs/TRACKER.md) § Next Execution Plan):

### MAX Priority
1. Add dashboard pagination UI
2. Finish full admin role enforcement on backend + frontend
3. Move secrets and default admin bootstrap out of committed/default config

### HIGH Priority
1. Finish CheatSheet frontend
2. Add revision-only filter and queue
3. Harden quiz timer/assessment rules
4. Admin user management API

### MEDIUM Priority
1. FluentValidation for DTOs
2. Backend integration test suite
3. Markdown rendering for answers
4. Cache category tree (server + client)

## 18. Useful File Index

- `src/InterviewPrepApp.Api/Program.cs`
- `src/InterviewPrepApp.Api/Controllers/AuthController.cs`
- `src/InterviewPrepApp.Api/Controllers/CategoriesController.cs`
- `src/InterviewPrepApp.Api/Controllers/QuestionsController.cs`
- `src/InterviewPrepApp.Api/Controllers/UserProgressController.cs`
- `src/InterviewPrepApp.Api/Controllers/AdminController.cs`
- `src/InterviewPrepApp.Api/Infrastructure/GlobalExceptionHandler.cs`
- `src/InterviewPrepApp.Infrastructure/Persistence/ApplicationDbContext.cs`
- `src/InterviewPrepApp.Infrastructure/Persistence/DatabaseSeeder.cs`
- `src/InterviewPrepApp.Infrastructure/Services/CategoryService.cs`
- `src/InterviewPrepApp.Infrastructure/Services/QuestionService.cs`
- `src/InterviewPrepApp.Infrastructure/Services/UserProgressService.cs`
- `src/InterviewPrepApp.Infrastructure/Services/ExcelExtractionService.cs`
- `frontend/src/app/app.routes.ts`
- `frontend/src/app/layouts/app-layout/app-layout.component.ts`
- `frontend/src/app/features/dashboard/dashboard-page/dashboard-page.component.ts`
- `frontend/src/app/features/dashboard/components/question-table/question-table.component.ts`
- `frontend/src/app/features/admin/admin-dashboard/admin-dashboard.component.ts`
- `frontend/src/app/core/services/auth.service.ts`
- `frontend/src/app/core/services/question.service.ts`
- `frontend/src/app/core/services/progress.service.ts`
- `frontend/src/app/core/services/category.service.ts`
- `frontend/src/styles.css`

---

This README is intended to document the implementation currently in the repository, not only the original plan documents.

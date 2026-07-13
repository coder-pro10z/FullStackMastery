# ADMIN.MD - Admin Workspace Implementation Reference

> Version: 2.0 | Last Updated: March 2026

This document describes the admin area as it exists in the repository now, and highlights the gaps between the current implementation and the wider product documents.

---

## 1. Scope

The admin surface is currently focused on content operations:

- question CRUD
- soft-delete and restore
- category management
- dashboard statistics
- audit log read access
- bulk import
- cheat sheet resource CRUD APIs

It does not yet provide a finished user management UI or a role-assignment workflow.

---

## 2. Current Admin Reality

### 2.1 Frontend

The Angular admin experience is currently a single workspace page rendered by:

- `frontend/src/app/layouts/admin-layout/admin-layout.component.ts`
- `frontend/src/app/features/admin/admin-dashboard/admin-dashboard.component.ts`

The implemented tabs in the current admin workspace are:

- `dashboard`
- `questions`
- `categories`
- `import`

There is no dedicated frontend tab yet for:

- users
- audit logs
- cheat sheet resources

### 2.2 Routing

Current route:

```ts
/admin
```

The route is protected by `authGuard` only.

Important gap:

- frontend `adminGuard` is not the active guard on `/admin`

### 2.3 Backend

The backend admin surface is split between:

- legacy controller: `src/InterviewPrepApp.Api/Controllers/AdminController.cs`
- newer admin controllers: `src/InterviewPrepApp.Api/Controllers/Admin/`

Important reality:

- newer admin controllers use role attributes
- the legacy `AdminController` is still present and is not role-protected

That means admin RBAC is only partially complete.

---

## 3. Frontend Admin Workspace

## 3.1 Implemented layout

`AdminLayoutComponent` currently provides:

- top navigation
- link back to main dashboard
- sign-out action
- centered content container for the admin workspace

## 3.2 Implemented page behavior

`AdminDashboardComponent` currently includes:

- overview cards from dashboard stats
- difficulty breakdown
- recent activity feed
- question table with filters
- create/edit question modal
- category tree and category creation
- import area with file upload
- basic drag-and-drop affordance for import
- dry-run import support

## 3.3 Question management

Implemented behavior:

- list questions with paging support from backend
- filter by search term
- filter by difficulty
- filter by status
- include soft-deleted questions
- create question
- edit question
- soft-delete question
- restore deleted question

Current gaps:

- no separate trash page
- no publish endpoint in the active controller
- no explicit version-history UI even though the API exists

## 3.4 Category management

Implemented behavior:

- fetch hierarchical category tree
- create category
- display nested categories
- delete category

Current gaps:

- no edit/re-parent flow in the current UI
- no drag-and-drop ordering
- no separate category detail/editor view

## 3.5 Import UX

The admin workspace currently supports:

- file selection
- drag/drop file selection
- `.json`, `.csv`, and existing legacy `.xlsx` flow in the old controller path
- default category selection
- dry-run toggle
- summary of imported/skipped/failed rows
- warnings/errors displayed as plain text lines

Current gaps:

- no rich `ProblemDetails` rendering
- no validate-only endpoint separate from the import endpoint
- two different import paths exist in the codebase

---

## 4. Backend Admin Controllers

## 4.1 Legacy controller

File:

- `src/InterviewPrepApp.Api/Controllers/AdminController.cs`

Current endpoints:

- `POST /api/admin/import-questions`
- `GET /api/admin/debug-categories`

Important reality:

- `[Authorize(Roles = "Admin")]` is commented out
- this controller still uses `IExcelExtractor` directly
- this controller is the old Excel-centric import path

This is the main security inconsistency in the current admin implementation.

## 4.2 Newer admin controllers

### Questions

File:

- `src/InterviewPrepApp.Api/Controllers/Admin/AdminQuestionsController.cs`

Route:

```text
/api/admin/questions
```

Auth:

```csharp
[Authorize(Roles = "Admin,Editor")]
```

Implemented endpoints:

- `GET /api/admin/questions`
- `GET /api/admin/questions/{id}`
- `POST /api/admin/questions`
- `PUT /api/admin/questions/{id}`
- `DELETE /api/admin/questions/{id}`
- `POST /api/admin/questions/{id}/restore`
- `GET /api/admin/questions/{id}/versions`

### Categories

File:

- `src/InterviewPrepApp.Api/Controllers/Admin/AdminCategoriesController.cs`

Route:

```text
/api/admin/categories
```

Auth:

```csharp
[Authorize(Roles = "Admin")]
```

Implemented endpoints:

- `GET /api/admin/categories`
- `POST /api/admin/categories`
- `PUT /api/admin/categories/{id}`
- `DELETE /api/admin/categories/{id}`

### Dashboard and audit logs

File:

- `src/InterviewPrepApp.Api/Controllers/Admin/AdminDashboardController.cs`

Implemented routes:

- `GET /api/admin/dashboard`
- `GET /api/admin/audit-logs`

Auth:

- dashboard: `Admin,Editor`
- audit logs: `Admin`

### Import

File:

- `src/InterviewPrepApp.Api/Controllers/Admin/AdminImportController.cs`

Route:

```text
/api/admin/import
```

Auth:

```csharp
[Authorize(Roles = "Admin")]
```

Implemented endpoints:

- `POST /api/admin/import`
- `POST /api/admin/import/json`

Current behavior:

- supports `.json` and `.csv`
- supports `dryRun`
- returns bulk import summary DTOs

### CheatSheet resources

File:

- `src/InterviewPrepApp.Api/Controllers/Admin/AdminResourcesController.cs`

Route:

```text
/api/admin/resources
```

Auth:

```csharp
[Authorize(Roles = "Admin")]
```

Implemented endpoints:

- `POST /api/admin/resources`
- `DELETE /api/admin/resources/{id}`

### Users

There is no active, implemented admin users controller in the main admin flow yet.

---

## 5. Service Layer Used By Admin

The current admin backend is built on these application contracts and infrastructure services:

### Implemented

- `IAdminQuestionService` -> `AdminQuestionService`
- `IAdminDashboardService` -> `AdminDashboardService`
- `IAuditLogService` -> `AuditLogService`
- `IAdminCategoryService` -> `AdminCategoryService`
- `ICheatSheetService` -> `CheatSheetService`

### Not implemented as planned in older docs

- `IQuestionImportService`
- `IAdminUserService` as a working admin feature path
- FluentValidation-based admin validator pipeline

---

## 6. Data Contracts Used By Admin

Current admin DTOs include:

- `QuestionAdminDto`
- `CreateQuestionDto`
- `UpdateQuestionDto`
- `QuestionVersionDto`
- `DashboardStatsDto`
- `AuditLogDto`
- `CategoryManageDto`
- `CreateCategoryDto`
- `UpdateCategoryDto`
- `BulkImportResultDto`
- `ImportQuestionRowDto`
- `CheatSheetResourceDto`
- `CreateCheatSheetDto`

The current admin question list uses a paged wrapper:

```csharp
PagedAdminResult<T>
```

with:

- `data`
- `totalRecords`
- `pageNumber`
- `pageSize`
- `totalPages`

---

## 7. Security And RBAC

## 7.1 Intended role model

The broader product docs expect:

- `Admin` for full control
- `Editor` for content editing
- `User` for non-admin study features

## 7.2 Current controller enforcement

Current enforcement is mixed:

- `AdminQuestionsController`: `Admin,Editor`
- `AdminDashboardController`: `Admin,Editor`
- `AdminAuditLogsController`: `Admin`
- `AdminCategoriesController`: `Admin`
- `AdminImportController`: `Admin`
- `AdminResourcesController`: `Admin`
- legacy `AdminController`: no active role protection

## 7.3 Frontend enforcement

Current frontend route protection:

- `/admin` uses `authGuard`

Current gap:

- no active `adminGuard` on the admin route

## 7.4 Current security gaps

- legacy `/api/admin/import-questions` remains exposed without role attribute
- admin frontend route is not role-gated
- JWT key is still committed in `appsettings.json`
- default admin creation still runs unconditionally in `Program.cs`

---

## 8. Audit And Versioning

## 8.1 Audit logs

Audit logging is implemented and used by admin services for content actions.

Current backend support:

- immutable `AuditLog` entity
- audit log listing endpoint: `GET /api/admin/audit-logs`

Current frontend gap:

- no dedicated audit log screen yet

## 8.2 Question versioning

Question version history is implemented in the backend.

Current backend support:

- `QuestionVersion` entity
- `GET /api/admin/questions/{id}/versions`
- snapshot creation during question updates

Current frontend gap:

- no version-history UI in the admin workspace

---

## 9. Import Architecture

There are two import paths in the repository today.

## 9.1 Legacy path

Route:

- `POST /api/admin/import-questions`

Characteristics:

- Excel-first
- directly uses `IExcelExtractor`
- unprotected legacy controller

## 9.2 Newer admin path

Route:

- `POST /api/admin/import`

Characteristics:

- role-protected
- JSON and CSV support
- dry-run support
- returns `BulkImportResultDto`

This split should eventually be consolidated into one admin import path.

---

## 10. CheatSheet Admin Status

Current backend state:

- `CheatSheetResource` entity exists
- `CheatSheetResourceType` enum exists
- EF mappings and migration exist
- service and admin/public controllers exist

Current frontend admin state:

- no resources tab in the admin workspace
- no resource create/delete UI

So CheatSheet is backend-implemented, frontend-admin-pending.

---

## 11. Planned But Not Yet Delivered

The older admin design doc described a broader admin system than the current code actually provides.

Still planned or incomplete:

- admin user list
- role assignment UI/API flow
- user suspension
- dedicated audit logs screen
- dedicated resource management tab
- frontend role-based admin guard
- import preview screen with structured validation UX
- FluentValidation pipeline
- publish workflow
- richer markdown tooling
- admin analytics beyond the current overview cards

---

## 12. Recommended Next Steps

Based on the current code, tracker, and README, the admin roadmap should prioritize:

1. remove or protect the legacy `AdminController`
2. enable frontend `adminGuard` on `/admin`
3. move JWT secrets and default admin bootstrap out of committed/default config
4. consolidate import flows into a single admin import API
5. add a dedicated audit log tab
6. add version-history UI for questions
7. add user management only after the RBAC baseline is complete
8. add CheatSheet admin UI after core security and import cleanup

---

## 13. Source Index

Core files for the current admin implementation:

- `src/InterviewPrepApp.Api/Controllers/AdminController.cs`
- `src/InterviewPrepApp.Api/Controllers/Admin/AdminQuestionsController.cs`
- `src/InterviewPrepApp.Api/Controllers/Admin/AdminCategoriesController.cs`
- `src/InterviewPrepApp.Api/Controllers/Admin/AdminDashboardController.cs`
- `src/InterviewPrepApp.Api/Controllers/Admin/AdminImportController.cs`
- `src/InterviewPrepApp.Api/Controllers/Admin/AdminResourcesController.cs`
- `src/InterviewPrepApp.Infrastructure/Services/AdminQuestionService.cs`
- `src/InterviewPrepApp.Infrastructure/Services/AdminServices.cs`
- `frontend/src/app/layouts/admin-layout/admin-layout.component.ts`
- `frontend/src/app/features/admin/admin-dashboard/admin-dashboard.component.ts`
- `frontend/src/app/core/services/admin-api.service.ts`
- `frontend/src/app/core/services/admin.service.ts`
- `frontend/src/app/app.routes.ts`
- `docs/TRACKER.md`
- `README.md`
- `docs/TRD.md`
- `docs/PRD.md`

---

This document is intentionally implementation-first. When the code changes, update this file to match the repository rather than preserving outdated target-state designs.

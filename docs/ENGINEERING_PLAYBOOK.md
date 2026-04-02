# Engineering Playbook — FullStack Mastery Interview Preparation Platform

> **Version:** 1.0 | **Established:** April 2026
> **Authority:** This document is the single source of truth for infrastructure, workflows, and architectural standards.
> All contributors (human or AI) must treat the rules in this Playbook as non-negotiable unless a formal Architecture Decision Record (ADR) is raised and approved.

---

## Table of Contents

1. [Infrastructure & Architecture Map](#1-infrastructure--architecture-map)
2. [The Feature Lifecycle — The Incremental Path](#2-the-feature-lifecycle--the-incremental-path)
3. [Modification & Traceability Protocol](#3-modification--traceability-protocol)
4. [Definition of Done (DoD)](#4-definition-of-done-dod)
5. [Enforcement & Escalation](#5-enforcement--escalation)

---

## 1. Infrastructure & Architecture Map

### 1.1 System Topology

```
┌────────────────────────────────────────────────────────────────┐
│                   Angular 17 SPA (Frontend)                    │
│  Standalone Components │ No NgModules │ Custom CSS             │
│  core/ │ shared/ │ features/ │ layouts/                       │
│  JWT localStorage │ auth.interceptor │ authGuard / adminGuard  │
└────────────────────────────┬───────────────────────────────────┘
                             │ HTTP REST (JSON)
                             │ Base: http://localhost:5000/api
                             ▼
┌────────────────────────────────────────────────────────────────┐
│                ASP.NET Core 8 Web API                          │
│  JWT Bearer Auth │ CORS → localhost:4200                       │
│  GlobalExceptionHandler (RFC 7807 ProblemDetails)              │
│  Swagger (Development only)                                    │
│                                                                │
│  ┌──────────────┐   ┌───────────────────┐                     │
│  │  Controllers  │   │ Background Workers│                     │
│  │  (thin layer) │   │ (ImportWorker)    │                     │
│  └──────┬───────┘   └────────┬──────────┘                     │
│         │ interface calls     │                                │
│         ▼                    ▼                                 │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │            Application Layer (Interfaces + DTOs)          │ │
│  └──────────────────────────┬───────────────────────────────┘ │
│                             │ implemented by                   │
│                             ▼                                  │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │          Infrastructure Layer (EF Core + Services)        │ │
│  └──────────────────────────┬───────────────────────────────┘ │
│                             │ SQL                              │
│                             ▼                                  │
│                    SQL Server (Code-First)                      │
└────────────────────────────────────────────────────────────────┘
```

---

### 1.2 Backend — Clean Architecture

#### Dependency Direction Rule (ABSOLUTE)

```
Domain ← Application ← Infrastructure ← Api
```

No layer may reference a layer to its right. This is enforced by .NET project references.

| Layer | Project | Responsibilities | Forbidden |
|---|---|---|---|
| **Domain** | `InterviewPrepApp.Domain` | Entities, Enums, `Result<T>` | Any reference to Application, Infrastructure, or Api |
| **Application** | `InterviewPrepApp.Application` | Service interfaces (`IXxxService`), DTOs | Any EF Core, DbContext, or HTTP references |
| **Infrastructure** | `InterviewPrepApp.Infrastructure` | EF Core `ApplicationDbContext`, migrations, service implementations, parsers | Any reference to Api layer |
| **Api** | `InterviewPrepApp.Api` | Controllers, `Program.cs`, middleware, DI composition | Business logic; direct DbContext access except through services |

#### Folder Structure (Backend)

```
src/
├── InterviewPrepApp.Domain/
│   ├── Entities/           ← One file per entity, no logic beyond property definitions
│   ├── Enums/              ← One file per enum
│   └── Shared/
│       └── Result.cs       ← Result<T> pattern — do not add throw logic here
│
├── InterviewPrepApp.Application/
│   ├── Interfaces/         ← IXxxService.cs — one file per service contract
│   └── DTOs/
│       ├── Admin/
│       ├── Category/
│       ├── Progress/
│       ├── Quiz/
│       ├── CheatSheet/
│       └── Shared/
│
├── InterviewPrepApp.Infrastructure/
│   ├── Persistence/
│   │   ├── ApplicationDbContext.cs
│   │   ├── DatabaseSeeder.cs
│   │   └── Configurations/  ← One IEntityTypeConfiguration<T> per entity
│   ├── Migrations/          ← EF Core auto-generated; never manually edited
│   └── Services/            ← One XxxService.cs per IXxxService contract
│
└── InterviewPrepApp.Api/
    ├── Controllers/
    │   ├── Admin/           ← All admin controllers in this subfolder
    │   └── *.cs             ← Public controllers at root
    ├── Infrastructure/
    │   └── GlobalExceptionHandler.cs
    └── Program.cs
```

#### Backend Design Rules — Non-Negotiable

| Rule | Standard |
|---|---|
| **No MediatR / CQRS** | All service calls are direct interface-based DI. No `IRequest<T>` handlers. |
| **Result<T> always** | Every service method returns `Result<T>` or `Result`. Services never throw business exceptions. |
| **No raw SQL in production paths** | EF Core LINQ only. Raw SQL is permitted only in migration scripts. |
| **Controllers are pure delegation** | Zero business logic in controllers. Controllers call one service method, inspect `Result<T>`, and map to HTTP response. |
| **EF Code-First strictly** | Schema changes via migrations only. No manual `ALTER TABLE`. |
| **Soft-delete on all content entities** | `IsDeleted: bool`, `DeletedAt: DateTimeOffset?`; global query filter applied in DbContext. |
| **Audit every admin write** | All `POST`, `PUT`, `DELETE` on admin paths must write to `AuditLog`. |
| **Role protection on all admin endpoints** | `[Authorize(Roles = "Admin")]` on every controller or action under `Controllers/Admin/`. No exceptions. |
| **No cross-module entity mutation** | Quiz and CheatSheet modules must never write to `Question` or `Answer` tables. |

---

### 1.3 Frontend — Angular Architecture

#### Folder Structure (Frontend)

```
frontend/src/app/
├── core/
│   ├── guards/             ← authGuard.ts, adminGuard.ts, redirectIfLoggedIn.guard.ts
│   ├── interceptors/       ← auth.interceptor.ts
│   ├── models/             ← TypeScript interfaces mirroring backend DTOs
│   └── services/           ← API service classes (one per backend resource group)
│
├── shared/
│   └── components/         ← Stateless, reusable presentation components only
│       └── [component-name]/
│           ├── [component-name].component.ts
│           └── [component-name].component.css
│
├── features/               ← Smart, page-level components with data access
│   └── [feature-name]/
│       ├── [feature-name]-page.component.ts
│       ├── [feature-name]-page.component.css
│       └── components/     ← Feature-scoped sub-components
│
└── layouts/
    ├── app-layout/         ← Public app shell (sidebar, header)
    └── admin-layout/       ← Admin shell (admin nav)
```

#### Frontend Design Rules — Non-Negotiable

| Rule | Standard |
|---|---|
| **Standalone components only** | No NgModules for any new or modified component. |
| **Custom CSS only** | No Tailwind. All styles use the design token system in `styles.css`. Do not introduce `!important`. |
| **No business logic in templates** | All conditional computation lives in the component class as typed properties or methods, never inline in template expressions. |
| **Smart vs. Dumb component split** | Components in `shared/` are stateless and accept only `@Input()`/`@Output()`. Components in `features/` own data fetching and state. |
| **All admin paths behind adminGuard** | No admin route may be registered with `authGuard` alone. |
| **All API calls through services** | Components never call `HttpClient` directly. |
| **TypeScript strict mode** | No `any` types unless wrapping an untyped third-party API. All DTOs must have matching TypeScript interfaces in `core/models/`. |
| **Error surfaces always** | Every `subscribe` or `async` pipe that performs a write must handle the error case and surface it to the user via the toast/error system. |

#### Design Token Standard

All visual decisions are expressed through CSS custom properties defined in `frontend/src/styles.css`. Adding ad-hoc colors or spacing values directly to component CSS is prohibited.

```css
/* Example token pattern — extend, never override */
--accent:            /* primary action color */
--accent-deep:       /* hover/active state of accent */
--surface:           /* panel background */
--surface-border:    /* panel border */
--text-primary:      /* main content text */
--text-secondary:    /* labels, metadata */
--status-success:
--status-warning:
--status-danger:
```

---

### 1.4 Test Architecture

```
tests/
└── InterviewPrepApp.Tests/        ← Authoritative xUnit backend test project
    ├── Import/
    │   ├── Extractors/            ← Unit tests for each parser (LongForm, Quiz, StudyGuide)
    │   ├── Validators/            ← Unit tests for IQuestionImportValidator
    │   └── Workers/               ← Integration tests for ImportBackgroundWorker
    └── [future modules]/
```

**Current baseline:** 23 passing / 3 failing (`ImportBackgroundWorkerTests`). The 3 failures are a tracked gate blocker.

**Frontend tests:** No `.spec.ts` files currently exist. Until a test scaffold is established, UI sign-off requires explicit manual verification documented in TRACKER.

---

## 2. The Feature Lifecycle — The Incremental Path

Every feature follows this exact pipeline without exception. Steps may not be skipped or reordered.

```
Step 1: DOCUMENT → Step 2: DESIGN → Step 3: IMPLEMENT → Step 4: TEST → Step 5: VALIDATE → Step 6: CLOSE
```

### Step 1: Document First

Before a single line of code is written:

- [ ] The feature has a PRD user story (What + Why + persona)
- [ ] The feature has a TRD specification (entities, API surface, frontend routes)
- [ ] The TRACKER has an open ticket with an assigned owner and target sprint
- [ ] The DESIGN_UPDATE_PLAN is updated if the feature introduces architectural change
- [ ] The feature closure gate checklist is prepared in the TRACKER ticket

**Hard stop:** No code starts without a complete TRACKER ticket referencing PRD and TRD sections.

---

### Step 2: Design (Backend-First)

Work in this order:

1. **Domain:** Define new entities and enums. No implementation logic at this stage.
2. **Application:** Define service interface (`IXxxService`) and all required DTOs.
3. **Infrastructure:** Implement the service against the interface. Create EF migration.
4. **Api:** Wire controller. Apply `[Authorize(Roles = "Admin")]` on all admin endpoints. Register services in `Program.cs`.

**Rule:** The Angular frontend does not begin until the backend API is returning correct responses and is verifiable via Swagger.

---

### Step 3: Implement (Frontend)

Work in this order:

1. Define TypeScript interfaces in `core/models/` mirroring the new backend DTOs.
2. Create the API service in `core/services/`.
3. Build shared components in `shared/components/` if needed (stateless, `@Input()`/`@Output()` only).
4. Build feature page component in `features/[feature-name]/`.
5. Register the route in `app.routes.ts` with the correct guard.
6. Add sidebar/nav entry if the feature has a primary navigation surface.

---

### Step 4: Test

**Backend:**
- [ ] Unit tests written for new service logic (happy path + known failure paths)
- [ ] Integration test written for any new controller endpoint
- [ ] All existing tests still pass (`dotnet test`)
- [ ] `ImportBackgroundWorkerTests` failure count has not increased

**Frontend:**
- [ ] Manual walkthrough checklist documented in TRACKER (until `.spec.ts` scaffold exists):
  - [ ] Happy path verified in browser
  - [ ] Empty state verified
  - [ ] Error state verified (API down / invalid input)
  - [ ] Responsive layout verified (desktop + mobile viewport)
  - [ ] Admin guard verified (non-admin user cannot reach admin paths)

---

### Step 5: Validate (End-to-End)

- [ ] Backend API verified via Swagger with valid and invalid inputs
- [ ] Frontend verified against a running backend (not mocked)
- [ ] No browser console errors
- [ ] No unhandled promise rejections under network conditions
- [ ] `Improvements.md` reviewed — close or downgrade any item made obsolete by this feature
- [ ] PRD updated to reflect the feature's actual implemented state
- [ ] TRD updated with the accurate API surface and component inventory
- [ ] README §2 updated (Live Feature Status table)

---

### Step 6: Close

- [ ] TRACKER ticket status updated to ✅ Done
- [ ] All sub-tasks in the TRACKER ticket are closed
- [ ] TRACKER §14 Alignment Fixes reviewed — open a new fix item for any newly discovered mismatch
- [ ] TRACKER §12 PRD/TRD Alignment Status table updated
- [ ] Git commit message references the TRACKER ticket number

**Hard gate:** A feature is not Done until all six steps are complete. Partial completion at any step means the feature status in TRACKER remains 🔄 In Progress.

---

## 3. Modification & Traceability Protocol

### 3.1 Rule: All Modifications Are Explicitly Classified

Every change to the system falls into one of three modification classes. The class determines the required documentation trail before the change is merged.

| Class | Definition | Required Documentation Before Code Change |
|---|---|---|
| **Class A — Additive** | New entity, new endpoint, new component, new route. Does not alter existing contracts. | PRD user story + TRD spec + TRACKER ticket |
| **Class B — Corrective** | Bug fix, security patch, test fix. Changes behavior to match documented intent. | TRACKER ticket (referencing the gap) + TRACKER §14 Alignment Fix item |
| **Class C — Breaking** | Changes existing API contract, renames entity, drops column, changes EF relationship, changes route path. | PRD/TRD update + TRACKER ticket + DESIGN_UPDATE_PLAN entry + explicit callout in commit message |

**Absolute rule for Class C changes:** PRD and TRD must be updated and reviewed *before* the code change is written. No breaking change may be committed with stale documentation.

---

### 3.2 Document Update Triggers

| Trigger | Documents That Must Be Updated |
|---|---|
| New entity added to Domain | TRD §3 (Domain Model) + TRACKER §1 (Domain Layer) |
| New API endpoint added | TRD §4 (API Surface) + README §6 (API Reference) + TRACKER §4 (API Layer) |
| New Angular component created | TRD §5 (Frontend Architecture) + TRACKER §5–§8 (Frontend sections) |
| New route added in `app.routes.ts` | TRD §5.1 (Routing) + README §8 (Frontend Routes table) |
| Feature moves from Planned → In Progress | PRD section updated + TRACKER status updated |
| Feature moves from In Progress → Done | PRD status updated + TRD status updated + TRACKER closed + README §2 updated |
| Any gap discovered (code reality ≠ docs) | TRACKER §14 Alignment Fixes (new item added immediately) |
| Security status changes | TRD §8 (Security Requirements) + TRACKER §11.1 (Security) + README §7 (Security Model) |

---

### 3.3 The Documentation Chain of Authority

When two documents conflict, resolution follows this priority order:

```
Code Reality
    ↓
TRACKER §14 Alignment Fixes  ← first place gaps are recorded
    ↓
DESIGN_UPDATE_PLAN           ← architectural decisions override plan docs
    ↓
TRD                          ← technical authority
    ↓
PRD                          ← product authority
    ↓
README                       ← public representation (derives from all above)
```

**Rule:** The README is always the last document updated, never the first. It reflects the consensus of all internal documents, not the other way around.

---

### 3.4 The Non-Negotiable Pre-Merge Checklist

Before any code change is committed to the main branch, the following must be true:

```
[ ] The TRACKER ticket for this change is in 🔄 In Progress state
[ ] The Modification Class has been identified (A / B / C)
[ ] All required documents for that class have been updated (see §3.2)
[ ] No new document contradictions have been introduced
[ ] `dotnet test` passes with equal or fewer failures than the prior baseline
[ ] No new `[Authorize]` endpoints have been added without `[Authorize(Roles = "Admin")]`
    on admin-scoped controllers
[ ] No new Angular routes under the admin surface have been added with only `authGuard`
```

---

## 4. Definition of Done (DoD)

The following checklist is the **complete and exhaustive** gate for marking any development phase ✅ Done.

A phase may not be called Done if any item is unchecked. There are no partial credits.

### 4.1 Code Quality Gate

```
[ ] All new code follows the enforced folder structure (§1.2 / §1.3)
[ ] Dependency direction is preserved: Domain ← Application ← Infrastructure ← Api
[ ] No business logic exists in controllers (controllers are pure delegation)
[ ] No direct DbContext access from controllers (all access through service interfaces)
[ ] No raw SQL in production code paths
[ ] All new services return Result<T> — no thrown business exceptions
[ ] No `any` TypeScript types introduced
[ ] All new TypeScript interfaces are in `core/models/`
[ ] All new API calls from Angular components go through a service in `core/services/`
[ ] No new CSS values bypass the design token system in `styles.css`
[ ] All new admin backend routes use [Authorize(Roles = "Admin")]
[ ] All new admin frontend routes use adminGuard
[ ] New entities have soft-delete properties if they are content/user data
[ ] Admin write operations emit AuditLog entries
```

### 4.2 Testing Gate

```
[ ] Backend: unit tests written for new service methods (happy path + failure paths)
[ ] Backend: `dotnet test` passes with zero new failures introduced
[ ] Backend: failing test count has not increased from prior baseline
[ ] Frontend: manual walkthrough documented in TRACKER (until spec scaffold exists):
    [ ] Happy path complete
    [ ] Empty state handled and visible
    [ ] Error/failure state handled and surfaced to user
    [ ] Desktop layout verified
    [ ] Mobile layout verified
    [ ] Admin-only paths verified as inaccessible to non-admin users
```

### 4.3 Documentation Gate

```
[ ] PRD: feature section reflects actual implemented state (not "planned")
[ ] TRD: API Surface table updated with all new/changed endpoints
[ ] TRD: Frontend Architecture table updated with all new/changed components
[ ] TRD: Domain Model table updated with all new/changed entities
[ ] TRACKER: all sub-tasks for this feature are ✅ Done
[ ] TRACKER §12 (PRD/TRD Alignment Status): row updated for affected areas
[ ] TRACKER §14 (Alignment Fixes): new gap items opened for any mismatch discovered during this work
[ ] DESIGN_UPDATE_PLAN: updated if this work introduced an architectural deviation
[ ] README §2 (Live Feature Status): feature moved to correct status tier
[ ] README §6 (API Reference): new endpoints documented
[ ] Improvements.md: stale items made obsolete by this work are closed or downgraded
```

### 4.4 Architecture Gate

```
[ ] No new module introduces write operations against existing Question or Answer entities
[ ] No new EF migration breaks existing migrations (verified by dropping and re-running)
[ ] All new entities and configs follow the established EF Core patterns
    (DeleteBehavior.Restrict for self-referencing, composite keys documented,
     global query filters applied for soft-deleted entities)
[ ] No new NuGet or npm packages introduced without explicit justification documented
    in the TRACKER ticket
[ ] Swagger reflects the correct contract for all new endpoints
```

### 4.5 Security Gate

```
[ ] No new secrets, API keys, or connection strings committed to source control
[ ] [Authorize(Roles = "Admin")] verified on every new admin controller/action
[ ] adminGuard verified on every new admin frontend route
[ ] New file upload endpoints (if any) validate: extension, MIME type, size, and structure
[ ] Auth flow verified: unauthenticated → redirected to /login,
    authenticated non-admin → blocked from /admin, admin → full access
```

---

## 5. Enforcement & Escalation

### 5.1 Playbook Authority

This Playbook is owned by the Principal Architect role. Changes to this document require:

1. A documented reason for the change
2. An update to the DESIGN_UPDATE_PLAN noting the deviation and its justification
3. A TRACKER §14 Alignment Fix item if the change corrects a gap found in the current system

### 5.2 Agent / AI Tool Compliance

All AI coding agents working in this repository are bound by this Playbook. Before beginning any implementation task, an agent must:

1. Read this Playbook (`docs/ENGINEERING_PLAYBOOK.md`)
2. Read the current TRACKER (`docs/TRACKER.md`) — specifically §14 Alignment Fixes and the Next Execution Plan
3. Read the relevant PRD and TRD sections for the feature being worked on
4. Identify the Modification Class (A / B / C) for the task
5. Confirm all documentation pre-conditions for that class are met before writing code

**Non-compliance default:** If an agent is uncertain about a rule, the default is to ask before implementing, not to implement and document.

### 5.3 Escape Hatch — When to Deviate

A documented deviation is acceptable. An undocumented deviation is not.

If a rule in this Playbook cannot be followed due to legitimate technical constraints, the engineer must:

1. Document the deviation in TRACKER §14 Alignment Fixes
2. Record the justification in a code comment at the point of deviation
3. Update the DESIGN_UPDATE_PLAN under "Architectural Deviations"
4. Flag the deviation in the TRACKER ticket for this feature

---

*This Playbook is a living document. It should be updated whenever a new architectural decision is made, a new module is introduced, or a significant gap is discovered and resolved.*

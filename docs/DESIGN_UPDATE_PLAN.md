# PRD/TRD Realignment and Feature-Gate Plan

## Summary
- Rewrite the planning docs so they reflect repository truth as of April 1, 2026, not older future-state assumptions.
- Normalize status language across the docs to only three states: `implemented + verified`, `implemented + stabilization pending`, and `planned`.
- Adopt a hard delivery gate: no new feature starts until the current one passes backend verification, UI validation, doc updates, Improvements review, and final Tracker closure.
- Execute in this order: `documentation baseline reset -> quiz completion cycle -> StudyGuide import parity cycle -> Cheatsheet frontend cycle`.

## Key Changes
- PRD:
  - Reclassify strict import policies, validation, and async import-job behavior as current platform capability.
  - Move quiz from “planned feature” to “implemented core flow with remaining hardening”.
  - Split the mixed naming into two product concepts: `StudyGuide import` for ingestion/admin pipeline and `CheatSheet Hub` for user-facing resource browsing.
  - Add a release rule stating every feature must finish code, tests, UI check, Improvements review, and Tracker update before the next feature begins.
- TRD:
  - Add a dedicated import architecture section covering module-specific file policies, parsing, business validation, job processing, persistence, reporting, and UI contract checks.
  - Replace old quiz planned APIs/routes with the current attempt lifecycle and document only the remaining hardening items.
  - Document StudyGuide import as the next parity target and Cheatsheet UI as the follow-on frontend target.
  - Add a test-architecture note that the newer import suite exists outside the current solution and must be stabilized/aligned before it counts as sign-off evidence.
- Improvements:
  - Review every item and correct stale entries instead of keeping blanket claims like “no tests”.
  - Close or downgrade items already reflected in code, including frontend `adminGuard`, role-protected active admin endpoints, quiz core flow, and import validation coverage.
  - Keep only real remaining gaps: failing async import-worker tests, missing Angular specs, quiz timer/UI hardening, StudyGuide parity, and Cheatsheet frontend.
- Tracker:
  - Add a mandatory per-feature closure checklist.
  - Refresh current statuses from code reality.
  - Replace the execution order with `Quiz completion -> StudyGuide import parity -> Cheatsheet frontend`.
  - Make Tracker the final closeout step after PRD/TRD and Improvements are updated.

## Public Interfaces To Reclassify In Docs
- Question import: `POST /api/admin/import` as the main questions pipeline, with the legacy question import route called out separately only if it remains supported.
- Quiz import and StudyGuide import: `POST /api/admin/import-quizzes`, `POST /api/admin/import-study-guides`, plus import-job status/error/retry endpoints.
- Quiz runtime: `POST /api/quizzes`, `GET /api/quizzes/{id}`, `POST /api/quizzes/{id}/responses/{questionId}`, `POST /api/quizzes/{id}/submit`, and frontend routes `/quiz/new`, `/quiz/:id`, `/quiz/:id/review`.
- Access control: role-based admin API protection and frontend admin route guarding are current behavior and should no longer be documented as purely pending.
- Naming: use `StudyGuide` for import/ingestion and `CheatSheet Hub` for the user-facing resource experience; stop using both labels interchangeably.

## Test Plan
- Baseline doc audit:
  - Cross-check every status table against code before rewriting any section.
  - Use April 1, 2026 as the baseline date for all “current state” language.
- Current quality baseline to capture honestly:
  - Backend import suite in `src/InterviewPrepApp.Tests` currently reports 23 passing and 3 failing `ImportBackgroundWorkerTests`.
  - Angular frontend currently has no discovered `.spec.ts` files, so UI sign-off must include explicit manual verification until a frontend test scaffold exists.
- Quiz completion gate:
  - Verify timer/assessment behavior, navigation, empty/error states, and review flow.
  - Only then update PRD/TRD, review Improvements, and close the Tracker items.
- StudyGuide import parity gate:
  - Match Question/Quiz import standards across parser rules, validation, background-job behavior, admin/operator feedback, and regression coverage.
  - Fix or explicitly clear the current async worker test failures before marking parity complete.
- Cheatsheet frontend gate:
  - Complete user browse flow, navigation entry, resource display, admin touchpoints, and UI walkthrough before any later feature starts.
- Quality follow-up:
  - Align the authoritative import test suite with the solution/CI path and retire or merge the older duplicate test project so the docs point to one source of truth.

## Assumptions And Defaults
- PRD and TRD become the canonical high-level docs; Quiz, CheatSheet, and Import Validation docs remain supplemental deep dives.
- The hard gate is mandatory for every feature.
- The next full completion target after quiz is StudyGuide import parity; Cheatsheet frontend begins only after that gate closes.
- README sync is limited to sections whose status claims conflict with the corrected PRD/TRD/Tracker.
- Supporting doc filenames can stay as they are for now; terminology inside the content should still be standardized.

---

## v2.0 Architecture & Workflow Adjustments

> **Established:** April 2026
> **Source:** Audit of current project state against `docs/ENGINEERING_PLAYBOOK.md` v1.0 standards.
> **Scope:** This section records every structural gap, workflow risk, and required adjustment identified during the post-Playbook audit. Items are ordered by severity: Critical → High → Medium → Structural.

---

### GAP-01 · Legacy `AdminController` Violates Role Enforcement Standard
**Severity:** CRITICAL
**Playbook Rule:** §1.2 — "Role protection on all admin endpoints: `[Authorize(Roles = "Admin")]` on every controller or action under `Controllers/Admin/`. No exceptions."
**Current State:** The legacy `AdminController` (original import and debug endpoints) uses `[Authorize]` only. Any authenticated user can invoke `POST /api/admin/import` (legacy path) and `/debug-*` endpoints.
**Required Action:**
- Apply `[Authorize(Roles = "Admin")]` to all actions in the legacy `AdminController`.
- If debug endpoints (`/debug-categories`, `/debug-questions`) are development-only, gate them behind `[ApiExplorerSettings(IgnoreApi = true)]` and a `IsDevelopment()` conditional, or remove them entirely before public release.
- **Classification:** Class B (Corrective). TRACKER §11.1 item must move from 🔄 to ✅ before any other security work is declared done.

---

### GAP-02 · Frontend `/admin` Route Violates `adminGuard` Standard
**Severity:** CRITICAL
**Playbook Rule:** §1.3 — "All admin paths behind adminGuard. No admin route may be registered with `authGuard` alone."
**Current State:** `app.routes.ts` registers `/admin` with `authGuard` only. The `adminGuard` file exists locally but is not the active guard on this route.
**Required Action:**
- Replace `authGuard` with `adminGuard` on the `/admin` route in `app.routes.ts`.
- Verify the guard reads the `roles` claim from auth state and redirects non-admin users to `/` (not `/login`).
- Add manual verification in TRACKER: non-admin authenticated user cannot navigate to `/admin`.
- **Classification:** Class B (Corrective).

---

### GAP-03 · Default Admin Bootstrap Runs Unconditionally
**Severity:** CRITICAL
**Playbook Rule:** §4.5 Security Gate — "No new secrets, API keys, or connection strings committed to source control."
**Current State:** `Program.cs` creates the default admin user (`Admin@123`) unconditionally on every startup. This runs in production environments.
**Required Action:**
- Wrap the admin user creation block in `if (app.Environment.IsDevelopment()) { ... }`.
- Separately: move the JWT key, connection string, and default credentials from `appsettings.json` to .NET User Secrets for local development and environment variables for deployment.
- **Classification:** Class B (Corrective). This is a standalone MAX Priority TRACKER task — do not bundle it with the role enforcement task.

---

### GAP-04 · No Feature Closure Checklist Exists in TRACKER
**Severity:** HIGH
**Playbook Rule:** §2 Feature Lifecycle Step 1 — "The feature closure gate checklist is prepared in the TRACKER ticket."
**Current State:** The TRACKER Next Execution Plan lists tasks but no gate criteria. No per-feature closure checklist template exists anywhere in TRACKER.
**Required Action:**
- Add TRACKER §0 (or §15) "Feature Closure Gate Template" with the following reusable checklist:
  ```
  [ ] Backend code complete and follows Clean Architecture rules
  [ ] All new admin endpoints use [Authorize(Roles = "Admin")]
  [ ] All new admin frontend routes use adminGuard
  [ ] Backend: dotnet test passes with zero new failures
  [ ] Frontend: manual walkthrough documented (happy / empty / error / desktop / mobile / auth)
  [ ] Improvements.md reviewed; stale items closed or downgraded
  [ ] PRD section updated to reflect actual implemented state
  [ ] TRD API Surface, Domain Model, and Frontend Architecture tables updated
  [ ] README §2 Live Feature Status updated
  [ ] TRACKER §12 PRD/TRD Alignment Status row updated
  [ ] TRACKER §14 Alignment Fixes reviewed; new gaps recorded
  [ ] TRACKER ticket moved to ✅ Done
  ```
- Apply this template retroactively to the Quiz and CheatSheet Backend features (to make their pending items visible).
- **Classification:** Class A (Additive — new process artifact, no code change).

---

### GAP-05 · No Modification Class Discipline in Current Practice
**Severity:** HIGH
**Playbook Rule:** §3.1 — "Every change to the system falls into one of three modification classes (A / B / C). The class determines the required documentation trail before the change is merged."
**Current State:** The TRACKER tracks tasks but does not classify them by modification type. Breaking changes (Class C) such as API contract changes or route renames have no pre-merge documentation gate.
**Required Action:**
- Add a "Modification Class" column to the TRACKER Next Execution Plan table: `[A / B / C]`.
- Classify each open task retroactively. Examples:
  - Dashboard pagination UI → Class A (additive frontend; no backend contract change)
  - `adminGuard` activation → Class B (corrective; existing route fix)
  - JWT secret migration → Class B (corrective; config change, no API change)
  - StudyGuide import parity → Class A (new backend module; additive)
  - CheatSheet frontend → Class A (additive; backend already exists)
- Any current or future Class C change requires a DESIGN_UPDATE_PLAN entry before code is written.
- **Classification:** Class A (process change, no code).

---

### GAP-06 · `tests/` Directory Path Inconsistency
**Severity:** HIGH
**Playbook Rule:** §1.4 — "The authoritative test project is `tests/InterviewPrepApp.Tests`."
**Current State:** TRACKER §14 Alignment Fix #11 references `src/InterviewPrepApp.Tests` as the test project path. The DESIGN_UPDATE_PLAN §Test Plan also references this path. The actual project root-level directory is `tests/`, not `src/`. All documentation must use the canonical path.
**Required Action:**
- Update all references in PRD, TRD, TRACKER, and DESIGN_UPDATE_PLAN to use `tests/InterviewPrepApp.Tests/` as the authoritative path.
- Verify the `.sln` file includes the test project at the correct path.
- **Classification:** Class B (Corrective — documentation fix).

---

### GAP-07 · TRACKER §13 Phase Labels Misclassify Deferred Features
**Severity:** MEDIUM
**Playbook Rule:** §3.3 — "When two documents conflict, resolution follows the priority chain: TRACKER §14 → DESIGN_UPDATE_PLAN → TRD → PRD."
**Current State:** TRACKER §13 "Out of Scope" labels AI Copilot, Resume Analyzer, Payments, Social Features, and Code Execution as "Phase 2." The PRD §3 correctly labels all of these as "Phase 3 — Future Scope." Phase 2 is the active delivery phase (CheatSheet Hub, Quiz, Smart Revision Mode).
**Required Action:**
- Update TRACKER §13 "Out of Scope" table: change all "Phase 2" labels to "Phase 3" to match PRD §3.
- **Classification:** Class B (Corrective — documentation only).

---

### GAP-08 · No Owner Column in TRACKER Next Execution Plan
**Severity:** MEDIUM
**Playbook Rule:** §2 Step 1 — "The TRACKER has an open ticket with an assigned owner and target sprint."
**Current State:** The TRACKER Next Execution Plan (§ Next Execution Plan) has columns `#`, `Task`, `Impact` — but no `Owner` or `Target` column. Every task is currently unowned and unscheduled.
**Required Action:**
- Add `Owner` and `Target` columns to all three priority tables (MAX / HIGH / MEDIUM).
- For a solo project, "Owner" may be `Solo` or a persona name, but it forces the discipline of explicit assignment.
- Add a target sprint or date for MAX-priority items at minimum.
- **Classification:** Class A (process change).

---

### GAP-09 · AuditLog Coverage Not Enforced for New Modules
**Severity:** MEDIUM
**Playbook Rule:** §1.2 — "Audit every admin write: All POST, PUT, DELETE on admin paths must write to AuditLog."
**Current State:** `AuditLog` exists and is used for admin question operations. It is not explicitly confirmed for CheatSheet admin operations (`POST /api/admin/resources`, `DELETE /api/admin/resources/{id}`) or Quiz admin operations.
**Required Action:**
- Verify that `AdminResourcesController` and all admin-write paths for CheatSheet and Quiz emit `AuditLog` entries.
- Add to the DoD checklist for all future admin features: "Admin write operations emit AuditLog entries" (already in Playbook §4.1).
- **Classification:** Class B (Corrective — code verification + potential gap fix).

---

### GAP-10 · No Architecture Decision Records (ADRs) for Known Deviations
**Severity:** MEDIUM
**Playbook Rule:** §5.3 Escape Hatch — "A documented deviation is acceptable. An undocumented deviation is not."
**Current State:** Two major deviations from the original TRD exist — custom CSS instead of Tailwind, and `/` instead of `/dashboard` as the root route. These are noted in the TRD as footnotes but are not formally recorded as ADRs. Future agents may re-introduce Tailwind or the old route expecting to "fix" them.
**Required Action:**
- Create `docs/ADR/` directory with two initial records:
  - `ADR-001-custom-css-not-tailwind.md` — documents the decision, rationale, and consequence (all new styling must use the custom CSS token system).
  - `ADR-002-root-route-not-dashboard.md` — documents the implemented routing decision.
- Reference the ADR directory from the ENGINEERING_PLAYBOOK §5.3.
- **Classification:** Class A (additive documentation).

---

### GAP-11 · No Formal `FluentValidation` Scope or Owner Defined
**Severity:** MEDIUM
**Playbook Rule:** §2 Step 1 — "The TRACKER has an open ticket with an assigned owner" and §4.1 Code Quality Gate — all input DTOs should have validation.
**Current State:** FluentValidation appears in TRACKER §3 (`⏳`), §11.3 (`⏳`), and the Next Execution Plan Task #11 — but with no list of which specific DTOs to validate first, no registration pattern defined, and no owner.
**Required Action:**
- Expand TRACKER Task #11 (FluentValidation) into a scoped specification:
  - **Scope (Phase 1):** `CreateQuestionDto`, `UpdateQuestionDto`, `CreateCheatSheetDto`, `LoginDto`, `RegisterDto`
  - **Registration pattern:** `AddFluentValidationAutoValidation()` + `AddValidatorsFromAssemblyContaining<CreateQuestionValidator>()`
  - **Response format:** Validation errors must surface as RFC 7807 `ProblemDetails` with `errors` object (consistent with existing GlobalExceptionHandler)
- **Classification:** Class A (additive — new validation layer, no breaking changes to existing contracts).

---

### GAP-12 · `ENGINEERING_PLAYBOOK.md` Not Referenced from TRACKER or README
**Severity:** STRUCTURAL
**Playbook Rule:** §5.2 — "All AI coding agents working in this repository are bound by this Playbook. Before beginning any implementation task, an agent must read this Playbook."
**Current State:** The Playbook was just created. It is not yet linked from the README Agent Orientation section (§16) or the TRACKER agent instructions (§ bottom of file).
**Required Action:**
- Add to README §16 (Agent / AI Tool Orientation): "First, read `docs/ENGINEERING_PLAYBOOK.md`." as Step 0.
- Update the TRACKER footer agent instructions to reference `docs/ENGINEERING_PLAYBOOK.md` as the authority for process and architectural rules.
- **Classification:** Class A (documentation linkage).

---

### Summary of Required Actions by Priority

| Priority | Gap | Classification | Owner |
|---|---|---|---|
| CRITICAL | GAP-01: Legacy AdminController role enforcement | Class B | — |
| CRITICAL | GAP-02: `/admin` route adminGuard activation | Class B | — |
| CRITICAL | GAP-03: Unconditional admin bootstrap + secret hygiene | Class B | — |
| HIGH | GAP-04: Feature closure checklist in TRACKER | Class A | — |
| HIGH | GAP-05: Modification class discipline in TRACKER | Class A | — |
| HIGH | GAP-06: Test project path inconsistency in docs | Class B | — |
| MEDIUM | GAP-07: TRACKER §13 Phase label correction | Class B | — |
| MEDIUM | GAP-08: Owner + Target columns in Execution Plan | Class A | — |
| MEDIUM | GAP-09: AuditLog coverage for new modules | Class B | — |
| MEDIUM | GAP-10: ADRs for existing documented deviations | Class A | — |
| MEDIUM | GAP-11: FluentValidation scope + spec definition | Class A | — |
| STRUCTURAL | GAP-12: Playbook not linked from README / TRACKER | Class A | — |

# 📄 Product Requirements Document (PRD)

**Product Name:** Full Stack .NET & Angular Interview Preparation Platform
**Author:** Product Manager
**Target Audience:** Engineering, Design, QA, Stakeholders

---

## Background

Software engineers preparing for Full Stack .NET and Angular interviews face a fragmented learning experience. Existing platforms over-index on raw DSA while neglecting framework-specific concepts, system design, and scenario-based questions. Candidates waste hours compiling Notion docs and Excel sheets instead of actually studying.

**The Solution:** A centralized, distraction-free web platform providing curated, categorized question banks tailored to .NET backend and Angular frontend roles, with progress tracking, revision tools, and content management.

---

## User Personas

### Persona 1: The Ambitious Candidate (End-User)
- **Profile:** Junior to Mid-level developer applying for Full Stack roles.
- **Goals:** Identify knowledge gaps, practice real-world scenario questions, track preparation progress over 4–8 weeks.
- **Frustrations:** Overwhelmed by unstructured tutorials; unsure what concepts are actually asked.

### Persona 2: The Platform Admin (Internal)
- **Profile:** Product owner/content curator.
- **Goals:** Rapidly add and categorize questions without direct database access.
- **Frustrations:** Manually entering hundreds of questions through tedious forms.

---

## Phase 1 (MVP) — ✅ FINALIZED & IMPLEMENTED

> This section documents what is **actually implemented** in the current codebase.

### Core Features (Delivered)

| Feature | Status | Notes |
|---------|--------|-------|
| JWT-based Register / Login | ✅ | Full auth flow with token persistence |
| Hierarchical category sidebar | ✅ | Root categories + horizontal sub-nav pills |
| Question browsing with filters | ✅ | Search, difficulty, role, category subtree |
| Paginated question API | ✅ | Backend paged; **UI pagination not yet surfaced** |
| Solved / Revision toggles | ✅ | Optimistic updates, `UserProgress` join table |
| Dashboard progress summary cards | ✅ | Total, Easy, Medium, Hard breakdown |
| Admin Excel bulk import | ✅ | `.xlsx` upload, category/role resolution |
| Admin question CRUD | ✅ | Create, update, soft-delete, restore |
| Admin category management | ✅ | Hierarchical tree CRUD |
| Admin dashboard stats | ✅ | Question counts by difficulty/status |
| Audit logging | ✅ | Immutable `AuditLog` entity |
| Question versioning | ✅ | Append-only version history |
| Responsive dark-mode UI | ✅ | Custom CSS dark theme (not Tailwind as originally planned) |
| Angular standalone components | ✅ | No NgModules |
| Clean Architecture (.NET 8) | ✅ | 4-layer, no MediatR, `Result<T>` pattern |

### Known Phase 1 Gaps (Not Yet Complete)

| Gap | Impact | Priority |
|-----|--------|----------|
| Dashboard pagination UI | Core navigation incomplete | MAX |
| Admin role enforcement (backend guards) | Security vulnerability | MAX |
| Frontend `adminGuard` (role-based) | UI exposes admin to all authenticated users | MAX |
| JWT secret in committed config | Insecure for deployment | MAX |
| Revision-only filter / queue | Toggle exists, workflow does not | HIGH |
| Answer expand/collapse interaction | Study UX feels passive | HIGH |
| Admin import `ProblemDetails` rendering | Coarse feedback to operators | MEDIUM |

---

## Phase 2 — Planned Enhancements

> These features are **designed and documented** but not yet implemented.

### 2.1 CheatSheet Hub (Revision Tool Enhancement)

A centralized resource library linked to the existing category tree. Users browse supporting material by category.

**Resource types:** PDF links, Markdown notes, External links

**User Story:** *As a candidate, I want to access topic-specific cheat sheets alongside questions so I can review structured notes without leaving the platform.*

**Scope:**
- MVP: Metadata-based resources (URL + markdown stored in DB, no file server)
- Future: Server-side PDF upload with cloud blob storage

### 2.2 Quiz & Assessment Engine

A quiz system layered on top of the existing question bank using read-only referencing. Questions are drawn from the `Question` table without modifying it.

**Two modes:**
- **Mock Mode:** Instant per-question feedback with explanation
- **Real Mode:** Timed assessment; answers masked until submission

**User Story:** *As a candidate, I want to simulate a real interview under time pressure so I can identify gaps before the actual interview.*

**Architectural constraint:** The Quiz system must NEVER modify the existing `Question`/`Answer` domain entities. It references them read-only via `QuizQuestion.OriginalQuestionId`.

### 2.3 Smart Revision Mode

A dedicated revision queue that surfaces all bookmarked questions as a prioritized, focused study session — moving beyond simple bookmark toggling.

**User Story:** *As a candidate, I want to review only my bookmarked questions in a focused mode so I can efficiently use the day before my interview.*

---

## Phase 3 — Future Scope (Out of Scope Now)

| Feature | Reason Deferred |
|---------|----------------|
| AI Interview Copilot | Requires LLM integration and voice evaluation infrastructure |
| Resume Analyzer (PDF + ATS) | Requires document parsing pipeline |
| Monetization / Payments | Business model decision pending |
| Social Features (leaderboards, comments) | Community infrastructure not yet warranted |
| Code Execution IDE | Browser-based compiler is a significant subsystem |

---

## Success Metrics (Phase 1 validation)

| KPI | Target |
|-----|--------|
| Activation Rate | ≥ 30% of registered users solve 5+ questions on day 1 |
| Weekly Active Users | Positive week-over-week growth |
| Admin Import Success Rate | 100% success on valid `.xlsx` uploads |
| Admin Security | Zero unauthorized access to admin endpoints |

# FullStack Mastery — Portfolio Brief

> **Role target:** Full Stack Engineer · .NET Backend · Angular Frontend\
> **Stack:** ASP.NET Core 8 · Entity Framework Core · SQL Server · Angular 17 · JWT Auth\
> **Architecture pattern:** Clean Architecture · Service-based DI · Result<T> · Standalone Components

---

## What I Built and Why

I built this platform to solve a problem I experienced directly: preparing for Full Stack .NET and Angular interviews requires pulling together dozens of scattered resources, Excel sheets, and Notion docs. Existing platforms over-index on DSA and don't address framework-specific depth.

The result is a centralized study platform with a curated question bank, per-user progress tracking, a quiz engine, and an admin content pipeline — all built to production-minded standards rather than tutorial quality.

---

## Engineering Highlights

### 1. Clean Architecture with Enforced Dependency Direction

The backend follows a strict 4-layer structure: `Domain → Application → Infrastructure → Api`. Dependency direction is one-way and enforced by project references. There is no MediatR or CQRS overhead — just standard interface-based DI with thin controllers.

**Why this matters in interviews:** I can explain every layer boundary, why each dependency exists, and what would break if the direction were reversed. This is a practiced architectural judgment, not a tutorial copy.

### 2. Result<T> Pattern Throughout

Every service method returns a `Result<T>` — a discriminated union of success and failure that eliminates thrown business exceptions. Controllers inspect the result and map it to the appropriate HTTP status code.

```csharp
// Example: service returns Result, controller maps it
var result = await _quizService.SubmitAttemptAsync(id, userId);
return result.IsSuccess ? Ok(result.Value) : BadRequest(result.Error);
```

**Why this matters:** It enforces predictable error handling at every layer and makes the service contract explicit. I can discuss the tradeoffs vs. exception-based flow and when each is appropriate.

### 3. Enterprise-Grade Import Pipeline

The admin import system accepts `.xlsx`, `.csv`, and `.json` files through a unified `ImportAsync` pipeline. It is not a simple file upload — it runs:

- Per-row structural extraction with `ExcelRowDiagnostic` diagnostics
- Deduplication using SHA-256 fingerprinting (intra-file and DB-level)
- Business validation with structured `FileValidationResult` responses
- Asynchronous job processing via a background worker

**Why this matters:** Bulk data ingestion under validation constraints is a real enterprise concern. I can walk through every stage of the pipeline, explain the idempotency strategy, and discuss how it would scale.

### 4. Quiz Engine with Non-Destructive Read-Only Reference

The Quiz module draws from the existing question bank **without modifying it**. The architectural constraint — `QuizAttempt` and `QuizQuestion` reference `Question` read-only via a bridge entity — protects domain consistency while enabling the entire new feature.

This required deliberate modeling work:

- `QuizQuestion` holds `OriginalQuestionId` but snapshots questions at attempt start
- Assessment mode masks `AnswerText` in the DTO until submission
- Scoring is calculated on final submit, not on individual answer save

**Why this matters:** Domain isolation under extension pressure is a senior-level design concern. Most implementations just add columns to existing tables.

### 5. Hierarchical Category Taxonomy

Categories are self-referencing with `ParentId`, `Slug`, and `SortOrder`. The system supports paths like:

```
Backend → Security → Authentication → JWT
Frontend → Angular → State Management → Signals
```

Question filtering is subtree-aware — selecting `Backend` returns questions from all descendants. The seeder uses a name-keyed dictionary that now guards against duplicate slugs across branches.

**Why this matters:** Recursive relational modeling is a common interview topic. I can discuss the EF configuration (`DeleteBehavior.Restrict`, composite key on `UserProgress`), the in-memory tree build, and the subtree expansion algorithm.

### 6. Optimistic UI with Rollback

The frontend marks questions as solved/revised with an optimistic UI update — the toggle flips immediately in the UI before the API call resolves. If the call fails, the UI reverts to the prior state.

This is paired with an `[Authorize]`-protected toggle endpoint and a `UserProgress` row lifecycle that deletes the row when both flags become `false` (avoiding orphaned join-table rows).

---

## Honest Capability Claims

I believe in representing what the system actually does, not what it was planned to do.

| Claim | Evidence |
|---|---|
| Clean Architecture with enforced boundaries | 4-project solution with one-way references; no cross-layer leakage |
| Production-grade import pipeline with validation | Unified parser, SHA-256 dedup, background worker, structured diagnostics |
| Working quiz engine (two modes) | `QuizzesController` live; Practice + Assessment flows end-to-end in browser |
| CheatSheet backend API complete | Entity, service, migration, and both REST endpoints shipped and tested |
| Role-based access control (new paths) | New admin controllers use `[Authorize(Roles = "Admin")]`; legacy path is tracked as a gap |
| 23 passing backend import tests | xUnit suite in `tests/InterviewPrepApp.Tests/` |

---

## What Is Still In Progress (and Why I'm Telling You)

Honesty about incomplete work is itself a signal of engineering maturity.

| What | Status | What's left |
|---|---|---|
| Legacy admin endpoint role guard | 🔄 | Apply `[Authorize(Roles = "Admin")]` to legacy `AdminController` |
| Frontend admin route role guard | ⏳ | Wire existing `adminGuard` file to `/admin` route |
| JWT secret → environment variable | ⏳ | Move from committed `appsettings.json` to user secrets / env var |
| Dashboard pagination UI | ⏳ | Backend paginates; UI controls not yet surfaced |
| CheatSheet frontend (7 components) | ⏳ | Backend live; Angular pages, routing, sidebar nav pending |
| Quiz timer enforcement | ⏳ | `ExpiresAtUtc` field exists; backend validation not active |
| 3 failing background worker tests | 🔄 | Import pipeline test suite has 23 passing; 3 async worker tests failing |
| Frontend test suite | ⏳ | No `.spec.ts` files; manual verification only |

The delivery gate is: nothing new starts until the current feature passes code, tests, UI verification, documentation, and tracker close.

---

## Architectural Decisions I Can Defend

**"Why service-based DI instead of MediatR/CQRS?"**\
For a team of one working on a domain of this size, MediatR adds indirection without adding value. CQRS makes sense when read and write models diverge significantly or when event sourcing is required. Here, keeping controllers thin and services purposefully named is more readable and maintainable at this scale. I would reconsider CQRS at team scale if command/query shapes genuinely diverged.

**"Why custom CSS instead of Tailwind?"**\
The original spec called for Tailwind. During implementation I found that the design I wanted — glassmorphism panels, warm parchment gradients, custom animation keyframes — was cleaner to express in custom CSS with design tokens than in utility classes. The decision is documented in the TRD as an intentional deviation, not an oversight.

**"Why JWT in localStorage instead of httpOnly cookies?"**\
This is a tradeoff I'm aware of: localStorage is vulnerable to XSS, while cookies with `httpOnly` + `SameSite=Strict` eliminate that vector but introduce CSRF surface. For a portfolio platform with no real user data and no server-side cookie infrastructure, localStorage is acceptable. In production, I'd move to httpOnly cookies and add a CSRF token for state-mutating endpoints.

**"How does this scale to 100,000 questions?"**\
The current `Contains`-based search is a known bottleneck at scale. The indexed path forward is: add compound DB indexes (`CategoryId + IsDeleted + Status`, `Difficulty`), move to a full-text search strategy (either SQL Server FTS or an Elasticsearch sidecar), and cache the category tree in Redis. I've documented all of this in `docs/Improvements.md` §4.7, not as aspirational notes but as a scoped technical plan.

---

## What You Can Ask Me About

- EF Core configuration: composite keys, global query filters, restricted cascade delete, migration strategy
- Clean Architecture dependency direction and layer responsibility split
- The `Result<T>` pattern and error propagation vs. exception-based approaches
- Import pipeline architecture: parsing, validation, SHA-256 dedup, background worker design
- Quiz domain isolation: non-destructive extension of an existing entity graph
- JWT auth flow: token issuance, claim structure, interceptor mechanics, storage tradeoffs
- Hierarchical data modeling: self-referencing tree, subtree filtering, seeder design
- Angular standalone components: why no NgModules, DI context, lazy loading approach
- Optimistic UI pattern: local state management, rollback on failure, truth reconciliation

---

*For full implementation detail, see the [README.md](../README.md) and [docs/TRD.md](TRD.md). For the full gap analysis and improvement roadmap, see [docs/Improvements.md](Improvements.md).*

# TDD Strategy Document — Import Pipeline Test Architecture

> **Version:** 1.0 | **Established:** April 2026
> **Owner:** QA Architect / SDET
> **Scope:** Question Import · Quiz Attempt Lifecycle · CheatSheet (StudyGuide) Import
> **Playbook Reference:** `docs/ENGINEERING_PLAYBOOK.md` §2 Feature Lifecycle — Step 4 (Test)

---

## 1. TDD Philosophy for This Project

This platform uses a **pragmatic TDD discipline** that balances strict test-first principles with the reality of an existing codebase that has partial test coverage. The approach is:

1. **Red first for new code.** Any new service method, controller action, or Angular component that does not yet exist must have its test written and confirmed failing before the implementation is written.
2. **Green first for existing code.** Existing passing tests define the behavioural contract. Extensions to existing classes must not break the current green baseline.
3. **Fixture-driven.** All test inputs derive from `tests/fixtures/import-fixtures.json`. Tests must not construct ad-hoc magic strings inline — reference the fixture file.
4. **Four-step validation path.** Every import module must be verified at all four layers: Frontend Payload → Backend Unit → Backend API → Frontend UI State (see §3).

---

## 2. Current Test Baseline (April 2026)

| Test Suite | Location | Status | Count |
|---|---|---|---|
| `ExcelExtractionServiceTests` | `tests/InterviewPrepApp.Tests/Services/` | ✅ Passing | 5 tests |
| `QuestionImportValidatorTests` | `tests/InterviewPrepApp.Tests/Services/` | ✅ Passing | 6 tests |
| `AdminQuestionServiceTests` | `tests/InterviewPrepApp.Tests/Services/` | ✅ Passing | ~5 tests |
| `ImportBackgroundWorkerTests` | *Location TBD — see GAP-06* | 🔄 23 passing / **3 failing** | 26 tests |
| Frontend `.spec.ts` | `frontend/src/` | ⏳ None exist | 0 tests |

**Hard gate:** The 3 failing `ImportBackgroundWorkerTests` must be fixed before the StudyGuide import parity milestone can close. No new test milestone is considered complete while the failure count rises.

---

## 3. The Four-Step Validation Path

Each import module — Question, Quiz, CheatSheet — must be tested in this exact sequence. Steps are not optional and may not be reordered.

```
┌─────────────────────────────────────────────────────────────────────┐
│ STEP 1: FRONTEND PAYLOAD VALIDATION                                  │
│ Where:  Angular .spec.ts (when scaffold exists); manual checklist   │
│         until Angular test scaffold is created.                      │
│ What:   Verify the Angular service correctly validates and           │
│         constructs the outbound payload BEFORE any HTTP call.        │
│ Gate:   No invalid payloads reach the API; form errors surface in UI │
└────────────────────────────┬────────────────────────────────────────┘
                             │ payload is valid
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│ STEP 2: BACKEND UNIT TEST                                            │
│ Where:  tests/InterviewPrepApp.Tests/Import/                         │
│ What:   Test the service layer in isolation using EF InMemory DB.    │
│         Cover: happy paths, all failure modes, dedup, edge cases.    │
│ Gate:   Result<T> shape is correct; DB state is correct              │
└────────────────────────────┬────────────────────────────────────────┘
                             │ service returns Result
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│ STEP 3: BACKEND API VERIFICATION                                     │
│ Where:  tests/InterviewPrepApp.Tests/Import/ (controller tests)      │
│ What:   Verify controller maps Result<T> to correct HTTP status      │
│         codes and response shapes. Using Moq + test client.          │
│ Gate:   Correct HTTP codes; ProblemDetails on error; auth enforced   │
└────────────────────────────┬────────────────────────────────────────┘
                             │ API returns correct response
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│ STEP 4: FRONTEND UI STATE UPDATE                                     │
│ Where:  Angular .spec.ts (when scaffold exists); manual checklist   │
│         with documented outcomes in TRACKER until scaffold exists    │
│ What:   Verify Angular component transitions correctly:              │
│         idle → loading → success/error; DOM reflects state           │
│ Gate:   Loading state visible; success shown; error surfaced in DOM  │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 4. Test File Directory Standard

```
tests/
├── fixtures/
│   └── import-fixtures.json          ← single source of truth for test data
├── integration/
│   └── import-flow.spec.ts           ← E2E blueprint (this file maps all test cases)
└── InterviewPrepApp.Tests/
    ├── InterviewPrepApp.Tests.csproj
    ├── Services/                      ← existing unit tests (do not reorganise them)
    │   ├── ExcelExtractionServiceTests.cs
    │   ├── QuestionImportValidatorTests.cs
    │   └── AdminQuestionServiceTests.cs
    └── Import/                        ← NEW: created as part of this TDD initiative
        ├── QuestionImportServiceTests.cs      ← Step 2 tests for Question flow
        ├── QuestionImportControllerTests.cs   ← Step 3 tests for Question flow
        ├── QuizAttemptServiceTests.cs         ← Step 2 tests for Quiz flow
        ├── QuizControllerTests.cs             ← Step 3 tests for Quiz flow
        ├── CheatSheetServiceTests.cs          ← Step 2 tests for CheatSheet flow
        ├── CheatSheetControllerTests.cs       ← Step 3 tests for CheatSheet flow
        └── ImportSecurityBoundaryTests.cs     ← Cross-cutting auth enforcement tests
```

**Rule:** Do not move or rename files in `Services/`. Those are the existing passing baseline. New test classes go in `Import/`.

---

## 5. Test Classification Tags

Every test method must be classified with a prefix comment so the state of the application code is immediately obvious:

| Tag | Meaning |
|---|---|
| `[EXISTS-EXTEND]` | Application code exists. Test extends or deepens existing coverage. Must pass immediately after being written. |
| `[TODO-IMPLEMENT]` | Application code does not exist yet. Test must fail red first. Must NOT be changed to make it pass — only the application code changes. |
| `[GAP-VERIFY]` | Test explicitly documents and verifies a known gap from DESIGN_UPDATE_PLAN v2.0. Expected to fail until the gap is resolved. |

---

## 6. Fixture Usage Protocol

**Rule:** Tests must reference fixture cases by name (`_case` field), not inline hardcoded values.

```csharp
// ✅ CORRECT — references named fixture case
// Fixture: question_import.valid_rows[0] (VALID_FULL)
var dto = new ImportQuestionRowDto
{
    QuestionText = "Explain the difference between IEnumerable and IQueryable...",
    Role = "Backend",
    Difficulty = "Hard",
    CategorySlug = "entity-framework"
};

// ❌ WRONG — magic string with no fixture traceability
var dto = new ImportQuestionRowDto { QuestionText = "some question" };
```

**Fixture file location:** `tests/fixtures/import-fixtures.json`\
**Reference in test:** Include a comment citing the `_case` name from the fixture file.

---

## 7. Module-by-Module Test Coverage Map

### 7.1 Question Import Module

| Test Case | Fixture Reference | Step | Tag | File Target |
|---|---|---|---|---|
| Valid full row parsed correctly | `valid_rows[0]` VALID_FULL | 2 | EXISTS-EXTEND | `QuestionImportServiceTests.cs` |
| Defaults applied (difficulty, category) | `valid_rows[1]` VALID_DEFAULTS | 2 | EXISTS-EXTEND | `QuestionImportServiceTests.cs` |
| Missing QuestionText → error | `invalid_rows[0]` | 2 | EXISTS-EXTEND | `QuestionImportServiceTests.cs` |
| Invalid difficulty string → error | `invalid_rows[1]` | 2 | TODO-IMPLEMENT | `QuestionImportServiceTests.cs` |
| Category not found, no default → error | `invalid_rows[2]` | 2 | EXISTS-EXTEND | `QuestionImportServiceTests.cs` |
| Intra-file duplicate → skip 2nd | `deduplication_cases[0]` | 2 | EXISTS-EXTEND | `QuestionImportServiceTests.cs` |
| DB duplicate fingerprint → skip | `deduplication_cases[1]` | 2 | EXISTS-EXTEND | `QuestionImportServiceTests.cs` |
| Valid xlsx → 200 with summary | — | 3 | TODO-IMPLEMENT | `QuestionImportControllerTests.cs` |
| Empty file → 400 ProblemDetails | — | 3 | TODO-IMPLEMENT | `QuestionImportControllerTests.cs` |
| Unauthenticated → 401 | — | 3 | TODO-IMPLEMENT | `QuestionImportControllerTests.cs` |
| Non-admin → 403 | — | 3 | GAP-VERIFY (GAP-01) | `ImportSecurityBoundaryTests.cs` |
| File size limit enforced client-side | — | 1 | TODO-IMPLEMENT | Angular spec |
| Unsupported file type rejected client-side | — | 1 | TODO-IMPLEMENT | Angular spec |
| Loading state during upload | — | 4 | TODO-IMPLEMENT | Angular spec |
| Success summary rendered in DOM | — | 4 | TODO-IMPLEMENT | Angular spec |
| ProblemDetails error rendered in DOM | — | 4 | TODO-IMPLEMENT | Angular spec |

### 7.2 Quiz Attempt Module

| Test Case | Fixture Reference | Step | Tag | File Target |
|---|---|---|---|---|
| Practice mode: answers visible | `create_attempt_requests[0]` | 2 | EXISTS-EXTEND | `QuizAttemptServiceTests.cs` |
| Assessment mode: answers masked | `create_attempt_requests[1]` | 2 | EXISTS-EXTEND | `QuizAttemptServiceTests.cs` |
| Insufficient questions → failure | `invalid_create_requests[2]` | 2 | TODO-IMPLEMENT | `QuizAttemptServiceTests.cs` |
| Save response persists correctly | `save_response_requests[0]` | 2 | EXISTS-EXTEND | `QuizAttemptServiceTests.cs` |
| Submit → score calculated | `submit_attempt_requests[0]` | 2 | EXISTS-EXTEND | `QuizAttemptServiceTests.cs` |
| Double-submit → failure | — | 2 | TODO-IMPLEMENT | `QuizAttemptServiceTests.cs` |
| Create practice → 201 with attemptId | `create_attempt_requests[0]` | 3 | TODO-IMPLEMENT | `QuizControllerTests.cs` |
| Invalid mode → 400 | `invalid_create_requests[0]` | 3 | TODO-IMPLEMENT | `QuizControllerTests.cs` |
| Assessment GET → answers null | — | 3 | TODO-IMPLEMENT | `QuizControllerTests.cs` |
| Submit → 200 with score | `submit_attempt_requests[0]` | 3 | TODO-IMPLEMENT | `QuizControllerTests.cs` |
| Unauthenticated create → 401 | — | 3 | TODO-IMPLEMENT | `ImportSecurityBoundaryTests.cs` |
| Count validation (0 / 51) | — | 1 | TODO-IMPLEMENT | Angular spec |
| Navigate to /quiz/:id on success | — | 4 | EXISTS-EXTEND | Angular spec |
| Error shown for insufficient bank | `invalid_create_requests[2]` | 4 | TODO-IMPLEMENT | Angular spec |
| No answer text in Assessment mode | — | 4 | EXISTS-EXTEND | Angular spec |
| Timer countdown in Assessment mode | — | 4 | TODO-IMPLEMENT | Angular spec |
| Score displayed after submit | — | 4 | EXISTS-EXTEND | Angular spec |

### 7.3 CheatSheet Module

| Test Case | Fixture Reference | Step | Tag | File Target |
|---|---|---|---|---|
| Create PDF resource → persisted | `valid_create_requests[0]` | 2 | TODO-IMPLEMENT | `CheatSheetServiceTests.cs` |
| Create Markdown → content in DB | `valid_create_requests[1]` | 2 | TODO-IMPLEMENT | `CheatSheetServiceTests.cs` |
| PDF missing URL → failure | `invalid_create_requests[0]` | 2 | TODO-IMPLEMENT | `CheatSheetServiceTests.cs` |
| Markdown missing content → failure | `invalid_create_requests[1]` | 2 | TODO-IMPLEMENT | `CheatSheetServiceTests.cs` |
| Category not found → failure | `invalid_create_requests[3]` | 2 | TODO-IMPLEMENT | `CheatSheetServiceTests.cs` |
| Get by category excludes deleted | — | 2 | TODO-IMPLEMENT | `CheatSheetServiceTests.cs` |
| Get by category ordered correctly | `valid_read_requests[0]` | 2 | TODO-IMPLEMENT | `CheatSheetServiceTests.cs` |
| Delete existing → soft-deleted | `delete_requests[0]` | 2 | TODO-IMPLEMENT | `CheatSheetServiceTests.cs` |
| Delete nonexistent → failure | `delete_requests[1]` | 2 | TODO-IMPLEMENT | `CheatSheetServiceTests.cs` |
| Create valid → 201 | `valid_create_requests[0]` | 3 | TODO-IMPLEMENT | `CheatSheetControllerTests.cs` |
| Invalid payload → 400 | `invalid_create_requests[0]` | 3 | TODO-IMPLEMENT | `CheatSheetControllerTests.cs` |
| Unauthenticated → 401 | — | 3 | TODO-IMPLEMENT | `CheatSheetControllerTests.cs` |
| Non-admin admin endpoint → 403 | — | 3 | TODO-IMPLEMENT | `ImportSecurityBoundaryTests.cs` |
| Get empty category → 200 [] | `valid_read_requests[1]` | 3 | TODO-IMPLEMENT | `CheatSheetControllerTests.cs` |
| Delete existing → 204 | `delete_requests[0]` | 3 | TODO-IMPLEMENT | `CheatSheetControllerTests.cs` |
| Delete nonexistent → 404 | `delete_requests[1]` | 3 | TODO-IMPLEMENT | `CheatSheetControllerTests.cs` |
| Type-conditional form fields | — | 1 | TODO-IMPLEMENT | Angular spec |
| Title required client-side | `invalid_create_requests[4]` | 1 | TODO-IMPLEMENT | Angular spec |
| Resources rendered per category | `valid_read_requests[0]` | 4 | TODO-IMPLEMENT | Angular spec |
| Empty state when no resources | `valid_read_requests[1]` | 4 | TODO-IMPLEMENT | Angular spec |
| Correct action button per type | — | 4 | TODO-IMPLEMENT | Angular spec |
| URL opens in new tab safely | — | 4 | TODO-IMPLEMENT | Angular spec |
| Success toast after creation | — | 4 | TODO-IMPLEMENT | Angular spec |
| Confirm dialog before delete | — | 4 | TODO-IMPLEMENT | Angular spec |

---

## 8. Running the Test Suite

### Backend (existing + new)

```powershell
# Run all backend tests from repo root
dotnet test tests/InterviewPrepApp.Tests/InterviewPrepApp.Tests.csproj

# Run only the new Import/ directory tests
dotnet test tests/InterviewPrepApp.Tests/InterviewPrepApp.Tests.csproj --filter "FullyQualifiedName~Import"

# Run with coverage (coverlet is already referenced in .csproj)
dotnet test tests/InterviewPrepApp.Tests/InterviewPrepApp.Tests.csproj --collect:"XPlat Code Coverage"
```

### Frontend (when Angular scaffold exists)

```powershell
cd frontend
ng test --watch=false --browsers=ChromeHeadless
```

### Expected baseline after this TDD initiative (before APPROVE AND IMPLEMENT)

```
BEFORE: 23 passing / 3 failing (existing suite)
TARGET: 23 passing / 3 failing (frozen — no new failures introduced by scaffold)
AFTER IMPLEMENT: ≥ 55 passing / 0 failing (all [TODO-IMPLEMENT] cases green)
```

---

## 9. Known Risks and Mitigation

| Risk | Impact | Mitigation |
|---|---|---|
| 3 failing `ImportBackgroundWorkerTests` pre-existing | Cannot mark StudyGuide parity done | Fix these before starting StudyGuide parity sprint |
| No Angular test scaffold exists | Steps 1 & 4 are manual only | Document manual walkthrough in TRACKER for each feature; create spec scaffold in first CheatSheet frontend sprint |
| `ImportBackgroundWorkerTests` file path unknown | GAP-06 in DESIGN_UPDATE_PLAN | Locate and canonicalize path before expanding worker test suite |
| Security tests now document a FAIL state (GAP-01) | `LegacyImport_NonAdminUser_Returns403` will fail red | That is correct — it is a `[GAP-VERIFY]` test. Fix the code (GAP-01), then it turns green |

---

## 10. Document Sync Status

This TDD document was generated alongside:

| Document | Change Made |
|---|---|
| `tests/fixtures/import-fixtures.json` | Created: production-schema-accurate fixtures for all 3 modules |
| `tests/integration/import-flow.spec.ts` | Created: E2E blueprint mapping all test cases to 4-step validation path |
| `docs/TRACKER.md` | Updated: new §15 TDD Initiative tracking section added |
| `docs/TDD_STRATEGY.md` | Created: this document |

*This document must be updated whenever new test cases are added, failing tests are resolved, or the fixture schema changes.*

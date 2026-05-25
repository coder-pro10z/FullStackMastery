# Import Module — Comprehensive Validation Plan
> **Scope:** `ExcelExtractionService` · `QuestionImportValidator` · `ImportBackgroundWorker`  
> **Stack:** .NET 8 · ClosedXML · EF Core · xUnit · Channel-based async workers  
> **Architecture:** Controller → Service → Parser → Validator → DB (Clean Architecture)

---

## Table of Contents

1. [Validation Checklist — Import Module](#1-validation-checklist--import-module)
2. [Test Strategy](#2-test-strategy)
3. [Reusable Workflow Pattern](#3-reusable-validation-workflow-pattern)
4. [Module-Specific Adaptations](#4-module-specific-adaptations)
5. [Execution Order](#5-execution-order)

---

## 1. Validation Checklist — Import Module

### 🔹 Phase 1 — Parser Validation (`ExcelExtractionService`)

The system has **two extraction paths**: the legacy `ExtractQuestionsAsync` and the unified `ExtractImportRows`. Both must be validated.

#### 1.1 — `ExtractImportRows` (unified pipeline)

| # | Check | Pass Condition | Failure Behaviour |
|---|-------|---------------|-------------------|
| P1 | Valid `.xlsx` with all columns | Returns `ExcelExtractionResult.Ok(...)` with populated rows | — |
| P2 | Empty file (no rows at all) | Returns `ExcelExtractionResult.Fatal("Excel file is empty.")` | Fatal; no rows processed |
| P3 | Header row present, zero data rows | Returns `Fatal("Excel file has a header but no data rows.")` | Fatal |
| P4 | Missing `QuestionText`/`Question`/`Question Title` column | Returns `Fatal("Missing required column: QuestionText...")` | Fatal |
| P5 | Missing `Role` column | Returns `Fatal("Missing required column: Role.")` | Fatal |
| P6 | `Difficulty` column absent | Warning added per row; defaults to `"Medium"` | Non-fatal, row continues |
| P7 | `AnswerText` absent, legacy two-row format present | `answerText` picked from next row; warning added with row ref | Non-fatal |
| P8 | `AnswerText` column present with value | Value used directly; no legacy detection triggered | — |
| P9 | `Category`/`CategorySlug` column absent | `CategorySlug = string.Empty`; downstream validator handles | — |
| P10 | Empty `Role` cell | Warning: "Role is empty — defaulted to 'General'" | Role set to "General" |
| P11 | Completely blank row (both Question and Role empty) | Row silently skipped | — |
| P12 | Column order is arbitrary | Headers detected case-insensitively by `FindHeaderIndex` | — |
| P13 | Corrupted/non-xlsx stream | `XLWorkbook` throws; caller must handle the exception | Propagates to service |

#### 1.2 — `ExtractQuestionsAsync` (legacy path, still active)

| # | Check | Pass Condition |
|---|-------|---------------|
| L1 | Required columns: `Question`, `Role`, `Difficulty` | Returns `Result.Failure(...)` if any missing |
| L2 | Category column present but empty cell | Error added; row skipped |
| L3 | Category column absent; Role matches a DB category | Uses that category ID |
| L4 | Category column absent; Role does NOT match; defaultCategoryId is valid | Uses default |
| L5 | Category column absent; Role no match; defaultCategoryId invalid | Error → row skipped |
| L6 | Merged cells used for Role/Difficulty as "answer row" | `IsCellEmptyForAnswer` detects merge; answer consumed |

---

### 🔹 Phase 2 — Validation Engine (`QuestionImportValidator`)

| # | Rule | Expected Behaviour |
|---|------|--------------------|
| V1 | `QuestionText` is null/whitespace | `Errors.Add("Row N: QuestionText is required — skipped.")` · `Failed++` · `continue` |
| V2 | `Role` is null/whitespace | Normalised to `"General"` (warning-free) |
| V3 | Duplicate within file (same `QuestionText` + `Role` fingerprint) | `Warnings.Add("Row N: Duplicate — same question appears earlier in this file. Skipped.")` · `Skipped++` |
| V4 | Duplicate in DB (fingerprint in `existingFingerprints`) | `Warnings.Add("Row N: Duplicate — question already exists in database. Skipped.")` · `Skipped++` |
| V5 | Unknown `Difficulty` string | `Warnings.Add("Row N: Unknown difficulty ... defaulted to Medium.")` · difficulty = `Medium` |
| V6 | Known `CategorySlug` (matches `c.Slug.ToLower()`) | `categoryId` resolved correctly |
| V7 | Unknown slug + `defaultCategoryId` provided | Warning added; default used |
| V8 | Unknown slug + NO `defaultCategoryId` | `Errors.Add("...no default set — skipped.")` · `Failed++` · `continue` |
| V9 | Valid record | Added to `result.ValidRecords`; fingerprint added to `existingFingerprints` for subsequent deduplication |
| V10 | Fingerprint algorithm | `SHA-256(UPPER(QuestionText)\|UPPER(Role))`, hex-encoded, first 16 chars — deterministic |

**Fingerprint collision test:** Two rows with identical QuestionText+Role (regardless of Title/Answer/Difficulty) must produce the same fingerprint and be deduplicated.

---

### 🔹 Phase 3 — Import Service (`ImportBackgroundWorker`)

| # | Check | Pass Condition |
|---|-------|---------------|
| S1 | Job type `Quiz` routes to `ProcessQuizJobAsync` | `QuizExcelExtractionService.Extract(fs)` called |
| S2 | Job type `StudyGuide` routes to `ProcessStudyGuideJobAsync` | `StudyGuideExtractionService.Extract(fs)` called |
| S3 | Unknown job type | `allErrors` gets unsupported-type message; `job.Status = Failed` |
| S4 | Temp file missing at processing time | `job.Status = Failed`; saved to DB; no extraction attempted |
| S5 | Extraction warnings propagated | `extractErrors` are `AddRange`d into `allErrors` |
| S6 | Batch size = 500 | Every `rows.Chunk(500)` iteration wrapped in its own transaction |
| S7 | Each batch commits independently | `SaveChangesAsync` + `CommitAsync` per chunk; partial success is possible |
| S8 | ExternalId already in DB (upsert) | Record fields updated; `UpdatedAtUtc` refreshed |
| S9 | ExternalId new | New entity inserted; `existingIds` set updated |
| S10 | DB exception per row | Row counted in `batchFailed`; error added; loop continues |
| S11 | `job.Status` after completion | `Completed` if `FailedRows == 0`; `PartiallyCompleted` otherwise |
| S12 | `ErrorSummaryJson` written | JSON-serialised list of `RowImportErrorDto`; `null` if no errors |
| S13 | `RetryPayloadJson` written | JSON array of distinct non-null `ExternalId`s from errors |
| S14 | Temp file deleted in `finally` | File removed regardless of success/failure |
| S15 | Structured logging | `import.job.started`, `import.job.batch.complete`, `import.job.completed` log entries emitted |

---

### 🔹 Phase 4 — Database Validation

| # | Check | Query / Assertion |
|---|-------|-------------------|
| D1 | No duplicate `ExternalId` in `QuizQuestions` | `SELECT COUNT(*) FROM QuizQuestions GROUP BY ExternalId HAVING COUNT(*) > 1` → 0 rows |
| D2 | No duplicate `ExternalId` in `StudyGuideSections` | Same pattern |
| D3 | `CategoryId` FK references valid category | All `CategoryId` values exist in `Categories` table |
| D4 | `FailedRows + ProcessedRows == TotalRows` (post-job) | Per `ImportJob` row in DB |
| D5 | `StartedAtUtc` < `CompletedAtUtc` | Temporal consistency |
| D6 | `Status` is `Completed` or `PartiallyCompleted` (not `Queued`/`InProgress`) | Job not stuck |
| D7 | Soft-delete safe: existing records updated, not duplicated | `COUNT` before and after idempotent re-import stays the same |

---

### 🔹 Phase 5 — API Response Validation

**Endpoint:** `POST /api/admin/import` (`AdminImportController`)

| # | Check | Expected |
|---|-------|----------|
| A1 | Response structure matches `BulkImportResultDto` | `{ totalRows, successCount, failedCount, errors[] }` |
| A2 | `successCount + failedCount == totalRows` | Arithmetic consistency |
| A3 | `errors[].rowNumber` matches Excel row numbers reported by extractor | Row-number traceability |
| A4 | `errors[].message` is human-readable (no stack traces) | Uses structured `RowImportErrorDto.Message` |
| A5 | HTTP 200 on partial success | Service does not throw; controller returns OK |
| A6 | HTTP 400 on fatal parse error (missing columns, empty file) | `ExcelExtractionResult.Fatal(...)` translated to 400 |
| A7 | HTTP 401/403 when unauthenticated/unauthorised | `[Authorize(Roles = "Admin")]` enforced |
| A8 | `dryRun = true` → no DB writes | `job.Status` is never `Completed`/`PartiallyCompleted`; validation result returned only |
| A9 | Legacy endpoint `POST /api/admin/import-questions` still responds | Unprotected; must be tracked as security gap (see ADMIN.MD §9.1) |

---

### 🔹 Phase 6 — Frontend Contract Validation

| # | Check | Source |
|---|-------|--------|
| F1 | Upload accepts only `.xlsx` | File input `accept=".xlsx"` or equivalent guard |
| F2 | Drag-and-drop respects extension restriction | Same guard in drop handler |
| F3 | Success toast shows `successCount` correctly | Bound to `BulkImportResultDto.successCount` |
| F4 | Error list displays each `errors[].rowNumber` + `message` | Rendered per item in `errors[]` |
| F5 | Dry-run toggle visible and functional | `dryRun` param sent in request |
| F6 | Upload guidelines match backend contract | Mirrors `ImportQuestionPlan.md` front-matter message |
| F7 | Error for unsupported file type shown before network call | Client-side extension check |
| F8 | Empty-result state (0 rows) handled gracefully | No crash on `totalRows = 0` |

---

## 2. Test Strategy

### 2.1 Project Setup

```
src/
  InterviewPrepApp.Tests/
    Import/
      ParserTests/
        ExcelExtractionServiceTests.cs
        QuizExcelExtractionServiceTests.cs
        StudyGuideExtractionServiceTests.cs
      ValidatorTests/
        QuestionImportValidatorTests.cs
      IntegrationTests/
        ImportBackgroundWorkerTests.cs
    TestFiles/
      valid_questions.xlsx
      missing_question_col.xlsx
      missing_role_col.xlsx
      empty_file.xlsx
      header_only.xlsx
      duplicate_ids_within_file.xlsx
      missing_difficulty.xlsx
      answer_in_next_row.xlsx
      large_1000_rows.xlsx
```

---

### 2.2 Unit Tests — `ExcelExtractionService` (`ExtractImportRows`)

```csharp
// File: ParserTests/ExcelExtractionServiceTests.cs

[Fact] void ExtractImportRows_ValidFile_ReturnsOkWithRows()
[Fact] void ExtractImportRows_EmptyStream_ReturnsFatal()
[Fact] void ExtractImportRows_HeaderOnlyNoDataRows_ReturnsFatal()
[Fact] void ExtractImportRows_MissingQuestionColumn_ReturnsFatal()
[Fact] void ExtractImportRows_MissingRoleColumn_ReturnsFatal()
[Fact] void ExtractImportRows_MissingDifficultyColumn_DefaultsToMediumWithWarning()
[Fact] void ExtractImportRows_EmptyRoleCell_DefaultsToGeneralWithWarning()
[Fact] void ExtractImportRows_BothQuestionAndRoleEmpty_RowSkipped()
[Fact] void ExtractImportRows_AnswerInNextRowLegacyFormat_Detected()
[Fact] void ExtractImportRows_AnswerColumnPresent_UsedDirectly()
[Fact] void ExtractImportRows_ColumnOrderIrrelevant_StillParsed()
[Fact] void ExtractImportRows_CategoryColumnAbsent_CategorySlugIsEmpty()
```

---

### 2.3 Unit Tests — `QuestionImportValidator`

```csharp
// File: ValidatorTests/QuestionImportValidatorTests.cs
// Use: in-memory ApplicationDbContext (UseInMemoryDatabase)

[Fact] async Task ValidateAsync_EmptyQuestionText_AddsErrorAndIncrementsFailed()
[Fact] async Task ValidateAsync_EmptyRole_NormalisedToGeneral()
[Fact] async Task ValidateAsync_DuplicateWithinFile_SkippedWithWarning()
[Fact] async Task ValidateAsync_DuplicateInDb_SkippedWithWarning()
[Fact] async Task ValidateAsync_UnknownDifficulty_DefaultsToMediumWithWarning()
[Fact] async Task ValidateAsync_KnownCategorySlug_ResolvesCorrectly()
[Fact] async Task ValidateAsync_UnknownSlugWithDefault_UsesDefault_AddsWarning()
[Fact] async Task ValidateAsync_UnknownSlugNoDefault_AddsErrorAndIncrementsFailed()
[Fact] async Task ValidateAsync_ValidRow_AddedToValidRecords()
[Fact] void ComputeFingerprint_SameInputDifferentCase_SameResult()
[Fact] void ComputeFingerprint_DifferentQuestionText_DifferentResult()
[Fact] void ComputeFingerprint_Returns16HexChars()
```

---

### 2.4 Integration Tests — `ImportBackgroundWorker`

```csharp
// File: IntegrationTests/ImportBackgroundWorkerTests.cs
// Use: WebApplicationFactory<Program> or direct service instantiation with in-memory DB + temp file

[Fact] async Task ProcessJobAsync_ValidQuizFile_SetsStatusCompleted()
[Fact] async Task ProcessJobAsync_PartiallyValidQuizFile_SetsStatusPartiallyCompleted()
[Fact] async Task ProcessJobAsync_MissingTempFile_SetsStatusFailed()
[Fact] async Task ProcessJobAsync_UnsupportedJobType_SetsStatusFailed()
[Fact] async Task ProcessJobAsync_ExistingExternalId_UpdatesRecord()
[Fact] async Task ProcessJobAsync_NewExternalId_InsertsRecord()
[Fact] async Task ProcessJobAsync_TempFileDeletedAfterProcessing()
[Fact] async Task ProcessJobAsync_500RowFile_ProcessedInSingleBatch()
[Fact] async Task ProcessJobAsync_501RowFile_ProcessedInTwoBatches()
[Fact] async Task ProcessJobAsync_ErrorSummaryJsonPopulatedOnFailures()
[Fact] async Task ProcessJobAsync_RetryPayloadJsonContainsFailedExternalIds()
```

---

### 2.5 Edge Case Tests

| Scenario | Expected |
|----------|----------|
| 0-byte file stream | `Fatal(...)` from extractor |
| File with 1000 rows, all valid | 2 batches (500+500); `Status = Completed` |
| File with 999 duplicates + 1 new | `Skipped = 999`; `ProcessedRows = 1`; `Status = PartiallyCompleted` |
| All rows invalid (no QuestionText) | `Failed = N`; `ValidRecords = empty`; `Status = PartiallyCompleted` |
| Difficulty values: "EASY", "hard", "Medium", "X", "" | Correct enum parse or Medium fallback for all |
| ExternalId with leading/trailing whitespace | Trim before fingerprint / upsert lookup |
| Category slug with mixed casing | `.ToLower()` normalisation handles it |
| Two rows identical except for Title/Answer | Same fingerprint → second skipped as duplicate file-level |
| DB transaction failure mid-batch | `batchFailed` incremented; error captured; next batch proceeds |

---

## 3. Reusable Validation Workflow Pattern

```
Input → Parse → Validate → Process → Persist → Verify → Report
```

### 3.1 Stage Definitions

| Stage | Responsibility | Fail Mode | Output |
|-------|---------------|-----------|--------|
| **1. Input Validation** | File extension, size, MIME type (client + server) | Reject entire request | HTTP 400 with user message |
| **2. Parsing** | Stream → typed DTOs; header detection; row extraction | Fatal → stop pipeline | `ExcelExtractionResult` (Fatal/Ok) |
| **3. Business Rule Validation** | Required fields, deduplication, enum parsing, FK resolution | Per-row error/warning | `ValidationResult` (valid + errors lists) |
| **4. Processing Logic** | Batch chunking, upsert logic, job status state machine | Per-row exception caught | Batch counters, error accumulator |
| **5. Persistence** | SaveChanges per batch within transaction | Transaction rollback per chunk | DB rows written |
| **6. Output/Response Validation** | DTO assembly: totalRows, success, failed, errors[] | Never throws | `BulkImportResultDto` or `ImportJobStatusDto` |
| **7. UI/UX Contract Validation** | Error message clarity, field-level hints, upload guidance | UX gap (not a crash) | Human-readable messages |

### 3.2 Generic Interfaces to Implement Per Module

```csharp
// Extraction contract
public interface IExcelExtractor<TRow>
{
    (List<TRow> Rows, List<RowImportErrorDto> Errors) Extract(Stream stream);
}

// Validation contract
public interface IImportValidator<TRow, TValidated>
{
    Task<ImportValidationResult<TValidated>> ValidateAsync(
        IReadOnlyList<TRow> rows,
        ImportContext context,
        CancellationToken ct);
}

// Processing context (carries cross-cutting concerns)
public record ImportContext(int? DefaultCategoryId, HashSet<string> ExistingFingerprints, bool DryRun);
```

### 3.3 Reusable Test Checklist Template

For any new module, validate each row of this matrix:

```
[ ] Fatal parse → pipeline stopped
[ ] Missing required column → fatal
[ ] Empty required field → per-row error
[ ] Optional field absent → warning + default applied
[ ] Intra-file duplicate → skipped with warning
[ ] DB-level duplicate → skipped with warning (or upserted if idempotent)
[ ] Valid record → in ValidRecords / inserted / updated
[ ] Batch boundary (N+1 row) → second batch created
[ ] DB exception per row → row failed, loop continues
[ ] Job status: 0 failures → Completed
[ ] Job status: some failures → PartiallyCompleted
[ ] Job status: fatal → Failed
[ ] Temp file deleted post-job
[ ] Error summary JSON populated
[ ] Response DTO arithmetic consistent
```

---

## 4. Module-Specific Adaptations

### 4.1 Module: Import_LongForm_Questions

**Extractor:** `ExcelExtractionService.ExtractImportRows`  
**Validator:** `QuestionImportValidator`  
**Worker path:** Currently uses the question import path (not `ImportBackgroundWorker` type routing — verify if a new `ImportJobType.Question` case is needed)

| # | Additional Validation |
|---|----------------------|
| LF1 | `AnswerMarkdown` is not null/empty for long-form (soft warning vs Quiz where answer is optional) |
| LF2 | Answer auto-detected via legacy two-row pattern — verify row-pair consumption does not leave orphaned rows |
| LF3 | `Title` field included when present; nullable in domain entity |
| LF4 | SHA-256 fingerprint covers `QuestionText + Role` only — validate that cosmetic `Title` changes do not bypass deduplication |
| LF5 | Category resolved by `Slug` (not path) — verify slug casing round-trip |
| LF6 | Partial batch: rows 1–499 saved before row 500 fails — assert DB has 499 records |

---

### 4.2 Module: Quiz_Question

**Extractor:** `QuizExcelExtractionService`  
**Worker path:** `ImportBackgroundWorker.ProcessQuizJobAsync`  
**Upsert strategy:** ExternalId-based (not fingerprint-based)

| # | Additional Validation |
|---|----------------------|
| Q1 | Required columns: `ExternalId`, `QuestionText`, `OptionA–D`, `CorrectAnswer` |
| Q2 | `CorrectAnswer` value must be one of `A`, `B`, `C`, `D` (case-insensitive) — invalid value is a per-row error |
| Q3 | All four options non-empty; missing option = row error |
| Q4 | `Explanation` is optional; null/empty is valid |
| Q5 | Tags field: comma-delimited string stored as-is; validate no XSS/injection |
| Q6 | Idempotent re-import (same `ExternalId`) → `UPDATE`, not duplicate insert |
| Q7 | `existingIds.Contains(row.ExternalId)` fast lookup — validate set populated before batch loop |
| Q8 | `QuizQuestionDifficulty` enum: easy/medium/hard (different from `Difficulty` enum in Questions) |
| Q9 | Category resolved via `BuildCategoryPathMap` (last path segment, reversed) — verify multi-level paths like `"backend/security"` resolve to `"security"` |
| Q10 | `UpdatedAtUtc` is set on upsert — assert timestamp changes |

---

### 4.3 Module: StudyGuide (Cheat Sheet)

**Extractor:** `StudyGuideExtractionService`  
**Worker path:** `ImportBackgroundWorker.ProcessStudyGuideJobAsync`

| # | Additional Validation |
|---|----------------------|
| SG1 | Required: `ExternalId`, `Title`, `Content`/`ContentMarkdown` |
| SG2 | `DisplayOrder` is numeric; non-numeric defaults to 0 or row error |
| SG3 | `ContentMarkdown` may be multi-line; serialisation round-trip preserves newlines |
| SG4 | Upsert on `ExternalId`; `Title` + `ContentMarkdown` both updated |
| SG5 | `Tags` comma-separated; stored as string; assertion that DB value matches raw input |
| SG6 | Category resolution uses same `BuildCategoryPathMap` (last segment) — same test as Q9 |
| SG7 | `existingIds` loaded from `StudyGuideSections`, not `QuizQuestions` — validate isolation |
| SG8 | Re-import with changed content updates record; row count in DB unchanged |

---

## 5. Execution Order

```text
Step 1 ─ Environment Setup
  ├─ dotnet restore
  ├─ dotnet build (zero warnings/errors)
  └─ Ensure test DB connection string or in-memory DB configured in Tests project

Step 2 ─ Unit Tests (no DB required)
  ├─ ExcelExtractionServiceTests   (parser — uses MemoryStream + ClosedXML)
  ├─ QuizExcelExtractionServiceTests
  ├─ StudyGuideExtractionServiceTests
  └─ QuestionImportValidatorTests  (in-memory EF Core DB)

  Command: dotnet test --filter "Category=Unit"

Step 3 ─ Integration Tests
  └─ ImportBackgroundWorkerTests   (in-memory DB + temp xlsx files)

  Command: dotnet test --filter "Category=Integration"

Step 4 ─ Database Validation (against a real/staging DB)
  ├─ Run SQL consistency queries (D1–D7)
  └─ Verify ImportJob rows post-import

Step 5 ─ API Validation (Swagger / Postman)
  ├─ POST /api/admin/import with valid.xlsx    → 200, successCount > 0
  ├─ POST /api/admin/import with empty.xlsx   → 400, fatal error message
  ├─ POST /api/admin/import unauthenticated   → 401
  ├─ POST /api/admin/import with dryRun=true  → 200, no DB rows added
  └─ GET  /api/admin/import/{jobId}/status    → job status DTO

Step 6 ─ Frontend Contract Check
  ├─ Upload valid file → success toast with count
  ├─ Upload file with errors → error list with row numbers
  ├─ Upload non-xlsx → client-side rejection before HTTP call
  └─ Toggle dry-run → result shows but no DB writes

Step 7 ─ Regression (after any future change)
  └─ Re-run Steps 2–3 in CI pipeline (dotnet test)
```

---

> [!IMPORTANT]
> **Known gaps to address before validation is complete:**
> - Legacy `POST /api/admin/import-questions` has no `[Authorize]` → must be protected or removed before Phase 5 API validation can be signed off
> - `ImportBackgroundWorker` has **no case for `ImportJobType.Question`** (long-form) — the `ExcelExtractionService` + `QuestionImportValidator` pipeline is not wired into the worker; this is a pending integration gap
> - Frontend `adminGuard` is not active on `/admin` → Phase 6, step A7 cannot fully pass until guard is enabled

---

> [!TIP]
> **To run all unit + integration tests right now:**
> ```powershell
> dotnet test .\src\InterviewPrepApp.Tests\InterviewPrepApp.Tests.csproj --verbosity normal
> ```
> The test project currently only contains the placeholder `UnitTest1.cs` — the test files described in §2 need to be created.

> **Navigation:** [← Back to README](../../README.md) · [Architecture](../Architecture/) · [Domain](../Domain/) · [Features](../Features/) · [API](../API/) · [ADR](../ADR/)
> **Related:** [ImportModule_ValidationPlan](../Features/ImportModule_ValidationPlan.md) · [ADMIN](../Features/ADMIN.md)

# ADR 004: Import Pipeline Design

## Context
FullStack Mastery requires bulk ingestion of hundreds of interview questions via Excel or CSV. Early iterations inserted parsed rows directly into the database within the API request lifecycle. This caused API timeouts on large files, failed entirely if one row had bad data, and made testing difficult because parsing, validation, and database saving were tightly coupled.

## Decision
We redesigned the import module into a decoupled, **6-stage pipeline** with an asynchronous background worker.

1. **Parser (ExcelExtractionService)**: Extracts raw data into a string-only generic DTO, deferring typing.
2. **Validator (QuestionImportValidator)**: Applies FluentValidation rules to the raw DTO, converting valid rows to strongly-typed records and discarding bad rows.
3. **Background Worker**: The API returns HTTP 202 Accepted immediately. The validated payload is handed off to a background queue.
4. **Database Validation**: The worker checks the DB for duplicates (e.g., matching titles) before inserting.
5. **API Response (Audit)**: The results (Imported count, Skipped count, Error array) are saved to an audit log.
6. **Frontend Contract**: The UI polls the audit log for the final result rather than waiting on the original HTTP POST.

## Consequences
**Positive:**
- **Resilience:** Partial success is supported. A 100-row file with 1 bad row will import 99 questions rather than rejecting the whole file.
- **Scalability:** The API never times out because the heavy DB work happens in the background.
- **Testability:** We can unit test the parser and validator completely independent of EF Core.

**Negative:**
- **Complexity:** Moving from synchronous to asynchronous processing required adding a background queue and updating the frontend to handle polling.
- **Data Freshness:** Users don't see their imported questions instantly; there is a slight delay while the background worker runs.

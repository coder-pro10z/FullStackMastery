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

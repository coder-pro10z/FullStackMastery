# Quiz Feature Review And Project-Aligned Proposal

This document replaces the earlier quiz draft with a version that matches the repository as it exists today.

## Current Project Reality

The current app is a study platform built around free-form question/answer content, not a multiple-choice quiz engine.

Existing backend facts:

- `Question` stores `QuestionText` and `AnswerText`
- there is no `AnswerOption` entity and no `IsCorrect` option model
- `Question` already supports `IsDeleted` and version history through `QuestionVersion`
- `UserProgress` only stores `IsSolved` and `IsRevision`

Existing frontend facts:

- the dashboard renders study cards through `QuestionTableComponent`
- answers are shown through an expand/collapse study interaction
- there is no quiz player, quiz state service, timer flow, or reflection screen yet

Because of that, the previous draft was not accurate for this codebase.

## What Must Change From The Previous Draft

### 1. Do not describe the current system as MCQ-based

The earlier draft referred to:

- `AnswerOption`
- `SelectedAnswerOptionId`
- `IsCorrect`
- option selection and instant answer validation

Those concepts do not exist in the current domain model. If the product goal is an MCQ exam system, that requires a deliberate schema expansion first. It is not an add-on to the current `Question` table.

### 2. Do not claim the existing questions API leaks correct options

The current `GET /api/questions` response returns study content including `AnswerText`, not answer-option correctness metadata.

That still means the endpoint cannot be reused directly for a real assessment mode, but the reason is:

- it exposes the study answer text
- not that it exposes `IsCorrect` flags

### 3. Do not assume the current question UI can be reused as a quiz player

The current Angular question component is a study list with:

- solved toggle
- revision toggle
- answer accordion

It is not a selection-based player component. Some styling can be reused, but quiz interaction still needs dedicated components.

### 4. Do not couple quiz completion directly to `UserProgress`

`UserProgress` currently represents manual study state. Updating it automatically from quiz scoring would change existing semantics and should be treated as a product decision, not a default behavior.

## Recommended MVP For This Repository

The safest MVP is a quiz system built on top of the existing free-text question bank.

### Supported quiz modes for MVP

- `Practice` mode
  - shows one question at a time
  - user reveals the answer after attempting it
  - user can self-mark as correct / incorrect
- `Assessment` mode
  - shows only question text during the attempt
  - hides `AnswerText` until submission or completion
  - supports timer and final review

This fits the current data model because the source content is question plus answer text.

## Proposed Backend Design

### New entities

Add quiz-specific tables instead of changing the study tables:

- `QuizAttempt`
  - `Id`
  - `UserId`
  - `Mode`
  - `Status`
  - `StartedAt`
  - `CompletedAt`
  - `ExpiresAtUtc`
  - `TotalQuestions`
  - `CorrectCount` for self-marked or system-scored modes
- `QuizAttemptQuestion`
  - `Id`
  - `QuizAttemptId`
  - `QuestionId`
  - `QuestionVersionId` nullable but recommended
  - `OrderIndex`
  - `QuestionTextSnapshot`
  - `AnswerTextSnapshot`
  - `TitleSnapshot`
- `QuizAttemptResponse`
  - `Id`
  - `QuizAttemptQuestionId`
  - `ResponseText` nullable
  - `IsSelfMarkedCorrect` nullable
  - `AnsweredAtUtc`

### Why snapshots are better here

This project already has soft delete and versioning support. Because quiz review is historical, storing snapshots at quiz start is better than relying only on `QuestionId`.

Recommended rule:

- keep `QuestionId` as a reference
- also store question and answer snapshots for stable history
- if available, store `QuestionVersionId` to identify the source revision

### New API surface

Suggested endpoints:

- `POST /api/quizzes`
  - create attempt from filters like category, difficulty, role, count, mode
- `GET /api/quizzes/{attemptId}`
  - fetch player payload
- `POST /api/quizzes/{attemptId}/responses`
  - save progress during the attempt
- `POST /api/quizzes/{attemptId}/submit`
  - finalize attempt
- `GET /api/quizzes/{attemptId}/review`
  - return completed review payload including answers

### DTO rule

Use dedicated quiz DTOs. Do not reuse `QuestionDto`.

- attempt-start DTO should omit `AnswerText` for assessment mode
- review DTO can include answer snapshots and response data

## Proposed Frontend Design

Create dedicated quiz pages rather than overloading the dashboard table.

Suggested Angular pieces:

- `quiz-dashboard-page`
  - configuration form for mode, filters, count, duration
- `quiz-player-page`
  - single-question or paged attempt experience
- `quiz-review-page`
  - final summary and answer review
- `quiz.service.ts`
  - API integration for attempt lifecycle

Reusable pieces from the current UI should be limited to:

- badges
- buttons
- panel styling

Do not model the implementation around a shared study/quiz component until the actual quiz interaction is defined.

## Scoring Guidance

For the current repository, there are two realistic choices:

### Option A. Self-assessed quiz

The user attempts the question, then reveals the answer and marks themselves correct or incorrect.

Pros:

- works immediately with the current `Question` plus `AnswerText` model
- no need for MCQ schema changes

Cons:

- not objectively scored

### Option B. Future MCQ/objective scoring

If you want objective automatic scoring, first add a proper answer-option model:

- `QuestionOption`
- correctness flags or answer key representation
- possibly support for single-select and multi-select

That is a separate feature slice and should not be implied as already compatible with the current project.

## Recommended Decisions

For this repository, the best near-term path is:

1. Build quiz mode on the existing free-text study bank.
2. Use dedicated quiz entities and DTOs.
3. Snapshot question content at quiz creation time.
4. Keep quiz data separate from `UserProgress`.
5. Treat MCQ support as a future schema enhancement, not as part of the current baseline.

## Summary Of Review

The previous `QUIZ.md` was directionally useful, but it did not match this codebase in four important ways:

- it assumed a multiple-choice domain that does not exist
- it described API masking around `IsCorrect` instead of the current `AnswerText`
- it assumed reusable quiz UI that is not implemented
- it treated quiz results as if they should automatically update `UserProgress`

This rewritten version keeps the quiz proposal aligned with the actual backend entities, frontend structure, and current data model.

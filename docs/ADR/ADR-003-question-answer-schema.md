> **Navigation:** [← Back to README](../../README.md) · [Architecture](../Architecture/) · [Domain](../Domain/) · [Features](../Features/) · [API](../API/) · [ADR](../ADR/)
> **Related:** [QUIZ](../Features/QUIZ.md) · [PRD](../Domain/PRD.md) · [TRD](../Architecture/TRD.md)

# ADR 003: Question & Answer Schema

## Context
When designing the data model for interview questions and the future Quiz engine, we needed to decide how to represent answers. The initial thought was to build a Multiple Choice Question (MCQ) engine with `Question` having a 1-to-many relationship to `AnswerOption` entities, with one marked `IsCorrect`.

## Decision
We rejected the MCQ model in favor of a **free-text / self-assessed schema**.

The `Question` entity has a single `Solution` string field (stored as Markdown). 

For the Quiz engine, users type their answers into a free-text box. The system then reveals the master `Solution` and the user clicks a self-assessment button (e.g., "I nailed it", "Needs Work") to grade their own response.

## Consequences
**Positive:**
- **Realistic Interview Prep:** Behavioral and system design questions cannot be tested via multiple choice. Free-text encourages candidates to actually formulate answers.
- **Schema Simplicity:** Eliminated the need for `AnswerOption` tables, foreign keys, and complex validation rules (e.g., ensuring exactly one option is marked correct).
- **Import Simplicity:** Ingesting bulk questions via Excel is trivial when the answer is just a single column of text.

**Negative:**
- **No Auto-Scoring:** The system cannot definitively grade a user. We rely entirely on the honor system via self-assessment.
- **Future AI Overhead:** If we ever want auto-grading, we will have to integrate an LLM to evaluate the user's free-text response against the master solution, which adds cost and latency.

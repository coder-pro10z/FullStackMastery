---
id: "Question"
type: "domain-entity"
domain: "Backend"
layer: "Domain"
module: "Questions"
feature:
  - "[[Feature Question Bank]]"
technology: ".NET 8"
framework: "EF Core 8"
language: "C#"
project: "InterviewPrepApp.Domain"
namespace: "InterviewPrepApp.Domain.Entities"
api_endpoint: ""
database_table: "Questions"
depends_on:
  - "[[Category]]"
  - "[[Answer]]"
used_by:
  - "[[QuestionService]]"
implements: []
calls: []
related_to:
  - "[[QuestionsTable]]"
status: "implemented"
tags:
  - domain/entity
  - feature/question-bank
---

# Entity: Question

## Overview
Primary aggregate root for technical questions in FullStackMastery. Tracks core text, difficulty, status flags, and soft-delete properties.

## Properties

| Property Name | Type | Description |
|---|---|---|
| `Id` | `int` | Primary key |
| `ExternalId` | `string?` | Upsert and cross-referencing key (e.g. `Q_CSHARP_VAR_VS_DYNAMIC`) |
| `Title` | `string?` | Brief title summarizing the core theme |
| `QuestionText` | `string` | The detailed prompt displayed to the user |
| `Difficulty` | `[[Difficulty]]` enum | Easy, Medium, Hard |
| `CategoryId` | `int` | Foreign key referencing `[[Category]]` |
| `Status` | `QuestionStatus` enum | Draft or Published state |
| `IsDeleted` | `bool` | Global query filter flag for soft deletion |
| `CreatedAt` / `UpdatedAt` | `DateTime` | Tracking fields |

## Relationships
* **Category** (1:N): Each question belongs to a single `[[Category]]`.
* **Answer** (1:1): Associated structured answer mapping containing definitions and checklists.
* **Tags** (M:N): Mapped via `QuestionTag` bridge to general tags.
* **Progress** (M:N): Tracked per user via composite keys on `[[UserProgress]]`.

---

## 🔗 Architecture Graph Relations

* **Table Map**: `[[QuestionsTable]]`
* **Parent Category Entity**: `[[Category]]`
* **Child Answer Entity**: `[[Answer]]`

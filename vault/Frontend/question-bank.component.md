---
id: "question-bank.component"
type: "angular-component"
domain: "Frontend"
layer: "Frontend"
module: "Questions"
feature:
  - "[[Feature Question Bank]]"
technology: "Angular 17"
framework: "Standalone Angular"
language: "TypeScript | HTML | SCSS"
project: "frontend"
namespace: ""
api_endpoint: ""
database_table: ""
depends_on:
  - "[[question.service]]"
  - "[[FilterBarComponent]]"
  - "[[PaginationComponent]]"
used_by: []
implements: []
calls:
  - "[[question.service]]"
related_to: []
status: "implemented"
tags:
  - frontend/component
  - feature/question-bank
---

# Component: question-bank.component

## Overview
Standalone page component displaying technical interview questions. Implements OnPush change detection and reactive routing for category filters, searches, page changes, and progress updates.

## Component Features
* **Standalone**: Declared with `standalone: true` and lists imports directly (e.g. `FilterBarComponent`, `QuestionBadgeComponent`).
* **Animations**: Integrates custom Angular animations for slide-downs (`expandCollapse`) and card transitions (`listAnimation`).
* **Signals & RxJS**: Combines route parameters, custom filter subjects, and pagination states reactively using `combineLatest` and `switchMap` mapping down to `questionService.getQuestions`.

---

## 🔗 Architecture Graph Relations

* **Injects Services**: `[[question.service]]`
* **Child Components**:
  * `[[FilterBarComponent]]` — Captures text input and difficulties.
  * `[[PaginationComponent]]` — Triggers list updates.
  * `[[QuestionBadgeComponent]]` — Renders question metadata tags.
* **Routed Path**: Defined in `[[app.routes]]` at `/question-bank`.

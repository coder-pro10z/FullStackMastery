---
id: "QuestionsController"
type: "controller"
domain: "Backend"
layer: "Api"
module: "Questions"
feature:
  - "[[Feature Question Bank]]"
technology: ".NET 8"
framework: "ASP.NET Core"
language: "C#"
project: "InterviewPrepApp.Api"
namespace: "InterviewPrepApp.Api.Controllers"
api_endpoint: "GET /api/questions"
database_table: ""
depends_on:
  - "[[IQuestionService]]"
used_by:
  - "[[question.service]]"
implements: []
calls:
  - "[[IQuestionService]]"
related_to:
  - "[[Feature Question Bank]]"
status: "implemented"
tags:
  - backend/controller
  - feature/question-bank
---

# Controller: QuestionsController

## Overview
Thin controller exposing query capabilities for technical interview questions. Refers directly to `[[IQuestionService]]` to retrieve paginated, filtered lists.

## API Endpoints

### 1. GET `/api/questions`
Retrieves a paginated list of public questions filtered by category, search term, difficulty level, and user role.

* **Query Parameters**:
  * `categoryId` (int?, optional)
  * `searchTerm` (string?, optional)
  * `difficulty` (`[[Difficulty]]` enum?, optional)
  * `role` (string?, optional)
  * `pageNumber` (int, default = 1)
  * `pageSize` (int, default = 20)
* **Auth**: Anonymous / JWT (extracts `ClaimTypes.NameIdentifier` if authenticated to resolve user-specific progress like completed statuses).

---

## 🔗 Architecture Graph Relations

* **Parent Hub**: `[[Feature Question Bank]]`
* **Injects**: `[[IQuestionService]]`
* **Invoked By**: `[[question.service]]` (Angular client service)

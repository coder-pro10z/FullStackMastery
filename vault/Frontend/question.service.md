---
id: "question.service"
type: "angular-service"
domain: "Frontend"
layer: "Frontend"
module: "Questions"
feature:
  - "[[Feature Question Bank]]"
technology: "Angular 17"
framework: "Standalone Angular"
language: "TypeScript"
project: "frontend"
namespace: ""
api_endpoint: "GET /api/questions"
database_table: ""
depends_on: []
used_by:
  - "[[question-bank.component]]"
implements: []
calls:
  - "[[QuestionsController]]"
related_to: []
status: "implemented"
tags:
  - frontend/service
  - feature/question-bank
---

# Service: question.service

## Overview
Angular client-side service designed to communicate with the public backend `[[QuestionsController]]` API. Encapsulates query parameter mappings and API path resolution.

## Key Methods

### 1. `getQuestions`
Executes an HTTP GET call to `/api/questions` appending non-empty query parameters:
```typescript
getQuestions(query: QuestionQueryParams = {}) {
  let params = new HttpParams();

  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params = params.set(key, String(value));
    }
  });

  return this.http.get<PagedResponse<QuestionDto>>(`${environment.apiUrl}/questions`, { params });
}
```

---

## 🔗 Architecture Graph Relations

* **Invokes Endpoints on**: `[[QuestionsController]]` (Backend Controller)
* **Used By Components**: `[[question-bank.component]]`

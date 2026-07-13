> **Navigation:** [← Back to README](../../README.md) · [Architecture](../Architecture/) · [Domain](../Domain/) · [Features](../Features/) · [API](../API/) · [ADR](../ADR/)
> **Related:** [TRD](../Architecture/TRD.md)

# API Reference

Base URL: `http://localhost:5000/api`

### Authentication

| Method | Endpoint | Auth | Notes |
|---|---|---|---|
| POST | `/api/auth/register` | Public | Creates user, returns JWT |
| POST | `/api/auth/login` | Public | Returns JWT + roles array |

```json
// Request
{ "email": "user@example.com", "password": "string" }

// Response
{ "token": "jwt", "email": "...", "userId": "...", "roles": ["Admin"] }
```

### Categories

| Method | Endpoint | Auth | Notes |
|---|---|---|---|
| GET | `/api/categories/tree` | Public | Nested JSON tree |
| GET | `/api/categories/flat` | Public | Flat list for dropdowns |

### Questions

| Method | Endpoint | Auth | Query Params |
|---|---|---|---|
| GET | `/api/questions` | Public/Auth | `categoryId`, `searchTerm`, `difficulty`, `role`, `pageNumber`, `pageSize` |

Returns `PagedResponse<QuestionDto>` — includes `totalRecords`, `pageNumber`, `pageSize`.

### User Progress

| Method | Endpoint | Auth |
|---|---|---|
| GET | `/api/userprogress/summary` | `[Authorize]` |
| POST | `/api/userprogress/{questionId}/toggle-solved` | `[Authorize]` |
| POST | `/api/userprogress/{questionId}/toggle-revision` | `[Authorize]` |

### Admin — Questions

| Method | Endpoint | Auth |
|---|---|---|
| GET | `/api/admin/questions` | Admin |
| POST | `/api/admin/questions` | Admin |
| PUT | `/api/admin/questions/{id}` | Admin |
| DELETE | `/api/admin/questions/{id}` | Admin |
| POST | `/api/admin/questions/{id}/restore` | Admin |
| GET | `/api/admin/questions/{id}/versions` | Admin |

### Admin — Categories

| Method | Endpoint | Auth |
|---|---|---|
| GET | `/api/admin/categories/tree` | Admin |
| POST | `/api/admin/categories` | Admin |
| DELETE | `/api/admin/categories/{id}` | Admin |

### Admin — Import

| Method | Endpoint | Auth | Notes |
|---|---|---|---|
| POST | `/api/admin/import-questions` | Admin | Unified pipeline: `.xlsx`, `.csv`, `.json` |
| POST | `/api/admin/import` *(legacy)* | `[Authorize]` ⚠️ | Direct-insert path; role guard **not yet applied** |

> ⚠️ The legacy `/api/admin/import` endpoint uses only `[Authorize]`, not `[Authorize(Roles = "Admin")]`. Any authenticated user can currently reach it. This is a tracked security gap.

### Admin — Dashboard

| Method | Endpoint | Auth |
|---|---|---|
| GET | `/api/admin/dashboard/stats` | Admin |
| GET | `/api/admin/dashboard/audit-logs` | Admin |

### CheatSheet Resources

| Method | Endpoint | Auth |
|---|---|---|
| GET | `/api/resources?categoryId=` | `[Authorize]` |
| POST | `/api/admin/resources` | Admin |
| DELETE | `/api/admin/resources/{id}` | Admin |

### Quiz & Assessment

| Method | Endpoint | Auth | Notes |
|---|---|---|---|
| POST | `/api/quizzes` | `[Authorize]` | Create attempt; `mode: Practice\|Assessment` |
| GET | `/api/quizzes/{id}` | `[Authorize]` | Load attempt; answers masked in Assessment mode |
| POST | `/api/quizzes/{id}/responses/{questionId}` | `[Authorize]` | Save per-question response |
| POST | `/api/quizzes/{id}/submit` | `[Authorize]` | Final submission + scoring |

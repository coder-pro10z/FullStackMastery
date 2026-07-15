# 📦 `/data` — Import Source Files

This directory is the **source of truth** for all bulk import data in FullStackMastery. It is tracked in Git and should be updated whenever question or answer content is added or revised.

---

## Directory Structure

```
data/
├── schemas/             # JSON Schema contracts — define the valid shape of each file
│   ├── question.schema.json
│   └── answer.schema.json
└── seeds/               # Raw master data files — drop your JSONs here before importing
    ├── questions.json   # 620 questions across all domains
    └── answers.json     # 533 structured answers (linked to questions via question_id)
```

---

## Import Workflow

Imports are always run as **two sequential steps** from the Admin Panel (`/admin/import`).

### Step 1 — Import Questions
> Must run **first**. Creates all `Question` rows in the database.

1. Open `data/seeds/questions.json`
2. In the Admin Panel → Import tab, select the file and choose **"Questions"**
3. Run a **Dry Run** first to check for validation errors
4. Confirm and run the **Live Import**

**Endpoint:** `POST /api/admin/import/questions`

### Step 2 — Import Answers
> Must run **after Step 1**. Each answer is matched to its `Question` via `question_id`.

1. Open `data/seeds/answers.json`
2. In the Admin Panel → Import tab, select the file and choose **"Answers"**
3. Run a **Dry Run** first
4. Confirm and run the **Live Import**

**Endpoint:** `POST /api/admin/import/answers`

> **Note:** 620 questions − 533 answers = **87 questions currently have no answer**. These will be visible in the Admin Panel as questions with no answer attached. They are not an error.

---

## Validation

Both files are validated against their respective JSON Schema contracts in `schemas/`:

| File | Schema | Required Fields |
|------|--------|----------------|
| `questions.json` | `schemas/question.schema.json` | `question_id`, `domain_id`, `difficulty`, `question`, `category`, `status` |
| `answers.json` | `schemas/answer.schema.json` | `question_id`, `definition`, `interview_answer` |

VS Code will auto-validate your JSON files if you have the `$schema` property at the top of each file:
```json
{
  "$schema": "../schemas/question.schema.json",
  ...
}
```

---

## Deduplication

- **Questions** are deduplicated by `question_id` (ExternalId). Re-importing an existing question updates it in place.
- **Answers** are deduplicated by `question_id`. Re-importing an existing answer updates it in place.

---

## Git Rules

| Path | Committed? | Reason |
|------|-----------|--------|
| `data/schemas/` | ✅ Yes | Schema contracts are part of the codebase |
| `data/seeds/` | ✅ Yes | Master data is source of truth |
| `data/exports/` | ❌ No | DB exports are transient |
| `data/temp/` | ❌ No | Temp processing files |

---

## Domain Reference

| `domain_id` | Topic |
|-------------|-------|
| `DOTNET` | C#, ASP.NET Core, EF Core |
| `AUTH` | Authentication, JWT, OAuth |
| `SQL` | SQL Server, queries, indexes |
| `DEVOPS` | Docker, CI/CD, deployment |
| `FRONTEND` | Angular, JavaScript, CSS |
| `FULLSTACK` | Cross-cutting full-stack concepts |
| `CLOUD` | Azure, AWS, cloud patterns |
| `SECURITY` | Security, OWASP, encryption |
| `SYSTEM_DESIGN` | Architecture, scalability |

---

*Last updated: 2026-07-15*

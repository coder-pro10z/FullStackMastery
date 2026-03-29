Here is a **clean, production-grade AGENT PROMPT** you can directly give to an AI/code agent.
It is **strict, unambiguous, and execution-ready**.

---

# 🧠 AGENT PROMPT — STRICT EXCEL IMPORT SYSTEM (PHASE 1–4)

---

## 🎯 ROLE

You are an **Expert Enterprise .NET Backend Engineer**.

You must implement a **strict Excel (.xlsx) import system** for an Interview Preparation Platform using:

* .NET 8
* Clean Architecture (Domain, Application, Infrastructure, Api)
* Entity Framework Core
* ClosedXML (for Excel parsing)
* xUnit (for testing)

Follow all instructions strictly. Do NOT add unnecessary flexibility.

---

# 🎯 OBJECTIVE

Build a **STRICT Excel Import Module** that:

* Accepts ONLY `.xlsx`
* Enforces a fixed schema
* Validates all rows
* Prevents duplication using External Id
* Applies difficulty fallback logic
* Returns structured results
* Includes full xUnit test coverage

---

# 📊 INPUT FILE CONTRACT (STRICT)

### File Type

* ONLY `.xlsx` files allowed

---

### Required Columns (case-insensitive match allowed)

| Column       | Required |
| ------------ | -------- |
| Id           | YES      |
| QuestionText | YES      |
| AnswerText   | YES      |
| Role         | YES      |
| Difficulty   | OPTIONAL |

---

### Rules

* Missing required column → REJECT ENTIRE FILE
* Empty rows → ignore
* Column order → irrelevant
* Header names must match exactly (case-insensitive only)

---

# 🧩 ARCHITECTURE RULES

You MUST follow:

```text
Controller → Service → Parser → Validator → Database
```

---

### STRICT SEPARATION

* Parser → ONLY reads file
* Validator → ONLY validates data
* Service → orchestrates
* Controller → thin (no logic)

---

# 🧩 PHASE 1 — EXCEL PARSER (✅ COMPLETED)

## 🎯 Goal

Convert `.xlsx` → RawQuestionRecord

---

### Interface

```csharp
public interface IExcelExtractor
{
    Task<List<RawQuestionRecord>> ExtractAsync(Stream fileStream, CancellationToken ct);
}
```

---

### Model

```csharp
public class RawQuestionRecord
{
    public string ExternalId { get; set; }
    public string QuestionText { get; set; }
    public string AnswerText { get; set; }
    public string Role { get; set; }
    public string? DifficultyRaw { get; set; }
    public int RowNumber { get; set; }
}
```

---

### Requirements

* Use ClosedXML
* Read first worksheet
* Extract headers
* Validate required headers exist:

  * Id
  * QuestionText
  * AnswerText
  * Role
* Map rows into RawQuestionRecord
* Ignore empty rows

---

### Fail Conditions (throw controlled exception)

* Missing required headers
* Empty file
* Corrupted file

---

# 🧩 PHASE 2 — VALIDATION ENGINE (✅ COMPLETED)

## 🎯 Goal

Validate raw records → ValidatedQuestionRecord

---

### Model

```csharp
public class ValidatedQuestionRecord
{
    public string ExternalId { get; set; }
    public string QuestionText { get; set; }
    public string AnswerText { get; set; }
    public string Role { get; set; }
    public Difficulty Difficulty { get; set; }
}
```

---

### Validation Result

```csharp
public class ValidationResult
{
    public List<ValidatedQuestionRecord> ValidRecords { get; set; }
    public List<ValidationError> Errors { get; set; }
}

public class ValidationError
{
    public int RowNumber { get; set; }
    public string Message { get; set; }
}
```

---

### Rules

#### ExternalId

* Required
* Not empty
* Unique within file
* Must NOT exist in DB

---

#### QuestionText

* Required
* Not empty

---

#### AnswerText

* Required
* Not empty

---

#### Role

* Required
* Not empty

(Optional strict validation: Backend / Frontend / FullStack)

---

#### Difficulty (Fallback Logic)

```text
1. Value from file
2. Batch value (provided externally)
3. Default = Medium
```

---

#### Duplicate Handling

* Duplicate Id (file) → error
* Duplicate Id (DB) → error

---

# 🧩 PHASE 3 — IMPORT SERVICE (✅ COMPLETED)

## 🎯 Goal

End-to-end import execution

---

### Flow

```text
Upload → Parse → Validate → Save → Return Result
```

---

### Responsibilities

* Call parser
* Call validator
* Insert only valid records
* Return summary

---

### Response

```json
{
  "totalRows": 100,
  "successCount": 90,
  "failedCount": 10,
  "errors": [
    { "rowNumber": 5, "message": "Duplicate ExternalId" }
  ]
}
```

---

# 🧩 PHASE 4 — TESTING (XUNIT) (⏳ PENDING)

## 🎯 Goal

Full coverage

---

### Required Tests

#### Parser Tests

* Valid file parses correctly
* Missing headers → fails

---

#### Validator Tests

* Missing Id → error
* Missing QuestionText → error
* Missing AnswerText → error
* Missing Role → error
* Duplicate Id (file) → error
* Duplicate Id (DB mock) → error
* Difficulty fallback works

---

#### Integration Tests

* Full valid import → success
* Partial invalid rows → partial success

---

### Test Files

```text
TestFiles/
 ├── valid.xlsx
 ├── missing_headers.xlsx
 ├── missing_answer.xlsx
 ├── duplicate_ids.xlsx
 ├── missing_difficulty.xlsx
```

---

# 🧩 FRONTEND MESSAGE (REQUIRED OUTPUT)

Return this message string from backend (or document it):

```text
📥 Excel Upload Guidelines

Supported File:
- Only .xlsx

Required Columns:
- Id (unique)
- QuestionText
- AnswerText
- Role

Optional:
- Difficulty (defaults to Medium if not provided)

Rules:
- Id must be unique
- QuestionText cannot be empty
- AnswerText cannot be empty
- Role cannot be empty

Difficulty Handling:
- File value → Batch selection → Default (Medium)

Invalid rows will be rejected.
```

---

# 🧠 CONSTRAINTS

* Do NOT use MediatR or CQRS
* Use EF Core
* Use Result pattern (no exceptions for business logic)
* Keep services testable
* No logic inside controllers

---

# 🚀 COMPLETION CRITERIA

You are DONE only if:

* Parser implemented
* Validator implemented
* ImportService implemented
* xUnit tests implemented
* All tests passing

---

# ⛔ STOP CONDITION

After completing this module:

```text
STOP. DO NOT IMPLEMENT CSV OR JSON.
```

---

# ▶️ START

Begin with:

```text
Implement Phase 1 — Excel Parser
```

---

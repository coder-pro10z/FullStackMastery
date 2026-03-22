# ADMIN.MD — Interview Preparation Platform
## SaaS Admin Panel: Complete Design & Architecture Reference

> **Version:** 1.0.0 | **Author:** Platform Architecture Team | **Date:** March 2026

---

## Table of Contents

1. [Feature Overview](#1-feature-overview)
2. [UI/UX Layout — Admin Panel Screens](#2-uiux-layout--admin-panel-screens)
3. [Backend Architecture](#3-backend-architecture)
4. [Database Design](#4-database-design)
5. [Seeder Strategy](#5-seeder-strategy)
6. [API Design](#6-api-design)
7. [Role-Based Access Control (RBAC)](#7-role-based-access-control-rbac)
8. [Markdown Support for Answers](#8-markdown-support-for-answers)
9. [Best Practices & Scaling Strategy](#9-best-practices--scaling-strategy)

---

## 1. Feature Overview

The Admin Panel is the operational backbone of the platform. It empowers **Admin** and **Editor** roles to manage all content and users without touching the database directly.

### Feature Matrix

| Feature | Admin | Editor |
|---|---|---|
| Dashboard (stats & metrics) | ✅ | ✅ |
| Create / Edit Questions | ✅ | ✅ |
| Delete Questions (soft) | ✅ | ✅ |
| Restore Soft-Deleted Questions | ✅ | ❌ |
| Question Versioning | ✅ | ✅ |
| Bulk Import (CSV / JSON) | ✅ | ❌ |
| Category Management | ✅ | ❌ |
| User Management | ✅ | ❌ |
| Role Assignment | ✅ | ❌ |
| Audit Log Access | ✅ | ❌ |
| Markdown Answer Editor | ✅ | ✅ |
| Search + Filters | ✅ | ✅ |

---

## 2. UI/UX Layout — Admin Panel Screens

### 2.1 Navigation Structure

```
Admin Panel
├── Dashboard           — Stats, recent activity, quick actions
├── Questions           — CRUD table with filters + modal editor
│   ├── All Questions
│   ├── Drafts
│   └── Trash (soft-deleted)
├── Categories          — Hierarchical tree view + management
├── Import              — CSV/JSON bulk upload with live validation
├── Users               — User list, role assignment, suspension
└── Audit Logs          — Immutable change history
```

### 2.2 Admin Layout Shell

```
┌────────────────────────────────────────────────────────────┐
│  TOPBAR: [🔍 Search] ............... [🔔] [Admin ▼]       │
├──────────┬─────────────────────────────────────────────────┤
│          │                                                  │
│ SIDEBAR  │            MAIN CONTENT AREA                    │
│          │                                                  │
│ 📊 Dashboard         ┌──── HEADER (Breadcrumb + Action) ──┐│
│ ❓ Questions          │                                    ││
│ 🏷 Categories         │  [Table / Form / Cards]            ││
│ 📥 Import            │                                    ││
│ 👥 Users             └────────────────────────────────────┘│
│ 📋 Audit Logs        ┌──── PAGINATION / FOOTER ───────────┐│
│                      │  Showing 1-20 of 540   [< 1 2 3 >] ││
└──────────┴───────────┴────────────────────────────────────┘│
```

### 2.3 Screen Designs

#### Screen 1: Dashboard

```
┌── Stats Row ─────────────────────────────────────────────┐
│  📚 Total Questions   👥 Total Users   📁 Categories      │
│       540                  1,240             12           │
│  [▲ +12 this week]   [▲ +38 today]    [+2 new]           │
└──────────────────────────────────────────────────────────┘
┌── Difficulty Breakdown ──┐  ┌── Recent Activity ─────────┐
│  Easy   ████░░ 220       │  │  admin edited Q#42 (2m ago)│
│  Medium ███░░░ 180       │  │  editor added Q#99 (5m ago)│
│  Hard   █░░░░░  90       │  │  admin imported 20 Qs (1h) │
│  Draft  ██░░░░  50       │  │  user registered (2h ago)  │
└──────────────────────────┘  └────────────────────────────┘
```

#### Screen 2: Question Management Table

```
[+ New Question]  [📥 Import]  [🗑 Trash]
─────────────────────────────────────────────────────────────
Filter: [Category ▼] [Difficulty ▼] [Role ▼] [🔍 Search...]
─────────────────────────────────────────────────────────────
 # │ Title               │ Category  │ Diff   │ Role    │ ⚙
───┼─────────────────────┼───────────┼────────┼─────────┼────
 1 │ Explain REST vs...  │ Backend   │ Easy   │Backend  │ ✏ 🗑
 2 │ What is CQRS?       │ .NET      │ Hard   │Backend  │ ✏ 🗑
 3 │ CSS Flexbox vs Grid │ Frontend  │ Medium │Frontend │ ✏ 🗑
─────────────────────────────────────────────────────────────
Showing 1–20 of 540    [Previous]  1  2  3  ...  27  [Next]
```

#### Screen 3: Question Editor Modal

```
┌─── Edit Question ── [Q#42] ──────────────────────── [✕] ─┐
│                                                           │
│  Title: [___________________________________]             │
│                                                           │
│  Category: [Backend ▼]  Difficulty: [Easy ▼]             │
│  Role:     [Backend ▼]  Status: [Published ▼]            │
│                                                           │
│  Question Text:                                           │
│  ┌─────────────────────────────────────────────────────┐ │
│  │ Explain the difference between REST and GraphQL...  │ │
│  └─────────────────────────────────────────────────────┘ │
│                                                           │
│  Answer (Markdown):                                       │
│  [Bold] [Italic] [Code] [List] [H2] [H3] [Preview]      │
│  ┌─────────────────────────────────────────────────────┐ │
│  │ ## REST vs GraphQL                                  │ │
│  │ REST uses **fixed endpoints** per resource...       │ │
│  │ ```http                                             │ │
│  │ GET /api/users/1                                    │ │
│  │ ```                                                 │ │
│  └─────────────────────────────────────────────────────┘ │
│                                                           │
│  [Version History ↗]      [Cancel]  [Save Draft]  [Save] │
└───────────────────────────────────────────────────────────┘
```

#### Screen 4: Bulk Import

```
┌─── Import Questions ─────────────────────────────────────┐
│  Format: ● JSON  ○ CSV                                    │
│  Default Category: [Select ▼]                            │
│                                                           │
│  ┌─────────── Drag & Drop Zone ──────────────────────┐   │
│  │  📁 Drop your .json or .csv file here             │   │
│  │     or  [Browse File]                              │   │
│  │     Max size: 5MB                                  │   │
│  └────────────────────────────────────────────────────┘   │
│                                                           │
│  Validation Preview:                                      │
│  ✅  Row 1: "Explain REST..." — Valid                      │
│  ✅  Row 2: "What is CQRS?" — Valid                        │
│  ⚠️  Row 3: Missing difficulty field — Will use default   │
│  ❌  Row 4: Answer is empty — Skipped                      │
│                                                           │
│  20 valid / 2 warnings / 1 error                         │
│  [Cancel]                          [Import 20 Questions]  │
└───────────────────────────────────────────────────────────┘
```

#### Screen 5: Category Manager

```
Categories (Hierarchical Tree)
[+ Add Root Category]
──────────────────────────────────
▼ 📁 .NET (4 questions)
    ├── ASP.NET Core (2)
    └── Entity Framework Core (2)
▼ 📁 Backend (5 questions)
    └── System Design (3)
  📁 Fundamentals (2 questions)
──────────────────────────────────
Click category to edit / reorder via drag
```

#### Screen 6: Audit Log

```
Filter: [User ▼] [Action ▼] [Date Range]
──────────────────────────────────────────────────────────
Timestamp        │ User      │ Action   │ Target    │ Diff
─────────────────┼───────────┼──────────┼───────────┼─────
2026-03-20 18:42 │ admin     │ EDITED   │ Q#42      │ [View]
2026-03-20 18:30 │ editor1   │ CREATED  │ Q#99      │ [View]
2026-03-20 17:12 │ admin     │ IMPORTED │ 20 Qs     │ [View]
2026-03-20 16:55 │ admin     │ DELETED  │ Q#13      │ [View]
──────────────────────────────────────────────────────────
```

---

## 3. Backend Architecture

### 3.1 Clean Architecture Layer Map

```
InterviewPrepApp/
├── src/
│   ├── InterviewPrepApp.Domain/           ← Entities, Value Objects, Enums
│   │   ├── Entities/
│   │   │   ├── Question.cs
│   │   │   ├── Answer.cs
│   │   │   ├── Category.cs
│   │   │   ├── AuditLog.cs
│   │   │   └── QuestionVersion.cs
│   │   └── Enums/
│   │       ├── Difficulty.cs
│   │       └── QuestionStatus.cs
│   │
│   ├── InterviewPrepApp.Application/      ← Interfaces, Use Cases, DTOs, Validators
│   │   ├── Interfaces/
│   │   │   ├── IQuestionRepository.cs
│   │   │   ├── ICategoryRepository.cs
│   │   │   ├── IAdminDashboardService.cs
│   │   │   ├── IQuestionImportService.cs
│   │   │   ├── IAuditLogService.cs
│   │   │   └── Seeders/
│   │   │       ├── ISeederService.cs
│   │   │       └── SeederOptions.cs
│   │   ├── DTOs/
│   │   │   ├── Admin/
│   │   │   │   ├── QuestionAdminDto.cs
│   │   │   │   ├── CreateQuestionDto.cs
│   │   │   │   ├── UpdateQuestionDto.cs
│   │   │   │   ├── ImportQuestionDto.cs
│   │   │   │   ├── DashboardStatsDto.cs
│   │   │   │   └── AuditLogDto.cs
│   │   │   └── Category/
│   │   │       └── CategoryManageDto.cs
│   │   └── Validators/
│   │       ├── CreateQuestionValidator.cs
│   │       └── ImportQuestionValidator.cs
│   │
│   ├── InterviewPrepApp.Infrastructure/   ← EF Core, Repositories, External Services
│   │   ├── Persistence/
│   │   │   ├── ApplicationDbContext.cs
│   │   │   ├── Configurations/
│   │   │   │   ├── QuestionConfiguration.cs
│   │   │   │   └── AuditLogConfiguration.cs
│   │   │   └── Repositories/
│   │   │       ├── QuestionRepository.cs
│   │   │       └── CategoryRepository.cs
│   │   └── Seeders/
│   │       ├── LegacySeederService.cs
│   │       └── AdvancedSeederService.cs
│   │
│   └── InterviewPrepApp.Api/              ← Controllers, Middleware, DI Setup
│       ├── Controllers/
│       │   └── Admin/
│       │       ├── AdminQuestionsController.cs
│       │       ├── AdminCategoriesController.cs
│       │       ├── AdminImportController.cs
│       │       ├── AdminDashboardController.cs
│       │       └── AdminUsersController.cs
│       ├── Middleware/
│       │   ├── AuditLogMiddleware.cs
│       │   └── RateLimitingMiddleware.cs
│       └── Infrastructure/
│           └── GlobalExceptionHandler.cs
```

### 3.2 Key Domain Entities

```csharp
// Domain/Entities/Question.cs
public class Question
{
    public int Id { get; private set; }
    public string? Title { get; private set; }
    public string QuestionText { get; private set; } = default!;
    public Difficulty Difficulty { get; private set; }
    public string Role { get; private set; } = default!;
    public int CategoryId { get; private set; }
    public Category Category { get; private set; } = default!;
    public QuestionStatus Status { get; private set; }      // Draft | Published
    public bool IsDeleted { get; private set; }             // Soft delete
    public DateTime? DeletedAt { get; private set; }
    public DateTime CreatedAt { get; private set; }
    public DateTime? UpdatedAt { get; private set; }
    public string? CreatedByUserId { get; private set; }

    // Navigation
    public Answer? Answer { get; private set; }
    public IReadOnlyCollection<QuestionVersion> Versions { get; private set; }
        = new List<QuestionVersion>();

    // Factory method
    public static Question Create(string questionText, Difficulty difficulty,
        string role, int categoryId, string? title = null, string? createdByUserId = null)
    {
        return new Question
        {
            Title = title,
            QuestionText = questionText,
            Difficulty = difficulty,
            Role = role,
            CategoryId = categoryId,
            Status = QuestionStatus.Draft,
            IsDeleted = false,
            CreatedAt = DateTime.UtcNow,
            CreatedByUserId = createdByUserId
        };
    }

    public void Update(string? title, string questionText,
        Difficulty difficulty, string role, int categoryId)
    {
        Title = title;
        QuestionText = questionText;
        Difficulty = difficulty;
        Role = role;
        CategoryId = categoryId;
        UpdatedAt = DateTime.UtcNow;
    }

    public void SoftDelete()
    {
        IsDeleted = true;
        DeletedAt = DateTime.UtcNow;
        Status = QuestionStatus.Draft;
    }

    public void Restore()
    {
        IsDeleted = false;
        DeletedAt = null;
    }

    public void Publish() => Status = QuestionStatus.Published;
}

// Domain/Entities/Answer.cs
public class Answer
{
    public int Id { get; private set; }
    public int QuestionId { get; private set; }
    public string MarkdownContent { get; private set; } = default!; // Raw markdown
    public DateTime UpdatedAt { get; private set; }
    public string? UpdatedByUserId { get; private set; }

    public static Answer Create(int questionId, string markdownContent,
        string? updatedByUserId = null)
    {
        return new Answer
        {
            QuestionId = questionId,
            MarkdownContent = markdownContent,
            UpdatedAt = DateTime.UtcNow,
            UpdatedByUserId = updatedByUserId
        };
    }

    public void Update(string markdownContent, string? updatedByUserId = null)
    {
        MarkdownContent = markdownContent;
        UpdatedAt = DateTime.UtcNow;
        UpdatedByUserId = updatedByUserId;
    }
}

// Domain/Entities/AuditLog.cs
public class AuditLog
{
    public long Id { get; private set; }
    public string UserId { get; private set; } = default!;
    public string UserEmail { get; private set; } = default!;
    public string Action { get; private set; } = default!;   // CREATED, EDITED, DELETED etc.
    public string EntityType { get; private set; } = default!; // Question, Category, User
    public string? EntityId { get; private set; }
    public string? OldValues { get; private set; }           // JSON snapshot
    public string? NewValues { get; private set; }           // JSON snapshot
    public string? IpAddress { get; private set; }
    public DateTime Timestamp { get; private set; }

    public static AuditLog Create(string userId, string userEmail,
        string action, string entityType, string? entityId = null,
        string? oldValues = null, string? newValues = null, string? ipAddress = null)
    {
        return new AuditLog
        {
            UserId = userId,
            UserEmail = userEmail,
            Action = action,
            EntityType = entityType,
            EntityId = entityId,
            OldValues = oldValues,
            NewValues = newValues,
            IpAddress = ipAddress,
            Timestamp = DateTime.UtcNow
        };
    }
}

// Domain/Entities/QuestionVersion.cs
public class QuestionVersion
{
    public int Id { get; private set; }
    public int QuestionId { get; private set; }
    public int VersionNumber { get; private set; }
    public string QuestionSnapshot { get; private set; } = default!; // JSON
    public string? AnswerSnapshot { get; private set; }              // JSON
    public string? EditedByUserId { get; private set; }
    public DateTime CreatedAt { get; private set; }
}
```

---

## 4. Database Design

### 4.1 Entity-Relationship Overview

```
Categories (self-referencing tree)
    │
    ├──< Questions (many per category)
    │       │
    │       ├──── Answer (one-to-one, markdown)
    │       ├──── QuestionVersions (one-to-many history)
    │       └──── AuditLogs (via EntityId reference)
    │
AspNetUsers ──< AuditLogs
AspNetUsers ──< AspNetUserRoles ──< AspNetRoles
```

### 4.2 Table Schemas

```sql
-- Categories (supports unlimited depth via ParentId self-reference)
CREATE TABLE Categories (
    Id          INT IDENTITY PRIMARY KEY,
    Name        NVARCHAR(120) NOT NULL,
    Slug        NVARCHAR(120) NOT NULL UNIQUE,   -- url-safe identifier
    ParentId    INT NULL REFERENCES Categories(Id) ON DELETE NO ACTION,
    SortOrder   INT NOT NULL DEFAULT 0,
    CreatedAt   DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    INDEX IX_Categories_ParentId (ParentId)
);

-- Questions
CREATE TABLE Questions (
    Id              INT IDENTITY PRIMARY KEY,
    Title           NVARCHAR(300) NULL,
    QuestionText    NVARCHAR(MAX) NOT NULL,
    Difficulty      TINYINT NOT NULL,            -- 0=Easy 1=Medium 2=Hard
    Role            NVARCHAR(100) NOT NULL,
    CategoryId      INT NOT NULL REFERENCES Categories(Id),
    Status          TINYINT NOT NULL DEFAULT 0,  -- 0=Draft 1=Published
    IsDeleted       BIT NOT NULL DEFAULT 0,
    DeletedAt       DATETIME2 NULL,
    CreatedAt       DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAt       DATETIME2 NULL,
    CreatedByUserId NVARCHAR(450) NULL REFERENCES AspNetUsers(Id),
    INDEX IX_Questions_CategoryId (CategoryId),
    INDEX IX_Questions_IsDeleted (IsDeleted),
    INDEX IX_Questions_Difficulty (Difficulty),
    INDEX IX_Questions_Status (Status)
);

-- Answers (1:1 with Questions, markdown stored raw)
CREATE TABLE Answers (
    Id              INT IDENTITY PRIMARY KEY,
    QuestionId      INT NOT NULL UNIQUE REFERENCES Questions(Id) ON DELETE CASCADE,
    MarkdownContent NVARCHAR(MAX) NOT NULL,
    UpdatedAt       DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    UpdatedByUserId NVARCHAR(450) NULL REFERENCES AspNetUsers(Id)
);

-- QuestionVersions (append-only history)
CREATE TABLE QuestionVersions (
    Id               INT IDENTITY PRIMARY KEY,
    QuestionId       INT NOT NULL REFERENCES Questions(Id) ON DELETE CASCADE,
    VersionNumber    INT NOT NULL,
    QuestionSnapshot NVARCHAR(MAX) NOT NULL,   -- JSON of question at point in time
    AnswerSnapshot   NVARCHAR(MAX) NULL,       -- JSON of answer at point in time
    EditedByUserId   NVARCHAR(450) NULL REFERENCES AspNetUsers(Id),
    CreatedAt        DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    UNIQUE (QuestionId, VersionNumber),
    INDEX IX_QuestionVersions_QuestionId (QuestionId)
);

-- AuditLogs (immutable, append-only)
CREATE TABLE AuditLogs (
    Id          BIGINT IDENTITY PRIMARY KEY,
    UserId      NVARCHAR(450) NOT NULL,
    UserEmail   NVARCHAR(256) NOT NULL,
    Action      NVARCHAR(50) NOT NULL,         -- CREATED | EDITED | DELETED | RESTORED | IMPORTED
    EntityType  NVARCHAR(100) NOT NULL,        -- Question | Category | User
    EntityId    NVARCHAR(100) NULL,
    OldValues   NVARCHAR(MAX) NULL,            -- JSON snapshot before
    NewValues   NVARCHAR(MAX) NULL,            -- JSON snapshot after
    IpAddress   NVARCHAR(50) NULL,
    Timestamp   DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    INDEX IX_AuditLogs_UserId (UserId),
    INDEX IX_AuditLogs_EntityType_EntityId (EntityType, EntityId),
    INDEX IX_AuditLogs_Timestamp (Timestamp)
);
```

### 4.3 EF Core Configuration (Example)

```csharp
// Infrastructure/Persistence/Configurations/QuestionConfiguration.cs
public class QuestionConfiguration : IEntityTypeConfiguration<Question>
{
    public void Configure(EntityTypeBuilder<Question> builder)
    {
        builder.HasKey(q => q.Id);

        builder.Property(q => q.QuestionText).IsRequired().HasMaxLength(int.MaxValue);
        builder.Property(q => q.Role).IsRequired().HasMaxLength(100);
        builder.Property(q => q.Status).HasConversion<byte>();
        builder.Property(q => q.Difficulty).HasConversion<byte>();

        // Global query filter: exclude soft-deleted by default
        builder.HasQueryFilter(q => !q.IsDeleted);

        builder.HasOne(q => q.Answer)
               .WithOne(a => a.Question)
               .HasForeignKey<Answer>(a => a.QuestionId)
               .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(q => q.Versions)
               .WithOne()
               .HasForeignKey(v => v.QuestionId)
               .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(q => q.CategoryId);
        builder.HasIndex(q => new { q.IsDeleted, q.Status });
    }
}
```

---

## 5. Seeder Strategy

### 5.1 Architecture Overview

```
Application.Interfaces.Seeders/
    ISeederService.cs               ← Contract
    SeederOptions.cs                ← Configuration (type, dry-run, etc.)

Infrastructure.Seeders/
    LegacySeederService.cs          ← Existing Excel-based seeder (preserved)
    AdvancedSeederService.cs        ← New JSON/CSV seeder (new)
    SeederFactory.cs                ← Selects correct implementation
```

### 5.2 Interface Definition

```csharp
// Application/Interfaces/Seeders/ISeederService.cs
public interface ISeederService
{
    /// <summary>Seeds questions from the provided source.</summary>
    Task<SeederResult> SeedAsync(SeederOptions options, CancellationToken ct = default);
}

public record SeederOptions
{
    public SeederType Type { get; init; } = SeederType.Advanced;
    public string? FilePath { get; init; }              // For file-based seeders
    public string? JsonContent { get; init; }           // For in-memory JSON seeding
    public int? DefaultCategoryId { get; init; }
    public bool DryRun { get; init; } = false;          // Validate only, don't persist
    public bool OverwriteExisting { get; init; } = false;
    public bool SkipInvalid { get; init; } = true;
}

public record SeederResult
{
    public int Imported { get; init; }
    public int Skipped { get; init; }
    public int Failed { get; init; }
    public IReadOnlyList<string> Errors { get; init; } = [];
    public IReadOnlyList<string> Warnings { get; init; } = [];
    public bool IsDryRun { get; init; }
}

public enum SeederType
{
    Legacy,     // Original Excel-based seeder
    Advanced    // New JSON/CSV seeder
}
```

### 5.3 Factory (Strategy Pattern)

```csharp
// Infrastructure/Seeders/SeederFactory.cs
public class SeederFactory
{
    private readonly IServiceProvider _services;

    public SeederFactory(IServiceProvider services) => _services = services;

    public ISeederService Create(SeederType type) => type switch
    {
        SeederType.Legacy   => _services.GetRequiredService<LegacySeederService>(),
        SeederType.Advanced => _services.GetRequiredService<AdvancedSeederService>(),
        _ => throw new ArgumentOutOfRangeException(nameof(type))
    };
}
```

### 5.4 Advanced Seeder — JSON Import Format

```json
// seeds/questions.json
{
  "version": "1.0",
  "defaultCategorySlug": "backend",
  "questions": [
    {
      "title": "Explain REST vs GraphQL",
      "questionText": "What are the key differences between REST APIs and GraphQL?",
      "difficulty": "Easy",
      "role": "Backend",
      "categorySlug": "backend",
      "answer": {
        "markdown": "## REST vs GraphQL\n\nREST uses **fixed endpoints** per resource...\n\n```http\nGET /api/users/1\n```\n\nGraphQL uses a **single `/graphql` endpoint** with typed queries."
      },
      "tags": ["api", "rest", "graphql"]
    }
  ]
}
```

### 5.5 Advanced Seeder — CSV Import Format

```csv
title,questionText,difficulty,role,categorySlug,answerMarkdown
"Explain REST vs GraphQL","What are the key differences...","Easy","Backend","backend","## REST vs GraphQL\n..."
"What is CQRS?","Describe the CQRS pattern...","Hard","Backend","dotnet","CQRS separates..."
```

### 5.6 Advanced Seeder Implementation

```csharp
// Infrastructure/Seeders/AdvancedSeederService.cs
public class AdvancedSeederService : ISeederService
{
    private readonly ApplicationDbContext _db;
    private readonly IValidator<ImportQuestionDto> _validator;
    private readonly ILogger<AdvancedSeederService> _logger;

    public AdvancedSeederService(ApplicationDbContext db,
        IValidator<ImportQuestionDto> validator,
        ILogger<AdvancedSeederService> logger)
    {
        _db = db;
        _validator = validator;
        _logger = logger;
    }

    public async Task<SeederResult> SeedAsync(SeederOptions options, CancellationToken ct = default)
    {
        var dtos = await ParseSourceAsync(options, ct);
        var errors = new List<string>();
        var warnings = new List<string>();
        int imported = 0, skipped = 0, failed = 0;

        // Build category slug → ID map once
        var categoryMap = await _db.Categories
            .ToDictionaryAsync(c => c.Slug, c => c.Id, ct);

        foreach (var (dto, index) in dtos.Select((d, i) => (d, i + 1)))
        {
            var validation = await _validator.ValidateAsync(dto, ct);
            if (!validation.IsValid)
            {
                if (options.SkipInvalid)
                {
                    warnings.Add($"Row {index}: {string.Join("; ", validation.Errors.Select(e => e.ErrorMessage))} — Skipped");
                    skipped++;
                    continue;
                }
                errors.Add($"Row {index}: Validation failed");
                failed++;
                continue;
            }

            if (!categoryMap.TryGetValue(dto.CategorySlug, out var categoryId))
            {
                if (options.DefaultCategoryId.HasValue)
                {
                    warnings.Add($"Row {index}: Category '{dto.CategorySlug}' not found — using default");
                    categoryId = options.DefaultCategoryId.Value;
                }
                else
                {
                    errors.Add($"Row {index}: Category '{dto.CategorySlug}' not found");
                    failed++;
                    continue;
                }
            }

            if (!options.DryRun)
            {
                var question = Question.Create(dto.QuestionText, dto.Difficulty,
                    dto.Role, categoryId, dto.Title);

                _db.Questions.Add(question);
                await _db.SaveChangesAsync(ct);

                if (!string.IsNullOrWhiteSpace(dto.AnswerMarkdown))
                {
                    var answer = Answer.Create(question.Id, dto.AnswerMarkdown);
                    _db.Answers.Add(answer);
                    await _db.SaveChangesAsync(ct);
                }
            }

            imported++;
        }

        _logger.LogInformation("Seeder complete: {Imported} imported, {Skipped} skipped, {Failed} failed",
            imported, skipped, failed);

        return new SeederResult
        {
            Imported = imported,
            Skipped = skipped,
            Failed = failed,
            Errors = errors,
            Warnings = warnings,
            IsDryRun = options.DryRun
        };
    }

    private async Task<IReadOnlyList<ImportQuestionDto>> ParseSourceAsync(
        SeederOptions options, CancellationToken ct)
    {
        if (options.JsonContent is not null)
            return ParseJson(options.JsonContent);

        if (options.FilePath is not null)
        {
            var ext = Path.GetExtension(options.FilePath).ToLowerInvariant();
            return ext switch
            {
                ".json" => ParseJson(await File.ReadAllTextAsync(options.FilePath, ct)),
                ".csv"  => ParseCsv(await File.ReadAllTextAsync(options.FilePath, ct)),
                _ => throw new NotSupportedException($"Unsupported file format: {ext}")
            };
        }

        throw new InvalidOperationException("No seeder source provided.");
    }

    private static IReadOnlyList<ImportQuestionDto> ParseJson(string json)
    {
        var doc = JsonSerializer.Deserialize<SeederDocument>(json,
            new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
        return doc?.Questions ?? [];
    }

    private static IReadOnlyList<ImportQuestionDto> ParseCsv(string csv)
    {
        var lines = csv.Split('\n', StringSplitOptions.RemoveEmptyEntries);
        // Skip header. Parse each line into ImportQuestionDto.
        return lines.Skip(1)
            .Select(ParseCsvLine)
            .Where(dto => dto is not null)
            .Select(dto => dto!)
            .ToList();
    }

    private static ImportQuestionDto? ParseCsvLine(string line)
    {
        // Production: use CsvHelper library for robust CSV parsing
        var parts = line.Split(',');
        if (parts.Length < 4) return null;
        return new ImportQuestionDto
        {
            Title           = parts[0].Trim('"'),
            QuestionText    = parts[1].Trim('"'),
            Difficulty      = Enum.Parse<Difficulty>(parts[2].Trim('"'), true),
            Role            = parts[3].Trim('"'),
            CategorySlug    = parts.Length > 4 ? parts[4].Trim('"') : "general",
            AnswerMarkdown  = parts.Length > 5 ? parts[5].Trim('"') : null
        };
    }
}
```

### 5.7 Legacy Seeder Preservation

```csharp
// Infrastructure/Seeders/LegacySeederService.cs
// Original Excel-based seeder — unchanged. Wrapped in ISeederService.
public class LegacySeederService : ISeederService
{
    private readonly IExcelExtractor _excelExtractor;
    private readonly ApplicationDbContext _db;

    public LegacySeederService(IExcelExtractor excelExtractor, ApplicationDbContext db)
    {
        _excelExtractor = excelExtractor;
        _db = db;
    }

    public async Task<SeederResult> SeedAsync(SeederOptions options, CancellationToken ct = default)
    {
        // Delegates to existing Excel extraction logic — no changes to old code.
        if (options.FilePath is null)
            throw new InvalidOperationException("Legacy seeder requires a file path.");

        var questions = _excelExtractor.Extract(options.FilePath);
        // ... existing import logic ...
        return new SeederResult { Imported = questions.Count };
    }
}
```

### 5.8 DI Registration

```csharp
// Program.cs
builder.Services.AddScoped<LegacySeederService>();
builder.Services.AddScoped<AdvancedSeederService>();
builder.Services.AddScoped<SeederFactory>();
```

---

## 6. API Design

### 6.1 Admin Questions API

```
Base route: /api/admin/questions
Auth:       [Authorize(Roles = "Admin,Editor")]
```

| Method | Endpoint | Body / Params | Response | Description |
|---|---|---|---|---|
| `GET` | `/api/admin/questions` | `?page&size&q&difficulty&role&categoryId&status&deleted` | `PagedResult<QuestionAdminDto>` | List with full filters incl. soft-deleted |
| `GET` | `/api/admin/questions/{id}` | — | `QuestionAdminDto` | Single question detail |
| `POST` | `/api/admin/questions` | `CreateQuestionDto` | `QuestionAdminDto` | Create question |
| `PUT` | `/api/admin/questions/{id}` | `UpdateQuestionDto` | `QuestionAdminDto` | Update question (auto-versions) |
| `DELETE` | `/api/admin/questions/{id}` | — | `204 No Content` | Soft-delete |
| `POST` | `/api/admin/questions/{id}/restore` | — | `QuestionAdminDto` | Restore soft-deleted |
| `GET` | `/api/admin/questions/{id}/versions` | — | `QuestionVersion[]` | Version history |
| `POST` | `/api/admin/questions/{id}/publish` | — | `QuestionAdminDto` | Publish a draft |

### 6.2 Import API

```
Base route: /api/admin/import
Auth:       [Authorize(Roles = "Admin")]
```

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/admin/import` | Multipart upload (CSV or JSON file). Returns `SeederResult`. |
| `POST` | `/api/admin/import/validate` | Dry-run: validates file and returns preview without writing to DB. |
| `POST` | `/api/admin/import/json` | Raw JSON body import (application/json). |

**Import Request (multipart/form-data):**
```
file:              <binary>
defaultCategoryId: 5
seederType:        Advanced
dryRun:            false
skipInvalid:       true
overwriteExisting: false
```

**Import Response:**
```json
{
  "imported": 18,
  "skipped": 2,
  "failed": 0,
  "isDryRun": false,
  "errors": [],
  "warnings": [
    "Row 3: Missing difficulty field — used default (Easy)",
    "Row 7: Category 'devops' not found — used default category"
  ]
}
```

### 6.3 Dashboard API

```
GET /api/admin/dashboard
Auth: [Authorize(Roles = "Admin,Editor")]
```

```json
{
  "totalQuestions": 540,
  "publishedQuestions": 490,
  "draftQuestions": 35,
  "deletedQuestions": 15,
  "totalUsers": 1240,
  "totalCategories": 12,
  "countByDifficulty": {
    "easy": 220,
    "medium": 180,
    "hard": 90
  },
  "recentActivity": [
    {
      "timestamp": "2026-03-20T18:42:00Z",
      "userEmail": "admin@interviewprep.com",
      "action": "EDITED",
      "entityType": "Question",
      "entityId": "42"
    }
  ]
}
```

### 6.4 Categories API

```
Base route: /api/admin/categories
Auth:       [Authorize(Roles = "Admin")]
```

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/admin/categories` | Full hierarchical tree |
| `POST` | `/api/admin/categories` | Create category (with optional parentId) |
| `PUT` | `/api/admin/categories/{id}` | Rename / re-parent |
| `DELETE` | `/api/admin/categories/{id}` | Delete (blocked if questions exist) |

### 6.5 Users API

```
Base route: /api/admin/users
Auth:       [Authorize(Roles = "Admin")]
```

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/admin/users` | Paginated user list |
| `GET` | `/api/admin/users/{id}` | User detail with roles |
| `POST` | `/api/admin/users/{id}/roles` | Assign role |
| `DELETE` | `/api/admin/users/{id}/roles/{role}` | Remove role |
| `POST` | `/api/admin/users/{id}/suspend` | Disable user account |

### 6.6 Audit Logs

```
GET /api/admin/audit-logs?userId=&action=&entityType=&from=&to=&page=&size=
Auth: [Authorize(Roles = "Admin")]
```

### 6.7 Controller Example

```csharp
// Api/Controllers/Admin/AdminQuestionsController.cs
[ApiController]
[Route("api/admin/questions")]
[Authorize(Roles = "Admin,Editor")]
public class AdminQuestionsController : ControllerBase
{
    private readonly IQuestionRepository _questions;
    private readonly IAuditLogService _audit;

    public AdminQuestionsController(IQuestionRepository questions, IAuditLogService audit)
    {
        _questions = questions;
        _audit = audit;
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateQuestionDto dto,
        IValidator<CreateQuestionDto> validator, CancellationToken ct)
    {
        var validation = await validator.ValidateAsync(dto, ct);
        if (!validation.IsValid)
            return ValidationProblem(validation.ToDictionary());

        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var question = Question.Create(dto.QuestionText, dto.Difficulty,
            dto.Role, dto.CategoryId, dto.Title, userId);

        await _questions.AddAsync(question, ct);

        if (!string.IsNullOrWhiteSpace(dto.AnswerMarkdown))
        {
            var answer = Answer.Create(question.Id, dto.AnswerMarkdown, userId);
            question.SetAnswer(answer);
            await _questions.UpdateAsync(question, ct);
        }

        await _audit.LogAsync("CREATED", "Question", question.Id.ToString(),
            newValues: JsonSerializer.Serialize(question), ct: ct);

        return CreatedAtAction(nameof(GetById), new { id = question.Id },
            question.ToAdminDto());
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id, CancellationToken ct)
    {
        var question = await _questions.GetByIdAsync(id, ct);
        if (question is null) return NotFound();

        var snapshot = JsonSerializer.Serialize(question);
        question.SoftDelete();
        await _questions.UpdateAsync(question, ct);

        await _audit.LogAsync("DELETED", "Question", id.ToString(), oldValues: snapshot, ct: ct);
        return NoContent();
    }
}
```

---

## 7. Role-Based Access Control (RBAC)

### 7.1 Roles

| Role | Description |
|---|---|
| `Admin` | Full access to all admin features including user management and destructive actions |
| `Editor` | Can create and edit questions and answers; cannot manage users, categories, or import |
| `User` | Standard authenticated user — no admin access |

### 7.2 Policy Configuration

```csharp
// Program.cs
builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("AdminOnly", p => p.RequireRole("Admin"));
    options.AddPolicy("AdminOrEditor", p => p.RequireRole("Admin", "Editor"));
    options.AddPolicy("ContentWrite", p =>
        p.RequireRole("Admin", "Editor")
         .RequireClaim("email_confirmed", "true"));
});
```

### 7.3 Controller-Level Enforcement

```csharp
[Authorize(Policy = "AdminOnly")]         // Admin exclusive endpoints
[Authorize(Policy = "AdminOrEditor")]     // Shared content endpoints
[AllowAnonymous]                          // Never used in Admin controllers
```

---

## 8. Markdown Support for Answers

### 8.1 Storage Strategy

- Answers are stored as **raw Markdown** (`NVARCHAR(MAX)`) in the `Answers` table.
- The API returns raw markdown in `answerMarkdown` field.
- The frontend is responsible for rendering — **never store pre-rendered HTML** in the DB.
- This keeps the DB portable and the rendering engine swappable.

### 8.2 Backend DTO

```csharp
public record QuestionAdminDto
{
    public int Id { get; init; }
    public string? Title { get; init; }
    public string QuestionText { get; init; } = default!;
    public string Difficulty { get; init; } = default!;
    public string Role { get; init; } = default!;
    public int CategoryId { get; init; }
    public string CategoryName { get; init; } = default!;
    public string Status { get; init; } = default!;
    public bool IsDeleted { get; init; }
    public string? AnswerMarkdown { get; init; }    // ← Raw .md content
    public DateTime CreatedAt { get; init; }
    public DateTime? UpdatedAt { get; init; }
}
```

### 8.3 Angular Frontend Rendering

Install `ngx-markdown`:
```bash
npm install ngx-markdown marked
```

Usage in question editor:
```html
<!-- Split-pane: Editor on left, Preview on right -->
<div class="grid grid-cols-2 gap-4">
  <textarea class="input-dark font-mono text-sm h-64"
    [(ngModel)]="answerMarkdown"
    placeholder="Write your answer in Markdown..."></textarea>

  <div class="glass-panel p-4 prose prose-invert text-sm overflow-y-auto h-64">
    <markdown [data]="answerMarkdown"></markdown>
  </div>
</div>
```

### 8.4 Supported Markdown Features

```markdown
## Headings (H2, H3 only — H1 reserved for question title)
**Bold text** and *italic*
- Bullet lists
1. Numbered lists
`inline code`
```javascript
// Code blocks with syntax highlighting
const fn = () => "Hello";
```
> Blockquotes for important notes
[Links](https://example.com)
```

---

## 9. Best Practices & Scaling Strategy

### 9.1 Validation (FluentValidation)

```csharp
// Application/Validators/CreateQuestionValidator.cs
public class CreateQuestionValidator : AbstractValidator<CreateQuestionDto>
{
    public CreateQuestionValidator()
    {
        RuleFor(x => x.QuestionText)
            .NotEmpty().WithMessage("Question text is required.")
            .MinimumLength(10).WithMessage("Question must be at least 10 characters.")
            .MaximumLength(5000);

        RuleFor(x => x.Difficulty)
            .IsInEnum().WithMessage("Difficulty must be Easy, Medium, or Hard.");

        RuleFor(x => x.Role)
            .NotEmpty().MaximumLength(100);

        RuleFor(x => x.CategoryId)
            .GreaterThan(0).WithMessage("A valid category must be selected.");

        RuleFor(x => x.AnswerMarkdown)
            .MaximumLength(50_000)
            .When(x => x.AnswerMarkdown is not null);
    }
}
```

### 9.2 Logging (Serilog)

```csharp
// Program.cs
builder.Host.UseSerilog((ctx, config) =>
{
    config
        .ReadFrom.Configuration(ctx.Configuration)
        .Enrich.FromLogContext()
        .Enrich.WithMachineName()
        .WriteTo.Console(outputTemplate:
            "[{Timestamp:HH:mm:ss} {Level:u3}] {Message:lj} {Properties:j}{NewLine}{Exception}")
        .WriteTo.File("logs/admin-.log", rollingInterval: RollingInterval.Day,
            restrictedToMinimumLevel: LogEventLevel.Warning);
});
```

### 9.3 Caching Strategy

```csharp
// Only cache read-heavy, rarely-changing data
services.AddMemoryCache();

// In CategoryService — cache the tree for 5 minutes
public async Task<IReadOnlyList<CategoryTreeDto>> GetTreeAsync()
{
    if (_cache.TryGetValue("category_tree", out IReadOnlyList<CategoryTreeDto>? cached))
        return cached!;

    var tree = await _db.Categories
        .AsNoTracking()
        .Where(c => c.ParentId == null)
        .Include(c => c.SubCategories)
        .ToListAsync();

    var dto = tree.Select(c => c.ToTreeDto()).ToList();
    _cache.Set("category_tree", dto, TimeSpan.FromMinutes(5));
    return dto;
}

// Bust cache on any category mutation
public async Task InvalidateCategoryCacheAsync()
    => _cache.Remove("category_tree");
```

### 9.4 Rate Limiting

```csharp
// Program.cs (.NET 7+)
builder.Services.AddRateLimiter(options =>
{
    options.AddFixedWindowLimiter("admin_import", cfg =>
    {
        cfg.Window = TimeSpan.FromMinutes(1);
        cfg.PermitLimit = 5;                // Max 5 imports per minute per user
        cfg.QueueLimit = 0;
        cfg.QueueProcessingOrder = QueueProcessingOrder.OldestFirst;
    });

    options.AddFixedWindowLimiter("admin_write", cfg =>
    {
        cfg.Window = TimeSpan.FromMinutes(1);
        cfg.PermitLimit = 100;              // 100 write ops per minute
    });

    options.RejectionStatusCode = 429;
});

// Apply on controllers
[EnableRateLimiting("admin_import")]
[HttpPost("api/admin/import")]
public async Task<IActionResult> Import(...) { ... }
```

### 9.5 Pagination

All list endpoints return a standard `PagedResult<T>`:

```csharp
public record PagedResult<T>
{
    public IReadOnlyList<T> Data { get; init; } = [];
    public int TotalRecords { get; init; }
    public int PageNumber { get; init; }
    public int PageSize { get; init; }
    public int TotalPages => (int)Math.Ceiling((double)TotalRecords / PageSize);
    public bool HasNextPage => PageNumber < TotalPages;
    public bool HasPreviousPage => PageNumber > 1;
}
```

Default page size: **20**. Max page size: **100** (enforced server-side).

### 9.6 Soft Delete + Restore Pattern

```csharp
// Always apply global query filter in EfCore config:
builder.HasQueryFilter(q => !q.IsDeleted);

// To access deleted items, use IgnoreQueryFilters():
var deletedQuestions = await _db.Questions
    .IgnoreQueryFilters()
    .Where(q => q.IsDeleted)
    .ToListAsync();
```

### 9.7 Question Versioning

Every `PUT /admin/questions/{id}` call automatically creates a version snapshot before applying changes:

```csharp
public async Task UpdateWithVersionAsync(Question question,
    UpdateQuestionDto dto, string editorUserId)
{
    // 1. Snapshot current state
    var versionNumber = await _db.QuestionVersions
        .Where(v => v.QuestionId == question.Id)
        .MaxAsync(v => (int?)v.VersionNumber) ?? 0 + 1;

    var version = new QuestionVersion
    {
        QuestionId       = question.Id,
        VersionNumber    = versionNumber,
        QuestionSnapshot = JsonSerializer.Serialize(question),
        AnswerSnapshot   = JsonSerializer.Serialize(question.Answer),
        EditedByUserId   = editorUserId,
        CreatedAt        = DateTime.UtcNow
    };
    _db.QuestionVersions.Add(version);

    // 2. Apply update
    question.Update(dto.Title, dto.QuestionText, dto.Difficulty, dto.Role, dto.CategoryId);

    await _db.SaveChangesAsync();
}
```

### 9.8 Scaling Checklist

| Concern | Solution |
|---|---|
| Large question tables | Add SQL Server full-text search index on `QuestionText` |
| High read load | Redis distributed cache for category tree + question counts |
| Concurrent imports | Background job queue (Hangfire / Azure Queue Storage) |
| Audit log growth | Partition `AuditLogs` table by month; archive records > 1 year |
| Multi-tenant future | Add `TenantId` column to Questions + Categories + global filter |
| CDN for images | S3 / Azure Blob for answer images; embed URLs in markdown |
| API versioning | Route prefix `/api/v1/admin/...` from day 1 |

---

## Appendix A — Running Seeders via CLI

```bash
# Seed using the new Advanced Seeder with JSON file
dotnet run --project InterviewPrepApp.Api -- \
    --seed \
    --seeder-type Advanced \
    --seed-file ./seeds/questions.json \
    --dry-run false

# Validate CSV without importing (dry-run)
dotnet run --project InterviewPrepApp.Api -- \
    --seed \
    --seeder-type Advanced \
    --seed-file ./seeds/questions.csv \
    --dry-run true
```

## Appendix B — Sample Import JSON

```json
{
  "version": "1.0",
  "defaultCategorySlug": "backend",
  "questions": [
    {
      "title": "Explain REST vs GraphQL",
      "questionText": "What are the key differences between REST APIs and GraphQL? When would you choose one over the other?",
      "difficulty": "Easy",
      "role": "Backend",
      "categorySlug": "backend",
      "answer": {
        "markdown": "## REST vs GraphQL\n\n**REST** uses fixed endpoints per resource:\n```http\nGET /api/users/1\nGET /api/users/1/posts\n```\n\n**GraphQL** uses a single endpoint with typed queries:\n```graphql\nquery {\n  user(id: 1) {\n    name\n    posts { title }\n  }\n}\n```\n\n### When to use REST:\n- Simple, well-defined resources\n- Public APIs\n- Strong caching requirements\n\n### When to use GraphQL:\n- Complex, nested data requirements\n- Mobile clients (reduce over-fetching)\n- Rapidly evolving schemas"
      }
    },
    {
      "title": "What is CQRS?",
      "questionText": "Describe the CQRS design pattern and explain a scenario where it provides value.",
      "difficulty": "Hard",
      "role": "Backend",
      "categorySlug": "dotnet",
      "answer": {
        "markdown": "## CQRS — Command Query Responsibility Segregation\n\nCQRS separates the **read model** (Queries) from the **write model** (Commands).\n\n```csharp\n// Command\npublic record CreateQuestionCommand(string Text, Difficulty Level) : ICommand;\n\n// Query\npublic record GetQuestionsQuery(int Page, int Size) : IQuery<PagedResult<QuestionDto>>;\n```\n\n### Key Benefits:\n- Independent scaling of reads and writes\n- Optimized read models (denormalized views)\n- Cleaner separation of concerns"
      }
    }
  ]
}
```

---

*This document is a living design reference. Update it as the platform evolves.*

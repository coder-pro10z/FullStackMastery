using InterviewPrepApp.Domain.Enums;

namespace InterviewPrepApp.Application.DTOs.Admin;

// ── Request DTOs ───────────────────────────────────────────────────────────────

public class CreateQuestionDto
{
    public string? Title { get; set; }
    public string QuestionText { get; set; } = string.Empty;
    public string? AnswerMarkdown { get; set; }
    public Difficulty Difficulty { get; set; }
    public string Role { get; set; } = string.Empty;
    public int CategoryId { get; set; }
    public QuestionStatus Status { get; set; } = QuestionStatus.Published;
}

public class UpdateQuestionDto
{
    public string? Title { get; set; }
    public string QuestionText { get; set; } = string.Empty;
    public string? AnswerMarkdown { get; set; }
    public Difficulty Difficulty { get; set; }
    public string Role { get; set; } = string.Empty;
    public int CategoryId { get; set; }
    public QuestionStatus Status { get; set; }
}

// ── Response DTOs ──────────────────────────────────────────────────────────────

public class QuestionAdminDto
{
    public int Id { get; set; }
    public string? Title { get; set; }
    public string QuestionText { get; set; } = string.Empty;
    public string? AnswerMarkdown { get; set; }
    public string Difficulty { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
    public int CategoryId { get; set; }
    public string CategoryName { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public bool IsDeleted { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public string? CreatedByUserId { get; set; }
}

public class QuestionVersionDto
{
    public int Id { get; set; }
    public int VersionNumber { get; set; }
    public string QuestionSnapshot { get; set; } = string.Empty;
    public string? AnswerSnapshot { get; set; }
    public string? EditedByUserId { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class DashboardStatsDto
{
    public int TotalQuestions { get; set; }
    public int PublishedQuestions { get; set; }
    public int DraftQuestions { get; set; }
    public int DeletedQuestions { get; set; }
    public int TotalCategories { get; set; }
    public int TotalUsers { get; set; }
    public DifficultyBreakdownDto CountByDifficulty { get; set; } = new();
    public IReadOnlyList<AuditLogDto> RecentActivity { get; set; } = [];
}

public class DifficultyBreakdownDto
{
    public int Easy { get; set; }
    public int Medium { get; set; }
    public int Hard { get; set; }
}

public class AuditLogDto
{
    public long Id { get; set; }
    public string UserEmail { get; set; } = string.Empty;
    public string Action { get; set; } = string.Empty;
    public string EntityType { get; set; } = string.Empty;
    public string? EntityId { get; set; }
    public string? OldValues { get; set; }
    public string? NewValues { get; set; }
    public DateTime Timestamp { get; set; }
}

public class BulkImportResultDto
{
    public int Imported { get; set; }
    public int Skipped { get; set; }
    public int Failed { get; set; }
    public bool IsDryRun { get; set; }
    public List<string> Errors { get; set; } = [];
    public List<string> Warnings { get; set; } = [];
}

public class ImportQuestionRowDto
{
    public string? Title { get; set; }
    public string QuestionText { get; set; } = string.Empty;
    public string? AnswerMarkdown { get; set; }
    public string Difficulty { get; set; } = "Medium";
    public string Role { get; set; } = string.Empty;
    public string CategorySlug { get; set; } = string.Empty;
}

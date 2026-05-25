namespace InterviewPrepApp.Application.DTOs;

using InterviewPrepApp.Domain.Enums;

// ─── Import Row DTOs (parsed from Excel) ─────────────────────────────────────

public class ImportQuizRowDto
{
    public string? ExternalId { get; set; }
    public string QuestionText { get; set; } = string.Empty;
    public string OptionA { get; set; } = string.Empty;
    public string OptionB { get; set; } = string.Empty;
    public string OptionC { get; set; } = string.Empty;
    public string OptionD { get; set; } = string.Empty;
    public string CorrectAnswer { get; set; } = string.Empty;
    public string? Explanation { get; set; }
    public string? Category { get; set; }
    public string? Difficulty { get; set; }
    public string? Role { get; set; }
    public string? Tags { get; set; }
}

public class ImportStudyGuideRowDto
{
    public string? ExternalId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public string? Category { get; set; }
    public string? Role { get; set; }
    public string? Tags { get; set; }
    public int DisplayOrder { get; set; }
}

// ─── Job Status DTO ──────────────────────────────────────────────────────────

public class ImportJobStatusDto
{
    public Guid JobId { get; set; }
    public string Type { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public string FileName { get; set; } = string.Empty;
    public DateTime UploadedAtUtc { get; set; }
    public DateTime? CompletedAtUtc { get; set; }
    public int TotalRows { get; set; }
    public int ProcessedRows { get; set; }
    public int FailedRows { get; set; }
    public List<RowImportErrorDto>? Errors { get; set; }
}

public class RowImportErrorDto
{
    public int Row { get; set; }
    public string? Column { get; set; }
    public string Message { get; set; } = string.Empty;
    public string? ExternalId { get; set; }
}

// ─── Quiz Question response DTO ───────────────────────────────────────────────

public class QuizQuestionDto
{
    public int Id { get; set; }
    public string ExternalId { get; set; } = string.Empty;
    public string QuestionText { get; set; } = string.Empty;
    public string OptionA { get; set; } = string.Empty;
    public string OptionB { get; set; } = string.Empty;
    public string OptionC { get; set; } = string.Empty;
    public string OptionD { get; set; } = string.Empty;
    public string? Explanation { get; set; }
    public string? Role { get; set; }
    public string? Tags { get; set; }
    public string Difficulty { get; set; } = string.Empty;
    public int? CategoryId { get; set; }
    public string? CategoryName { get; set; }
}

// ─── Study Guide response DTO ────────────────────────────────────────────────

public class StudyGuideSectionDto
{
    public int Id { get; set; }
    public string ExternalId { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string ContentMarkdown { get; set; } = string.Empty;
    public string? Role { get; set; }
    public string? Tags { get; set; }
    public int DisplayOrder { get; set; }
    public int? CategoryId { get; set; }
    public string? CategoryName { get; set; }
}

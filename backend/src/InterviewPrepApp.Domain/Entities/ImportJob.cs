namespace InterviewPrepApp.Domain.Entities;

using InterviewPrepApp.Domain.Enums;

/// <summary>
/// Tracks the lifecycle of an async import job (Quiz, StudyGuide, Question).
/// </summary>
public class ImportJob
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public ImportJobType Type { get; set; }
    public ImportJobStatus Status { get; set; } = ImportJobStatus.Queued;

    public string FileName { get; set; } = string.Empty;
    public long FileSizeBytes { get; set; }
    public string TempFilePath { get; set; } = string.Empty;

    public string UploadedByUserId { get; set; } = string.Empty;
    public DateTime UploadedAtUtc { get; set; } = DateTime.UtcNow;
    public DateTime? StartedAtUtc { get; set; }
    public DateTime? CompletedAtUtc { get; set; }

    public int TotalRows { get; set; }
    public int ProcessedRows { get; set; }
    public int FailedRows { get; set; }

    /// <summary>JSON-serialized list of RowImportError</summary>
    public string? ErrorSummaryJson { get; set; }

    /// <summary>JSON-serialized list of ExternalIds that failed — used for retry</summary>
    public string? RetryPayloadJson { get; set; }

    public int LastProcessedBatch { get; set; }
    public int? DefaultCategoryId { get; set; }
}

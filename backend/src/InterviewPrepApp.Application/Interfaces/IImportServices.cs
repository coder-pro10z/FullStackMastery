using InterviewPrepApp.Application.DTOs;

namespace InterviewPrepApp.Application.Interfaces;

public interface IQuizImportService
{
    /// <summary>
    /// Enqueue an import job for a Quiz Excel file. Returns the job ID immediately.
    /// </summary>
    Task<ImportJobStatusDto> EnqueueAsync(Stream fileStream, string fileName, long fileSizeBytes, int? defaultCategoryId, string userId, CancellationToken ct = default);
}

public interface IStudyGuideImportService
{
    /// <summary>
    /// Enqueue an import job for a Study Guide Excel file. Returns the job ID immediately.
    /// </summary>
    Task<ImportJobStatusDto> EnqueueAsync(Stream fileStream, string fileName, long fileSizeBytes, int? defaultCategoryId, string userId, CancellationToken ct = default);
}

public interface IImportJobService
{
    Task<ImportJobStatusDto?> GetStatusAsync(Guid jobId, CancellationToken ct = default);
    Task<List<RowImportErrorDto>> GetErrorsAsync(Guid jobId, CancellationToken ct = default);
    Task<ImportJobStatusDto?> RetryAsync(Guid jobId, CancellationToken ct = default);
}

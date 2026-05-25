using InterviewPrepApp.Application.DTOs;
using InterviewPrepApp.Application.Interfaces;
using InterviewPrepApp.Domain.Entities;
using InterviewPrepApp.Domain.Enums;
using InterviewPrepApp.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;

namespace InterviewPrepApp.Infrastructure.Services;

public class ImportJobService : IImportJobService
{
    private readonly ApplicationDbContext _db;

    public ImportJobService(ApplicationDbContext db) => _db = db;

    public async Task<ImportJobStatusDto?> GetStatusAsync(Guid jobId, CancellationToken ct = default)
    {
        var job = await _db.ImportJobs.AsNoTracking()
            .FirstOrDefaultAsync(j => j.Id == jobId, ct);
        if (job == null) return null;

        return MapToStatusDto(job);
    }

    public async Task<List<RowImportErrorDto>> GetErrorsAsync(Guid jobId, CancellationToken ct = default)
    {
        var job = await _db.ImportJobs.AsNoTracking()
            .FirstOrDefaultAsync(j => j.Id == jobId, ct);
        if (job?.ErrorSummaryJson == null) return [];

        return JsonSerializer.Deserialize<List<RowImportErrorDto>>(job.ErrorSummaryJson) ?? [];
    }

    public async Task<ImportJobStatusDto?> RetryAsync(Guid jobId, CancellationToken ct = default)
    {
        var job = await _db.ImportJobs.FirstOrDefaultAsync(j => j.Id == jobId, ct);
        if (job == null || job.Status == ImportJobStatus.InProgress) return null;

        // Only re-queue if there were failures
        if (job.FailedRows == 0) return MapToStatusDto(job);

        job.Status = ImportJobStatus.Queued;
        job.StartedAtUtc = null;
        job.CompletedAtUtc = null;
        job.ProcessedRows = 0;
        job.FailedRows = 0;
        job.LastProcessedBatch = 0;
        job.ErrorSummaryJson = null;
        await _db.SaveChangesAsync(ct);

        return MapToStatusDto(job);
    }

    private static ImportJobStatusDto MapToStatusDto(ImportJob job) => new()
    {
        JobId = job.Id,
        Type = job.Type.ToString(),
        Status = job.Status.ToString(),
        FileName = job.FileName,
        UploadedAtUtc = job.UploadedAtUtc,
        CompletedAtUtc = job.CompletedAtUtc,
        TotalRows = job.TotalRows,
        ProcessedRows = job.ProcessedRows,
        FailedRows = job.FailedRows
    };
}

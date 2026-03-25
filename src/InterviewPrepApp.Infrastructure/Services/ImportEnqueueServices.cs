using InterviewPrepApp.Application.DTOs;
using InterviewPrepApp.Application.Interfaces;
using InterviewPrepApp.Domain.Entities;
using InterviewPrepApp.Domain.Enums;
using InterviewPrepApp.Infrastructure.Persistence;
using System.Text.Json;
using System.Threading.Channels;

namespace InterviewPrepApp.Infrastructure.Services;

/// <summary>
/// Enqueues quiz import jobs — saves the file to disk, creates an ImportJob row, 
/// then publishes to the background channel. Returns immediately.
/// </summary>
public class QuizImportService : IQuizImportService
{
    private readonly ApplicationDbContext _db;
    private readonly ChannelWriter<Guid> _channel;

    public QuizImportService(ApplicationDbContext db, ChannelWriter<Guid> channel)
    {
        _db = db;
        _channel = channel;
    }

    public async Task<ImportJobStatusDto> EnqueueAsync(Stream fileStream, string fileName, long fileSizeBytes, int? defaultCategoryId, string userId, CancellationToken ct = default)
    {
        var tempPath = Path.Combine(Path.GetTempPath(), $"import_quiz_{Guid.NewGuid()}.xlsx");
        await using (var fs = File.Create(tempPath))
            await fileStream.CopyToAsync(fs, ct);

        var job = new ImportJob
        {
            Type = ImportJobType.Quiz,
            Status = ImportJobStatus.Queued,
            FileName = Path.GetFileName(fileName),
            FileSizeBytes = fileSizeBytes,
            TempFilePath = tempPath,
            UploadedByUserId = userId,
            DefaultCategoryId = defaultCategoryId
        };

        _db.ImportJobs.Add(job);
        await _db.SaveChangesAsync(ct);

        await _channel.WriteAsync(job.Id, ct);

        return new ImportJobStatusDto
        {
            JobId = job.Id,
            Type = job.Type.ToString(),
            Status = job.Status.ToString(),
            FileName = job.FileName,
            UploadedAtUtc = job.UploadedAtUtc
        };
    }
}

/// <summary>
/// Enqueues study guide import jobs.
/// </summary>
public class StudyGuideImportService : IStudyGuideImportService
{
    private readonly ApplicationDbContext _db;
    private readonly ChannelWriter<Guid> _channel;

    public StudyGuideImportService(ApplicationDbContext db, ChannelWriter<Guid> channel)
    {
        _db = db;
        _channel = channel;
    }

    public async Task<ImportJobStatusDto> EnqueueAsync(Stream fileStream, string fileName, long fileSizeBytes, int? defaultCategoryId, string userId, CancellationToken ct = default)
    {
        var tempPath = Path.Combine(Path.GetTempPath(), $"import_guide_{Guid.NewGuid()}.xlsx");
        await using (var fs = File.Create(tempPath))
            await fileStream.CopyToAsync(fs, ct);

        var job = new ImportJob
        {
            Type = ImportJobType.StudyGuide,
            Status = ImportJobStatus.Queued,
            FileName = Path.GetFileName(fileName),
            FileSizeBytes = fileSizeBytes,
            TempFilePath = tempPath,
            UploadedByUserId = userId,
            DefaultCategoryId = defaultCategoryId
        };

        _db.ImportJobs.Add(job);
        await _db.SaveChangesAsync(ct);

        await _channel.WriteAsync(job.Id, ct);

        return new ImportJobStatusDto
        {
            JobId = job.Id,
            Type = job.Type.ToString(),
            Status = job.Status.ToString(),
            FileName = job.FileName,
            UploadedAtUtc = job.UploadedAtUtc
        };
    }
}

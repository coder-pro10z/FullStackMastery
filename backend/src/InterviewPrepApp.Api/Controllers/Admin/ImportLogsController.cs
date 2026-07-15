using InterviewPrepApp.Application.DTOs.Admin;
using InterviewPrepApp.Application.Interfaces;
using InterviewPrepApp.Domain.Entities;
using InterviewPrepApp.Domain.Enums;
using InterviewPrepApp.Infrastructure.Persistence;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace InterviewPrepApp.Api.Controllers.Admin;

[Authorize(Roles = "Admin")]
[ApiController]
[Route("api/admin/import-logs")]
public class ImportLogsController : ControllerBase
{
    private readonly ApplicationDbContext _db;

    public ImportLogsController(ApplicationDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<ActionResult<PagedAdminResult<ImportLogDto>>> GetImportLogs(
        [FromQuery] string? type = null,
        [FromQuery] string? status = null,
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 20,
        CancellationToken ct = default)
    {
        var query = _db.ImportLogs.AsNoTracking();

        if (!string.IsNullOrWhiteSpace(type) && Enum.TryParse<ImportJobType>(type, true, out var parsedType))
        {
            query = query.Where(l => l.Type == parsedType);
        }

        if (!string.IsNullOrWhiteSpace(status) && Enum.TryParse<ImportLogStatus>(status, true, out var parsedStatus))
        {
            query = query.Where(l => l.Status == parsedStatus);
        }

        var total = await query.CountAsync(ct);

        var data = await query
            .OrderByDescending(l => l.StartedAt)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(ct);

        var dtoList = data.Select(l => new ImportLogDto
        {
            Id = l.Id,
            Type = l.Type.ToString(),
            FileName = l.FileName,
            IsDryRun = l.IsDryRun,
            Status = l.Status.ToString(),
            TotalRows = l.TotalRows,
            Inserted = l.Inserted,
            Updated = l.Updated,
            Skipped = l.Skipped,
            Warned = l.Warned,
            Failed = l.Failed,
            OrphanedQuestionIdsJson = l.OrphanedQuestionIdsJson,
            FieldChangeSummaryJson = l.FieldChangeSummaryJson,
            ContentCompletenessSummaryJson = l.ContentCompletenessSummaryJson,
            MissingFieldsPerAnswerJson = l.MissingFieldsPerAnswerJson,
            ErrorSummaryJson = l.ErrorSummaryJson,
            WarningSummaryJson = l.WarningSummaryJson,
            ImportedByEmail = l.ImportedByEmail,
            StartedAt = l.StartedAt,
            CompletedAt = l.CompletedAt
        }).ToList();

        return Ok(new PagedAdminResult<ImportLogDto>
        {
            Data = dtoList,
            TotalRecords = total,
            PageNumber = pageNumber,
            PageSize = pageSize
        });
    }
}

public class ImportLogDto
{
    public int Id { get; set; }
    public string Type { get; set; } = string.Empty;
    public string FileName { get; set; } = string.Empty;
    public bool IsDryRun { get; set; }
    public string Status { get; set; } = string.Empty;
    public int TotalRows { get; set; }
    public int Inserted { get; set; }
    public int Updated { get; set; }
    public int Skipped { get; set; }
    public int Warned { get; set; }
    public int Failed { get; set; }
    public string? OrphanedQuestionIdsJson { get; set; }
    public string? FieldChangeSummaryJson { get; set; }
    public string? ContentCompletenessSummaryJson { get; set; }
    public string? MissingFieldsPerAnswerJson { get; set; }
    public string? ErrorSummaryJson { get; set; }
    public string? WarningSummaryJson { get; set; }
    public string ImportedByEmail { get; set; } = string.Empty;
    public DateTime StartedAt { get; set; }
    public DateTime? CompletedAt { get; set; }
}

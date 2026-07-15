using InterviewPrepApp.Application.DTOs.Admin;
using InterviewPrepApp.Application.Interfaces;
using InterviewPrepApp.Infrastructure.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace InterviewPrepApp.Api.Controllers.Admin;

[Authorize(Roles = "Admin")]
[ApiController]
[Route("api/admin/import/answers")]
public class AdminAnswerImportController : ControllerBase
{
    private readonly IAdminAnswerImportService _importService;
    private readonly IAnswerExtractionService _extractionService;

    public AdminAnswerImportController(
        IAdminAnswerImportService importService, 
        IAnswerExtractionService extractionService)
    {
        _importService = importService;
        _extractionService = extractionService;
    }

    [HttpPost]
    public async Task<IActionResult> ImportAnswers(
        IFormFile file,
        [FromQuery] bool dryRun = true,
        CancellationToken ct = default)
    {
        if (file == null || file.Length == 0)
            return BadRequest("No file uploaded.");

        if (!file.FileName.EndsWith(".json", StringComparison.OrdinalIgnoreCase))
            return BadRequest("Only .json files are supported for answer imports.");

        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? "UnknownAdmin";
        var userEmail = User.FindFirstValue(ClaimTypes.Email) ?? "unknown@admin.com";

        try
        {
            var rows = await _extractionService.ExtractFromJsonAsync(file, ct);
            
            var log = await _importService.ImportAsync(rows, dryRun, userId, userEmail, ct);

            return Ok(new
            {
                logId = log.Id,
                isDryRun = log.IsDryRun,
                status = log.Status.ToString(),
                totalRows = log.TotalRows,
                inserted = log.Inserted,
                updated = log.Updated,
                skipped = log.Skipped,
                warned = log.Warned,
                failed = log.Failed,
                completenessReport = log.ContentCompletenessSummaryJson != null 
                    ? System.Text.Json.JsonDocument.Parse(log.ContentCompletenessSummaryJson) 
                    : null
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = "Import failed", details = ex.Message });
        }
    }
}

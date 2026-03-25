using InterviewPrepApp.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace InterviewPrepApp.Api.Controllers.Admin;

[ApiController]
[Route("api/admin/import-quizzes")]
[Authorize(Roles = "Admin")]
public class AdminQuizImportController : ControllerBase
{
    private readonly IQuizImportService _importService;
    private const long MaxFileSizeBytes = 50 * 1024 * 1024; // 50 MB

    public AdminQuizImportController(IQuizImportService importService)
        => _importService = importService;

    /// <summary>
    /// Upload a Quiz MCQ Excel file (.xlsx). Returns a JobId for async polling.
    /// </summary>
    [HttpPost]
    [RequestSizeLimit(50 * 1024 * 1024)]
    public async Task<IActionResult> UploadQuizFile(
        IFormFile file,
        [FromForm] int? defaultCategoryId,
        CancellationToken ct = default)
    {
        if (file is null || file.Length == 0)
            return BadRequest(new ProblemDetails { Title = "No file uploaded." });

        if (file.Length > MaxFileSizeBytes)
            return StatusCode(413, new ProblemDetails { Title = "File exceeds the 50 MB limit." });

        var ext = Path.GetExtension(file.FileName).ToLowerInvariant();
        if (ext != ".xlsx")
            return BadRequest(new ProblemDetails { Title = "Only .xlsx files are accepted." });

        // Magic number check — OOXML starts with PK\x03\x04
        var header = new byte[4];
        await file.OpenReadStream().ReadAsync(header.AsMemory(0, 4), ct);
        if (header is not [0x50, 0x4B, 0x03, 0x04])
            return BadRequest(new ProblemDetails { Title = "File does not appear to be a valid Excel workbook." });

        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? "unknown";
        var result = await _importService.EnqueueAsync(file.OpenReadStream(), file.FileName, file.Length, defaultCategoryId, userId, ct);

        return AcceptedAtAction(
            actionName: "GetStatus",
            controllerName: "ImportJobs",
            routeValues: new { jobId = result.JobId },
            value: result);
    }
}

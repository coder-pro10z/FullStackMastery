using InterviewPrepApp.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace InterviewPrepApp.Api.Controllers.Admin;

[ApiController]
[Route("api/admin/import-jobs")]
[Authorize(Roles = "Admin")]
public class ImportJobsController : ControllerBase
{
    private readonly IImportJobService _jobService;

    public ImportJobsController(IImportJobService jobService)
        => _jobService = jobService;

    /// <summary>GET job status — poll this after uploading a file.</summary>
    [HttpGet("{jobId:guid}", Name = "GetStatus")]
    public async Task<IActionResult> GetStatus(Guid jobId, CancellationToken ct)
    {
        var status = await _jobService.GetStatusAsync(jobId, ct);
        if (status == null) return NotFound();
        return Ok(status);
    }

    /// <summary>GET per-row errors for a completed/partial job.</summary>
    [HttpGet("{jobId:guid}/errors")]
    public async Task<IActionResult> GetErrors(Guid jobId, CancellationToken ct)
    {
        var errors = await _jobService.GetErrorsAsync(jobId, ct);
        return Ok(errors);
    }

    /// <summary>Re-queue a job that ended with failures. Only failed rows are retried.</summary>
    [HttpPost("{jobId:guid}/retry")]
    public async Task<IActionResult> Retry(Guid jobId, CancellationToken ct)
    {
        var result = await _jobService.RetryAsync(jobId, ct);
        if (result == null) return NotFound();
        return AcceptedAtAction(nameof(GetStatus), new { jobId }, result);
    }
}

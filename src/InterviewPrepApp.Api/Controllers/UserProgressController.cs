using System.Security.Claims;
using InterviewPrepApp.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace InterviewPrepApp.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/[controller]")]
public class UserProgressController(IUserProgressService userProgressService) : ControllerBase
{
    private readonly IUserProgressService _userProgressService = userProgressService;

    [HttpGet("summary")]
    public async Task<IActionResult> GetSummary(CancellationToken cancellationToken)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        var summary = await _userProgressService.GetSummaryAsync(userId, cancellationToken);
        return Ok(summary);
    }

    [HttpPost("{questionId:int}/toggle-solved")]
    public async Task<IActionResult> ToggleSolved(int questionId, CancellationToken cancellationToken)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        var state = await _userProgressService.ToggleSolvedAsync(userId, questionId, cancellationToken);
        return Ok(state);
    }

    [HttpPost("{questionId:int}/toggle-revision")]
    public async Task<IActionResult> ToggleRevision(int questionId, CancellationToken cancellationToken)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        var state = await _userProgressService.ToggleRevisionAsync(userId, questionId, cancellationToken);
        return Ok(state);
    }
}

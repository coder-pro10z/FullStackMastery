using InterviewPrepApp.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace InterviewPrepApp.Api.Controllers;

/// <summary>
/// API controller for the interview-prep dashboard.
/// Injects ONLY the Application-layer interface — never the DbContext.
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
public class DashboardController : ControllerBase
{
    private readonly IDashboardService _dashboardService;

    public DashboardController(IDashboardService dashboardService)
    {
        _dashboardService = dashboardService;
    }

    /// <summary>
    /// Returns the full tech-stack hexagon data matching the tech-stack.json contract.
    /// GET api/dashboard/tech-stack
    /// </summary>
    [HttpGet("tech-stack")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ResponseCache(Duration = 300)] // 5-minute cache for static-ish reference data
    public async Task<IActionResult> GetTechStack(CancellationToken cancellationToken)
    {
        var result = await _dashboardService.GetTechStackAsync(cancellationToken);

        if (result is null)
            return NotFound(new { message = "No tech-stack data found." });

        return Ok(result);
    }
}

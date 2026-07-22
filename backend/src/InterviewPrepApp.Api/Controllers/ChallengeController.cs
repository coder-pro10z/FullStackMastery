using InterviewPrepApp.Application.DTOs;
using InterviewPrepApp.Application.Interfaces;
using InterviewPrepApp.Domain.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace InterviewPrepApp.Api.Controllers;

/// <summary>
/// REST endpoints for the 30-Day Challenge module.
/// Competency index: public. Progress endpoints: [Authorize].
/// </summary>
[ApiController]
[Route("api/challenge")]
[Produces("application/json")]
public class ChallengeController(IChallengeService challengeService) : ControllerBase
{
    private readonly IChallengeService _svc = challengeService;

    // ── GET /api/challenge/competencies ─────────────────────────────────────
    /// <summary>Returns all 75 permanent competency records (public).</summary>
    [HttpGet("competencies")]
    [AllowAnonymous]
    public async Task<IActionResult> GetAllCompetencies(
        [FromQuery] string? category,
        CancellationToken ct)
    {
        if (!string.IsNullOrWhiteSpace(category))
        {
            if (!Enum.TryParse<CompetencyCategory>(category, ignoreCase: true, out var parsed))
                return BadRequest($"Unknown category '{category}'. Valid values: CSharpCore, AspNetCore, SqlTheory, SqlCoding, Angular.");

            var filtered = await _svc.GetCompetenciesByCategoryAsync(parsed, ct);
            return filtered.IsSuccess ? Ok(filtered.Data) : BadRequest(filtered.ErrorMessage);
        }

        var result = await _svc.GetAllCompetenciesAsync(ct);
        return result.IsSuccess ? Ok(result.Data) : StatusCode(500, result.ErrorMessage);
    }

    // ── GET /api/challenge/days ─────────────────────────────────────────────
    /// <summary>Returns all 30 challenge days enriched with the authenticated user's completion state.</summary>
    [HttpGet("days")]
    [Authorize]
    public async Task<IActionResult> GetAllDays(CancellationToken ct)
    {
        var userId = GetUserId();
        if (userId is null) return Unauthorized();

        var result = await _svc.GetAllDaysAsync(userId, ct);
        return result.IsSuccess ? Ok(result.Data) : StatusCode(500, result.ErrorMessage);
    }

    // ── GET /api/challenge/days/{dayNumber} ─────────────────────────────────
    /// <summary>Returns a single challenge day by its day number (1–30).</summary>
    [HttpGet("days/{dayNumber:int}")]
    [Authorize]
    public async Task<IActionResult> GetDay(int dayNumber, CancellationToken ct)
    {
        if (dayNumber < 1 || dayNumber > 30)
            return BadRequest("Day number must be between 1 and 30.");

        var userId = GetUserId();
        if (userId is null) return Unauthorized();

        var result = await _svc.GetDayAsync(dayNumber, userId, ct);
        if (!result.IsSuccess) return NotFound(result.ErrorMessage);
        return Ok(result.Data);
    }

    // ── POST /api/challenge/days/{dayNumber}/complete ───────────────────────
    /// <summary>Marks a day as complete for the authenticated user. Body: { "notes": "..." }</summary>
    [HttpPost("days/{dayNumber:int}/complete")]
    [Authorize]
    public async Task<IActionResult> MarkComplete(int dayNumber, [FromBody] MarkDayCompleteDto dto, CancellationToken ct)
    {
        if (dayNumber < 1 || dayNumber > 30)
            return BadRequest("Day number must be between 1 and 30.");

        var userId = GetUserId();
        if (userId is null) return Unauthorized();

        var result = await _svc.MarkDayCompleteAsync(dayNumber, userId, dto?.Notes, ct);
        return result.IsSuccess ? Ok(result.Data) : NotFound(result.ErrorMessage);
    }

    // ── DELETE /api/challenge/days/{dayNumber}/complete ─────────────────────
    /// <summary>Marks a day as incomplete (un-completes) for the authenticated user.</summary>
    [HttpDelete("days/{dayNumber:int}/complete")]
    [Authorize]
    public async Task<IActionResult> MarkIncomplete(int dayNumber, CancellationToken ct)
    {
        if (dayNumber < 1 || dayNumber > 30)
            return BadRequest("Day number must be between 1 and 30.");

        var userId = GetUserId();
        if (userId is null) return Unauthorized();

        var result = await _svc.MarkDayIncompleteAsync(dayNumber, userId, ct);
        return result.IsSuccess ? Ok(result.Data) : NotFound(result.ErrorMessage);
    }

    // ── GET /api/challenge/summary ──────────────────────────────────────────
    /// <summary>Returns the authenticated user's challenge summary: streak, completion %, etc.</summary>
    [HttpGet("summary")]
    [Authorize]
    public async Task<IActionResult> GetSummary(CancellationToken ct)
    {
        var userId = GetUserId();
        if (userId is null) return Unauthorized();

        var result = await _svc.GetSummaryAsync(userId, ct);
        return result.IsSuccess ? Ok(result.Data) : StatusCode(500, result.ErrorMessage);
    }

    // ── Helpers ─────────────────────────────────────────────────────────────

    private string? GetUserId() =>
        User.FindFirstValue(ClaimTypes.NameIdentifier)
        ?? User.FindFirstValue("sub")
        ?? User.FindFirstValue("uid");
}

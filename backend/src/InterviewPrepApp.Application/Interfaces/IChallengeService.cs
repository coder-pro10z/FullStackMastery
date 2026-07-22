using InterviewPrepApp.Application.DTOs;
using InterviewPrepApp.Domain.Enums;
using InterviewPrepApp.Domain.Shared;

namespace InterviewPrepApp.Application.Interfaces;

/// <summary>
/// Service contract for the 30-Day Challenge module.
/// All write operations return Result&lt;T&gt;. All reads return data directly (no business exceptions).
/// </summary>
public interface IChallengeService
{
    // ── Competency Index (public / no auth required) ──────────────────────

    /// <summary>Returns all 75 permanent competency records.</summary>
    Task<Result<IReadOnlyList<CompetencyDto>>> GetAllCompetenciesAsync(CancellationToken ct = default);

    /// <summary>Returns competencies filtered to a single category.</summary>
    Task<Result<IReadOnlyList<CompetencyDto>>> GetCompetenciesByCategoryAsync(CompetencyCategory category, CancellationToken ct = default);

    // ── Day Tracker (auth required) ───────────────────────────────────────

    /// <summary>Returns all 30 challenge days enriched with user-specific completion state.</summary>
    Task<Result<IReadOnlyList<ChallengeDayDto>>> GetAllDaysAsync(string userId, CancellationToken ct = default);

    /// <summary>Returns a single challenge day by day number (1–30).</summary>
    Task<Result<ChallengeDayDto>> GetDayAsync(int dayNumber, string userId, CancellationToken ct = default);

    /// <summary>Marks a day as complete (upsert). Returns the updated progress record.</summary>
    Task<Result<UserChallengeProgressDto>> MarkDayCompleteAsync(int dayNumber, string userId, string? notes, CancellationToken ct = default);

    /// <summary>Marks a day as incomplete (removes completion flag). Returns the updated progress record.</summary>
    Task<Result<UserChallengeProgressDto>> MarkDayIncompleteAsync(int dayNumber, string userId, CancellationToken ct = default);

    // ── Summary / Streak ─────────────────────────────────────────────────

    /// <summary>Returns the user's challenge summary: completion %, current streak, longest streak.</summary>
    Task<Result<ChallengeSummaryDto>> GetSummaryAsync(string userId, CancellationToken ct = default);
}

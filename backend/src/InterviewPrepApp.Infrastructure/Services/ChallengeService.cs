using InterviewPrepApp.Application.DTOs;
using InterviewPrepApp.Application.Interfaces;
using InterviewPrepApp.Domain.Entities;
using InterviewPrepApp.Domain.Enums;
using InterviewPrepApp.Domain.Shared;
using InterviewPrepApp.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace InterviewPrepApp.Infrastructure.Services;

/// <summary>
/// Implements IChallengeService for the 30-Day Challenge module.
/// Follows the established Result&lt;T&gt; pattern — no business exceptions are thrown.
/// </summary>
public class ChallengeService(ApplicationDbContext db) : IChallengeService
{
    private readonly ApplicationDbContext _db = db;

    // ── Competency Index ─────────────────────────────────────────────────────

    public async Task<Result<IReadOnlyList<CompetencyDto>>> GetAllCompetenciesAsync(CancellationToken ct = default)
    {
        var competencies = await _db.Competencies
            .AsNoTracking()
            .OrderBy(c => c.Category)
            .ThenBy(c => c.SortOrder)
            .Select(c => MapCompetencyDto(c))
            .ToListAsync(ct);

        return Result<IReadOnlyList<CompetencyDto>>.Success(competencies);
    }

    public async Task<Result<IReadOnlyList<CompetencyDto>>> GetCompetenciesByCategoryAsync(
        CompetencyCategory category, CancellationToken ct = default)
    {
        var competencies = await _db.Competencies
            .AsNoTracking()
            .Where(c => c.Category == category)
            .OrderBy(c => c.SortOrder)
            .Select(c => MapCompetencyDto(c))
            .ToListAsync(ct);

        return Result<IReadOnlyList<CompetencyDto>>.Success(competencies);
    }

    // ── Day Tracker ──────────────────────────────────────────────────────────

    public async Task<Result<IReadOnlyList<ChallengeDayDto>>> GetAllDaysAsync(
        string userId, CancellationToken ct = default)
    {
        var days = await _db.ChallengeDays
            .AsNoTracking()
            .Include(d => d.ChallengeDayCompetencies)
                .ThenInclude(dc => dc.Competency)
            .OrderBy(d => d.DayNumber)
            .ToListAsync(ct);

        // Load user progress in one query
        var progress = await _db.UserChallengeProgresses
            .AsNoTracking()
            .Where(p => p.UserId == userId)
            .ToDictionaryAsync(p => p.ChallengeDayId, ct);

        var dtos = days.Select(d => MapDayDto(d, progress.GetValueOrDefault(d.Id))).ToList();
        return Result<IReadOnlyList<ChallengeDayDto>>.Success(dtos);
    }

    public async Task<Result<ChallengeDayDto>> GetDayAsync(
        int dayNumber, string userId, CancellationToken ct = default)
    {
        var day = await _db.ChallengeDays
            .AsNoTracking()
            .Include(d => d.ChallengeDayCompetencies)
                .ThenInclude(dc => dc.Competency)
            .FirstOrDefaultAsync(d => d.DayNumber == dayNumber, ct);

        if (day is null)
            return Result<ChallengeDayDto>.Failure($"Day {dayNumber} not found.");

        var progress = await _db.UserChallengeProgresses
            .AsNoTracking()
            .FirstOrDefaultAsync(p => p.UserId == userId && p.ChallengeDayId == day.Id, ct);

        return Result<ChallengeDayDto>.Success(MapDayDto(day, progress));
    }

    // ── Progress Toggles ─────────────────────────────────────────────────────

    public async Task<Result<UserChallengeProgressDto>> MarkDayCompleteAsync(
        int dayNumber, string userId, string? notes, CancellationToken ct = default)
    {
        var day = await _db.ChallengeDays
            .AsNoTracking()
            .FirstOrDefaultAsync(d => d.DayNumber == dayNumber, ct);

        if (day is null)
            return Result<UserChallengeProgressDto>.Failure($"Day {dayNumber} not found.");

        // Upsert pattern — same as UserProgressService
        var progress = await _db.UserChallengeProgresses
            .FirstOrDefaultAsync(p => p.UserId == userId && p.ChallengeDayId == day.Id, ct);

        if (progress is null)
        {
            progress = new UserChallengeProgress
            {
                UserId = userId,
                ChallengeDayId = day.Id
            };
            _db.UserChallengeProgresses.Add(progress);
        }

        progress.IsCompleted = true;
        progress.CompletedAt = DateTime.UtcNow;
        if (notes is not null)
            progress.Notes = notes;

        await _db.SaveChangesAsync(ct);

        return Result<UserChallengeProgressDto>.Success(new UserChallengeProgressDto(
            day.DayNumber,
            progress.IsCompleted,
            progress.CompletedAt,
            progress.Notes));
    }

    public async Task<Result<UserChallengeProgressDto>> MarkDayIncompleteAsync(
        int dayNumber, string userId, CancellationToken ct = default)
    {
        var day = await _db.ChallengeDays
            .AsNoTracking()
            .FirstOrDefaultAsync(d => d.DayNumber == dayNumber, ct);

        if (day is null)
            return Result<UserChallengeProgressDto>.Failure($"Day {dayNumber} not found.");

        var progress = await _db.UserChallengeProgresses
            .FirstOrDefaultAsync(p => p.UserId == userId && p.ChallengeDayId == day.Id, ct);

        if (progress is null)
            return Result<UserChallengeProgressDto>.Success(new UserChallengeProgressDto(dayNumber, false, null, null));

        progress.IsCompleted = false;
        progress.CompletedAt = null;
        await _db.SaveChangesAsync(ct);

        return Result<UserChallengeProgressDto>.Success(new UserChallengeProgressDto(
            day.DayNumber, false, null, progress.Notes));
    }

    // ── Summary / Streak ─────────────────────────────────────────────────────

    public async Task<Result<ChallengeSummaryDto>> GetSummaryAsync(
        string userId, CancellationToken ct = default)
    {
        const int totalDays = 30;
        const int totalCompetencies = 75;

        var completedFlags = await _db.ChallengeDays
            .AsNoTracking()
            .OrderBy(d => d.DayNumber)
            .GroupJoin(
                _db.UserChallengeProgresses.AsNoTracking().Where(p => p.UserId == userId),
                d => d.Id,
                p => p.ChallengeDayId,
                (d, progresses) => progresses.Any(p => p.IsCompleted))
            .ToListAsync(ct);

        var completedDays = completedFlags.Count(f => f);
        var (currentStreak, longestStreak) = CalculateStreaks(completedFlags);
        var completionPercentage = Math.Round((double)completedDays / totalDays * 100, 1);

        return Result<ChallengeSummaryDto>.Success(new ChallengeSummaryDto(
            totalDays,
            completedDays,
            currentStreak,
            longestStreak,
            completionPercentage,
            totalCompetencies));
    }

    // ── Private Helpers ──────────────────────────────────────────────────────

    private static (int current, int longest) CalculateStreaks(List<bool> flags)
    {
        int longest = 0, current = 0, runningStreak = 0;

        // Calculate longest streak (any consecutive block from start)
        for (int i = 0; i < flags.Count; i++)
        {
            if (flags[i])
            {
                runningStreak++;
                if (runningStreak > longest) longest = runningStreak;
            }
            else
            {
                runningStreak = 0;
            }
        }

        // Current streak = consecutive completed days from the most recent completed day backward
        current = 0;
        for (int i = flags.Count - 1; i >= 0; i--)
        {
            if (flags[i]) current++;
            else break;
        }

        return (current, longest);
    }

    private static CompetencyDto MapCompetencyDto(Competency c) => new(
        c.Id,
        c.CompetencyId,
        c.Category.ToString(),
        c.Title,
        c.SortOrder);

    private static ChallengeDayDto MapDayDto(ChallengeDay day, UserChallengeProgress? progress)
    {
        var primary = day.ChallengeDayCompetencies
            .Where(dc => dc.IsPrimary)
            .OrderBy(dc => dc.Competency.Category)
            .ThenBy(dc => dc.Competency.SortOrder)
            .Select(dc => MapCompetencyDto(dc.Competency))
            .ToList();

        var secondary = day.ChallengeDayCompetencies
            .Where(dc => !dc.IsPrimary)
            .OrderBy(dc => dc.Competency.Category)
            .ThenBy(dc => dc.Competency.SortOrder)
            .Select(dc => MapCompetencyDto(dc.Competency))
            .ToList();

        return new ChallengeDayDto(
            day.Id,
            day.DayNumber,
            day.Title,
            day.MainFocus,
            day.SqlCodingNote,
            day.Notes,
            primary,
            secondary,
            progress?.IsCompleted ?? false,
            progress?.CompletedAt,
            progress?.Notes);
    }
}

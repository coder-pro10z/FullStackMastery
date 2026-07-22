using InterviewPrepApp.Domain.Enums;

namespace InterviewPrepApp.Application.DTOs;

// ─────────────────────────────────────────────────────────────────────────────
//  30-Day Challenge DTOs
//  These are read-only records. The competency index is permanent and immutable.
// ─────────────────────────────────────────────────────────────────────────────

/// <summary>A single entry from the Permanent Competency Index.</summary>
public record CompetencyDto(
    int Id,
    string CompetencyId,   // e.g. "C07", "A03", "SC06", "NG01"
    string Category,       // e.g. "CSharpCore"
    string Title,
    int SortOrder
);

/// <summary>Full detail for a single challenge day, including user-specific progress.</summary>
public record ChallengeDayDto(
    int Id,
    int DayNumber,
    string Title,
    string MainFocus,
    string? SqlCodingNote,
    string? Notes,
    IReadOnlyList<CompetencyDto> PrimaryCompetencies,
    IReadOnlyList<CompetencyDto> SecondaryCompetencies,
    // User-specific fields — null/false when called without auth
    bool IsCompleted,
    DateTime? CompletedAt,
    string? UserNotes
);

/// <summary>Lightweight progress state for a single day — returned from mark-complete endpoints.</summary>
public record UserChallengeProgressDto(
    int DayNumber,
    bool IsCompleted,
    DateTime? CompletedAt,
    string? Notes
);

/// <summary>Challenge-level summary statistics for the authenticated user.</summary>
public record ChallengeSummaryDto(
    int TotalDays,
    int CompletedDays,
    int CurrentStreak,
    int LongestStreak,
    double CompletionPercentage,
    int TotalCompetencies       // always 75
);

/// <summary>Request body for marking a day complete.</summary>
public record MarkDayCompleteDto(string? Notes);

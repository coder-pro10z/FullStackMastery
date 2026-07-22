namespace InterviewPrepApp.Domain.Entities;

/// <summary>
/// Tracks per-user completion state for each day in the 30-Day Challenge.
/// Composite PK: (UserId, ChallengeDayId).
/// </summary>
public class UserChallengeProgress
{
    /// <summary>FK → ApplicationUser (Identity user ID string).</summary>
    public string UserId { get; set; } = string.Empty;

    /// <summary>FK → ChallengeDay.</summary>
    public int ChallengeDayId { get; set; }

    /// <summary>Whether the user has marked this day as complete.</summary>
    public bool IsCompleted { get; set; }

    /// <summary>UTC timestamp when the user marked the day complete. Null if not yet complete.</summary>
    public DateTime? CompletedAt { get; set; }

    /// <summary>Optional user-written reflection note for this day.</summary>
    public string? Notes { get; set; }

    // Navigation
    public ApplicationUser User { get; set; } = null!;
    public ChallengeDay ChallengeDay { get; set; } = null!;
}

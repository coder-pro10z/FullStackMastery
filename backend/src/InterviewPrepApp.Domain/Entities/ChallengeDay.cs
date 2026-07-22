namespace InterviewPrepApp.Domain.Entities;

/// <summary>
/// Represents a single day in the 30-Day Challenge curriculum.
/// These 30 records are seeded once and contain the structured plan for each day.
/// </summary>
public class ChallengeDay
{
    public int Id { get; set; }

    /// <summary>Day number in the challenge (1–30). Used as the display and URL key.</summary>
    public int DayNumber { get; set; }

    /// <summary>Day title, e.g. "Memory Management & C# Fundamentals".</summary>
    public string Title { get; set; } = string.Empty;

    /// <summary>Short summary of the main learning objectives for this day.</summary>
    public string MainFocus { get; set; } = string.Empty;

    /// <summary>Optional SQL coding challenge note, e.g. "SC01 – Find 2nd Highest Salary".</summary>
    public string? SqlCodingNote { get; set; }

    /// <summary>Optional coaching notes or study tips for this day.</summary>
    public string? Notes { get; set; }

    // Navigation
    public ICollection<ChallengeDayCompetency> ChallengeDayCompetencies { get; set; } = [];
    public ICollection<UserChallengeProgress> UserProgresses { get; set; } = [];
}

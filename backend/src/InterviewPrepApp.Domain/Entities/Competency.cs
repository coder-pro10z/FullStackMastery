using InterviewPrepApp.Domain.Enums;

namespace InterviewPrepApp.Domain.Entities;

/// <summary>
/// A single entry in the Permanent Competency Index (75 total: C01-C15, A01-A15,
/// S01-S15, SC01-SC15, NG01-NG15). These records are seeded once and never mutated.
/// </summary>
public class Competency
{
    public int Id { get; set; }

    /// <summary>
    /// The canonical, human-readable competency identifier. Examples: "C07", "A03", "SC06", "NG01".
    /// This ID is permanent — it is the join key for lessons, flashcards, questions, and mock interviews.
    /// </summary>
    public string CompetencyId { get; set; } = string.Empty;

    /// <summary>Which of the five master categories this competency belongs to.</summary>
    public CompetencyCategory Category { get; set; }

    /// <summary>Full competency title, e.g. "LINQ (Deferred vs Immediate Execution)".</summary>
    public string Title { get; set; } = string.Empty;

    /// <summary>Display order within its category (1-15).</summary>
    public int SortOrder { get; set; }

    // Navigation
    public ICollection<ChallengeDayCompetency> ChallengeDayCompetencies { get; set; } = [];
}

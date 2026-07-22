namespace InterviewPrepApp.Domain.Entities;

/// <summary>
/// Bridge / join table linking a ChallengeDay to one or more Competency records.
/// IsPrimary distinguishes the main-focus competencies (true) from secondary
/// SQL revision / supplementary competencies (false).
/// </summary>
public class ChallengeDayCompetency
{
    public int Id { get; set; }

    public int ChallengeDayId { get; set; }
    public ChallengeDay ChallengeDay { get; set; } = null!;

    public int CompetencyId { get; set; }
    public Competency Competency { get; set; } = null!;

    /// <summary>
    /// True = main focus for the day. False = secondary / SQL revision competency.
    /// </summary>
    public bool IsPrimary { get; set; }
}

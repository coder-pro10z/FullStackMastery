namespace InterviewPrepApp.Domain.Enums;

/// <summary>
/// The five permanent competency categories that form the Master Competency Index.
/// These values are fixed and must never be reordered — they are used as seed data FKs.
/// </summary>
public enum CompetencyCategory
{
    CSharpCore  = 1,
    AspNetCore  = 2,
    SqlTheory   = 3,
    SqlCoding   = 4,
    Angular     = 5
}

namespace InterviewPrepApp.Domain.Enums;

public enum ImportJobType
{
    Question = 1,
    Quiz = 2,
    StudyGuide = 3,
    Answer = 4
}

public enum ImportJobStatus
{
    Queued = 0,
    InProgress = 1,
    Completed = 2,
    PartiallyCompleted = 3,
    Failed = 4
}

/// <summary>
/// Status for the lightweight synchronous ImportLog (Question + Answer imports).
/// Distinct from ImportJobStatus which is used by the async ImportJob pipeline.
/// </summary>
public enum ImportLogStatus
{
    Completed = 1,
    PartiallyCompleted = 2,
    Failed = 3
}

public enum QuizQuestionDifficulty
{
    Easy = 1,
    Medium = 2,
    Hard = 3
}

namespace InterviewPrepApp.Domain.Enums;

public enum ImportJobType
{
    Question = 1,
    Quiz = 2,
    StudyGuide = 3
}

public enum ImportJobStatus
{
    Queued = 0,
    InProgress = 1,
    Completed = 2,
    PartiallyCompleted = 3,
    Failed = 4
}

public enum QuizQuestionDifficulty
{
    Easy = 1,
    Medium = 2,
    Hard = 3
}

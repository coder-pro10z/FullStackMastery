namespace InterviewPrepApp.Domain.Enums;

public enum QuizMode
{
    Practice = 1,
    Assessment = 2
}

public enum QuizStatus
{
    InProgress = 1,
    Completed = 2,
    Abandoned = 3
}

/// <summary>Lifecycle status for MCQ QuizQuestion records.</summary>
public enum QuizQuestionStatus
{
    Draft = 1,
    Published = 2,
    Archived = 3
}

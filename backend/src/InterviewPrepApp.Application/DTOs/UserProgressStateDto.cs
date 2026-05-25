namespace InterviewPrepApp.Application.DTOs;

public class UserProgressStateDto
{
    public int QuestionId { get; set; }

    public bool IsSolved { get; set; }

    public bool IsRevision { get; set; }
}

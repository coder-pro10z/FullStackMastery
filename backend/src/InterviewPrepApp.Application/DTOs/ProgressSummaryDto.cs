namespace InterviewPrepApp.Application.DTOs;

public class ProgressSummaryDto
{
    public int TotalQuestions { get; set; }

    public int TotalSolved { get; set; }

    public int EasyTotal { get; set; }

    public int EasySolved { get; set; }

    public int MediumTotal { get; set; }

    public int MediumSolved { get; set; }

    public int HardTotal { get; set; }

    public int HardSolved { get; set; }
}

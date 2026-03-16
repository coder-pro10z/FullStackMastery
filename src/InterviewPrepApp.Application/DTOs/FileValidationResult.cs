namespace InterviewPrepApp.Application.DTOs;

public class FileValidationResult
{
    public bool IsValid { get; set; }

    public List<string> Errors { get; set; } = new();

    public string? DetectedFormat { get; set; }

    public int ExpectedRowCount { get; set; }
}

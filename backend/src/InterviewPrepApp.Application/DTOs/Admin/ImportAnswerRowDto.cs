namespace InterviewPrepApp.Application.DTOs.Admin;

public class ImportAnswerRowDto
{
    public string QuestionId { get; set; } = string.Empty;   // FK lookup key to Question.ExternalId
    public string? CapturedAt { get; set; }
    public string? SourceSlide { get; set; }
    public string Definition { get; set; } = string.Empty;
    public string InterviewAnswer { get; set; } = string.Empty;
    public string? TechnicalExplanation { get; set; }
    public string? BestPractice { get; set; }
    public string? RealProjectExample { get; set; }
    public List<CodeSnippetDto>? CodeSnippets { get; set; }
    public ArchitectureNoteDto? ArchitectureNote { get; set; }
    public DifferentiatorDto? Differentiator { get; set; }
    public TroubleshootingDto? Troubleshooting { get; set; }
    public List<string>? FollowUpQuestions { get; set; }
}

public class CodeSnippetDto
{
    public string Language { get; set; } = string.Empty;
    public string? Label { get; set; }
    public string? FileName { get; set; }
    public string Code { get; set; } = string.Empty;
    public string? InjectAfter { get; set; }
    public int[]? HighlightLines { get; set; }
}

public class ArchitectureNoteDto
{
    public string Description { get; set; } = string.Empty;
    public string? MermaidGraph { get; set; }
}

public class DifferentiatorDto
{
    public string Description { get; set; } = string.Empty;
    public string? ComparisonTable { get; set; }
}

public class TroubleshootingDto
{
    public string Description { get; set; } = string.Empty;
    public string? Table { get; set; }
}

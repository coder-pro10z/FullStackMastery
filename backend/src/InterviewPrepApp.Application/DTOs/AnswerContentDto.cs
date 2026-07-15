namespace InterviewPrepApp.Application.DTOs;

public class AnswerContentDto
{
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
    public string Code { get; set; } = string.Empty;
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

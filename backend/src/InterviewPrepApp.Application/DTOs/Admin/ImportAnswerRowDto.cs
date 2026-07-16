using System.Text.Json.Serialization;

namespace InterviewPrepApp.Application.DTOs.Admin;

public class ImportAnswerRowDto
{
    [JsonPropertyName("question_id")]
    public string QuestionId { get; set; } = string.Empty;   // FK lookup key to Question.ExternalId
    
    [JsonPropertyName("_captured_at")]
    public string? CapturedAt { get; set; }
    
    [JsonPropertyName("_source_slide")]
    public string? SourceSlide { get; set; }
    
    [JsonPropertyName("definition")]
    public string Definition { get; set; } = string.Empty;
    
    [JsonPropertyName("interview_answer")]
    public string InterviewAnswer { get; set; } = string.Empty;
    
    [JsonPropertyName("technical_explanation")]
    public string? TechnicalExplanation { get; set; }
    
    [JsonPropertyName("best_practice")]
    public string? BestPractice { get; set; }
    
    [JsonPropertyName("real_project_example")]
    public string? RealProjectExample { get; set; }
    
    [JsonPropertyName("code_snippets")]
    public List<CodeSnippetDto>? CodeSnippets { get; set; }
    
    [JsonPropertyName("architecture_note")]
    public ArchitectureNoteDto? ArchitectureNote { get; set; }
    
    [JsonPropertyName("differentiator")]
    public DifferentiatorDto? Differentiator { get; set; }
    
    [JsonPropertyName("troubleshooting")]
    public TroubleshootingDto? Troubleshooting { get; set; }
    
    [JsonPropertyName("follow_up_questions")]
    public List<string>? FollowUpQuestions { get; set; }
}

public class CodeSnippetDto
{
    [JsonPropertyName("language")]
    public string Language { get; set; } = string.Empty;
    
    [JsonPropertyName("label")]
    public string? Label { get; set; }
    
    [JsonPropertyName("file_name")]
    public string? FileName { get; set; }
    
    [JsonPropertyName("code")]
    public string Code { get; set; } = string.Empty;
    
    [JsonPropertyName("inject_after")]
    public string? InjectAfter { get; set; }
    
    [JsonPropertyName("highlight_lines")]
    public int[]? HighlightLines { get; set; }
}

public class ArchitectureNoteDto
{
    [JsonPropertyName("description")]
    public string Description { get; set; } = string.Empty;
    
    [JsonPropertyName("mermaid_graph")]
    public string? MermaidGraph { get; set; }
}

public class DifferentiatorDto
{
    [JsonPropertyName("description")]
    public string Description { get; set; } = string.Empty;
    
    [JsonPropertyName("comparison_table")]
    public string? ComparisonTable { get; set; }
}

public class TroubleshootingDto
{
    [JsonPropertyName("description")]
    public string Description { get; set; } = string.Empty;
    
    [JsonPropertyName("table")]
    public string? Table { get; set; }
}

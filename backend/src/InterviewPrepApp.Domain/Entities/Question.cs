using InterviewPrepApp.Domain.Enums;

namespace InterviewPrepApp.Domain.Entities;

public class Question
{
    public int Id { get; set; }

    /// <summary>
    /// Stable external identifier from the import JSON (e.g. "Q_CSHARP_VAR_VS_DYNAMIC").
    /// Used as the upsert key during import and as the join key between questions.json and answers.json.
    /// </summary>
    public string? ExternalId { get; set; }

    public string? Title { get; set; }
    public string QuestionText { get; set; } = string.Empty;

    /// <summary>Legacy flat answer string. Kept for backwards compatibility; superseded by Answer entity.</summary>
    public string? AnswerText { get; set; }

    public Difficulty Difficulty { get; set; }

    /// <summary>Legacy free-text role field. Superseded by the Tag M:N system via QuestionTags.</summary>
    public string Role { get; set; } = string.Empty;

    public int CategoryId { get; set; }
    public Category Category { get; set; } = null!;

    // Admin fields
    public QuestionStatus Status { get; set; } = QuestionStatus.Published;
    public bool IsDeleted { get; set; } = false;
    public DateTime? DeletedAt { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
    public string? CreatedByUserId { get; set; }

    // Navigation
    /// <summary>1:1 structured answer. Null if no answer has been imported yet.</summary>
    public Answer? Answer { get; set; }

    /// <summary>M:N tags (Role, Domain, Technology) via QuestionTag bridge.</summary>
    public ICollection<QuestionTag> QuestionTags { get; set; } = [];

    public ICollection<UserProgress> UserProgresses { get; set; } = new List<UserProgress>();
    public ICollection<QuestionVersion> Versions { get; set; } = new List<QuestionVersion>();
    public ICollection<InterviewRoundQuestion> InterviewRoundQuestions { get; set; } = new List<InterviewRoundQuestion>();
}

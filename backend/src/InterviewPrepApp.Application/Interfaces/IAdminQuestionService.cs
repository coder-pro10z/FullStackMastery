using InterviewPrepApp.Application.DTOs.Admin;

namespace InterviewPrepApp.Application.Interfaces;

public interface IAdminQuestionService
{
    Task<PagedAdminResult<QuestionAdminDto>> GetQuestionsAsync(AdminQuestionFilter filter, CancellationToken ct = default);
    Task<QuestionAdminDto?> GetByIdAsync(int id, bool includeDeleted = false, CancellationToken ct = default);
    Task<QuestionAdminDto> CreateAsync(CreateQuestionDto dto, string userId, string userEmail, CancellationToken ct = default);
    Task<QuestionAdminDto?> UpdateAsync(int id, UpdateQuestionDto dto, string userId, string userEmail, CancellationToken ct = default);
    Task<bool> SoftDeleteAsync(int id, string userId, string userEmail, CancellationToken ct = default);
    Task<bool> RestoreAsync(int id, string userId, string userEmail, CancellationToken ct = default);
    Task<IReadOnlyList<QuestionVersionDto>> GetVersionsAsync(int id, CancellationToken ct = default);
    Task<BulkImportResultDto> ImportAsync(IEnumerable<ImportQuestionRowDto> rows, int? defaultCategoryId, bool dryRun, string userId, string userEmail, CancellationToken ct = default);
}

public class AdminQuestionFilter
{
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 20;
    public string? SearchTerm { get; set; }
    public string? Difficulty { get; set; }
    public string? Role { get; set; }
    public int? CategoryId { get; set; }
    public string? Status { get; set; }
    public bool IncludeDeleted { get; set; } = false;
}

public class PagedAdminResult<T>
{
    public IReadOnlyList<T> Data { get; set; } = [];
    public int TotalRecords { get; set; }
    public int PageNumber { get; set; }
    public int PageSize { get; set; }
    public int TotalPages => PageSize > 0 ? (int)Math.Ceiling((double)TotalRecords / PageSize) : 0;
}

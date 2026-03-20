using InterviewPrepApp.Application.DTOs.Admin;

namespace InterviewPrepApp.Application.Interfaces;

public interface IAdminDashboardService
{
    Task<DashboardStatsDto> GetStatsAsync(CancellationToken ct = default);
}

public interface IAuditLogService
{
    Task LogAsync(string userId, string userEmail, string action,
        string entityType, string? entityId = null,
        string? oldValues = null, string? newValues = null,
        string? ipAddress = null, CancellationToken ct = default);

    Task<IReadOnlyList<AuditLogDto>> GetLogsAsync(AuditLogFilter filter, CancellationToken ct = default);
}

public class AuditLogFilter
{
    public string? UserId { get; set; }
    public string? Action { get; set; }
    public string? EntityType { get; set; }
    public DateTime? From { get; set; }
    public DateTime? To { get; set; }
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 50;
}

public interface IAdminCategoryService
{
    Task<IReadOnlyList<DTOs.Admin.CategoryManageDto>> GetTreeAsync(CancellationToken ct = default);
    Task<DTOs.Admin.CategoryManageDto> CreateAsync(DTOs.Admin.CreateCategoryDto dto, CancellationToken ct = default);
    Task<DTOs.Admin.CategoryManageDto?> UpdateAsync(int id, DTOs.Admin.UpdateCategoryDto dto, CancellationToken ct = default);
    Task<bool> DeleteAsync(int id, CancellationToken ct = default);
}

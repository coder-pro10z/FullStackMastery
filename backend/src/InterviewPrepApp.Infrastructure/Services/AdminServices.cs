using InterviewPrepApp.Application.DTOs.Admin;
using InterviewPrepApp.Application.Interfaces;
using InterviewPrepApp.Domain.Entities;
using InterviewPrepApp.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace InterviewPrepApp.Infrastructure.Services;

public class AuditLogService : IAuditLogService
{
    private readonly ApplicationDbContext _db;

    public AuditLogService(ApplicationDbContext db) => _db = db;

    public async Task LogAsync(string userId, string userEmail, string action,
        string entityType, string? entityId = null,
        string? oldValues = null, string? newValues = null,
        string? ipAddress = null, CancellationToken ct = default)
    {
        _db.AuditLogs.Add(new AuditLog
        {
            UserId = userId,
            UserEmail = userEmail,
            Action = action,
            EntityType = entityType,
            EntityId = entityId,
            OldValues = oldValues,
            NewValues = newValues,
            IpAddress = ipAddress,
            Timestamp = DateTime.UtcNow
        });
        await _db.SaveChangesAsync(ct);
    }

    public async Task<IReadOnlyList<AuditLogDto>> GetLogsAsync(AuditLogFilter filter, CancellationToken ct = default)
    {
        var query = _db.AuditLogs.AsNoTracking().AsQueryable();

        if (!string.IsNullOrWhiteSpace(filter.UserId))
            query = query.Where(l => l.UserId == filter.UserId);

        if (!string.IsNullOrWhiteSpace(filter.Action))
            query = query.Where(l => l.Action == filter.Action);

        if (!string.IsNullOrWhiteSpace(filter.EntityType))
            query = query.Where(l => l.EntityType == filter.EntityType);

        if (filter.From.HasValue)
            query = query.Where(l => l.Timestamp >= filter.From.Value);

        if (filter.To.HasValue)
            query = query.Where(l => l.Timestamp <= filter.To.Value);

        return await query
            .OrderByDescending(l => l.Timestamp)
            .Skip((filter.Page - 1) * filter.PageSize)
            .Take(filter.PageSize)
            .Select(l => new AuditLogDto
            {
                Id = l.Id,
                UserEmail = l.UserEmail,
                Action = l.Action,
                EntityType = l.EntityType,
                EntityId = l.EntityId,
                OldValues = l.OldValues,
                NewValues = l.NewValues,
                Timestamp = l.Timestamp
            })
            .ToListAsync(ct);
    }
}

public class AdminDashboardService : IAdminDashboardService
{
    private readonly ApplicationDbContext _db;

    public AdminDashboardService(ApplicationDbContext db) => _db = db;

    public async Task<DashboardStatsDto> GetStatsAsync(CancellationToken ct = default)
    {
        var allQuestions = await _db.Questions.IgnoreQueryFilters().AsNoTracking().ToListAsync(ct);
        var recentLogs = await _db.AuditLogs.AsNoTracking()
            .OrderByDescending(l => l.Timestamp).Take(10).ToListAsync(ct);

        return new DashboardStatsDto
        {
            TotalQuestions = allQuestions.Count(q => !q.IsDeleted),
            PublishedQuestions = allQuestions.Count(q => !q.IsDeleted && q.Status == Domain.Enums.QuestionStatus.Published),
            DraftQuestions = allQuestions.Count(q => !q.IsDeleted && q.Status == Domain.Enums.QuestionStatus.Draft),
            DeletedQuestions = allQuestions.Count(q => q.IsDeleted),
            TotalCategories = await _db.Categories.CountAsync(ct),
            TotalUsers = await _db.Users.CountAsync(ct),
            CountByDifficulty = new DifficultyBreakdownDto
            {
                Easy = allQuestions.Count(q => !q.IsDeleted && q.Difficulty == Domain.Enums.Difficulty.Easy),
                Medium = allQuestions.Count(q => !q.IsDeleted && q.Difficulty == Domain.Enums.Difficulty.Medium),
                Hard = allQuestions.Count(q => !q.IsDeleted && q.Difficulty == Domain.Enums.Difficulty.Hard)
            },
            RecentActivity = recentLogs.Select(l => new AuditLogDto
            {
                Id = l.Id, UserEmail = l.UserEmail, Action = l.Action,
                EntityType = l.EntityType, EntityId = l.EntityId, Timestamp = l.Timestamp
            }).ToList()
        };
    }
}

public class AdminCategoryService : IAdminCategoryService
{
    private readonly ApplicationDbContext _db;

    public AdminCategoryService(ApplicationDbContext db) => _db = db;

    public async Task<IReadOnlyList<CategoryManageDto>> GetTreeAsync(CancellationToken ct = default)
    {
        var all = await _db.Categories
            .Include(c => c.Questions)
            .AsNoTracking().ToListAsync(ct);

        return all.Where(c => c.ParentId == null)
            .Select(c => ToDto(c, all)).ToList();
    }

    public async Task<CategoryManageDto> CreateAsync(CreateCategoryDto dto, CancellationToken ct = default)
    {
        var slug = string.IsNullOrWhiteSpace(dto.Slug)
            ? dto.Name.ToLower().Replace(" ", "-")
            : dto.Slug;

        var category = new Domain.Entities.Category
        {
            Name = dto.Name,
            Slug = slug,
            ParentId = dto.ParentId
        };
        _db.Categories.Add(category);
        await _db.SaveChangesAsync(ct);
        return new CategoryManageDto { Id = category.Id, Name = category.Name, Slug = category.Slug, ParentId = category.ParentId };
    }

    public async Task<CategoryManageDto?> UpdateAsync(int id, UpdateCategoryDto dto, CancellationToken ct = default)
    {
        var category = await _db.Categories.FindAsync([id], ct);
        if (category is null) return null;

        category.Name = dto.Name;
        category.Slug = string.IsNullOrWhiteSpace(dto.Slug) ? dto.Name.ToLower().Replace(" ", "-") : dto.Slug;
        category.ParentId = dto.ParentId;
        await _db.SaveChangesAsync(ct);
        return new CategoryManageDto { Id = category.Id, Name = category.Name, Slug = category.Slug, ParentId = category.ParentId };
    }

    public async Task<bool> DeleteAsync(int id, CancellationToken ct = default)
    {
        var category = await _db.Categories.Include(c => c.Questions).FirstOrDefaultAsync(c => c.Id == id, ct);
        if (category is null) return false;
        if (category.Questions.Any()) return false;  // Blocked if questions exist

        _db.Categories.Remove(category);
        await _db.SaveChangesAsync(ct);
        return true;
    }

    private static CategoryManageDto ToDto(Domain.Entities.Category c, IReadOnlyList<Domain.Entities.Category> all) => new()
    {
        Id = c.Id,
        Name = c.Name,
        Slug = c.Slug,
        ParentId = c.ParentId,
        QuestionCount = c.Questions.Count,
        SubCategories = all.Where(x => x.ParentId == c.Id).Select(x => ToDto(x, all)).ToList()
    };
}

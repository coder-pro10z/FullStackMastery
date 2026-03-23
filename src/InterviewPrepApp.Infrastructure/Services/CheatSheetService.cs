using InterviewPrepApp.Application.DTOs;
using InterviewPrepApp.Application.Interfaces;
using InterviewPrepApp.Domain.Entities;
using InterviewPrepApp.Domain.Enums;
using InterviewPrepApp.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace InterviewPrepApp.Infrastructure.Services;

public class CheatSheetService : ICheatSheetService
{
    private readonly ApplicationDbContext _db;

    public CheatSheetService(ApplicationDbContext db)
    {
        _db = db;
    }

    public async Task<IReadOnlyList<CheatSheetResourceDto>> GetByCategoryAsync(int categoryId, CancellationToken ct = default)
    {
        var categoryIds = await GetCategoryTreeIdsAsync(categoryId, ct);

        return await _db.CheatSheetResources
            .Include(r => r.Category)
            .Where(r => !r.IsDeleted && categoryIds.Contains(r.CategoryId))
            .OrderBy(r => r.DisplayOrder)
            .ThenBy(r => r.Title)
            .Select(r => new CheatSheetResourceDto
            {
                Id = r.Id,
                Title = r.Title,
                Type = r.Type.ToString(),
                Url = r.Url,
                MarkdownContent = r.MarkdownContent,
                CategoryId = r.CategoryId,
                CategoryName = r.Category.Name,
                DisplayOrder = r.DisplayOrder
            })
            .ToListAsync(ct);
    }

    public async Task<CheatSheetResourceDto?> CreateAsync(CreateCheatSheetDto dto, CancellationToken ct = default)
    {
        var category = await _db.Categories.FindAsync(new object[] { dto.CategoryId }, ct);
        if (category == null) return null;

        if (!Enum.TryParse<CheatSheetResourceType>(dto.Type, out var type))
        {
            return null;
        }

        var resource = new CheatSheetResource
        {
            Title = dto.Title,
            Type = type,
            Url = dto.Url,
            MarkdownContent = dto.MarkdownContent,
            CategoryId = dto.CategoryId,
            DisplayOrder = dto.DisplayOrder
        };

        _db.CheatSheetResources.Add(resource);
        await _db.SaveChangesAsync(ct);

        return new CheatSheetResourceDto
        {
            Id = resource.Id,
            Title = resource.Title,
            Type = resource.Type.ToString(),
            Url = resource.Url,
            MarkdownContent = resource.MarkdownContent,
            CategoryId = resource.CategoryId,
            CategoryName = category.Name,
            DisplayOrder = resource.DisplayOrder
        };
    }

    public async Task<bool> DeleteAsync(int id, CancellationToken ct = default)
    {
        var resource = await _db.CheatSheetResources.FindAsync(new object[] { id }, ct);
        if (resource == null || resource.IsDeleted) return false;

        resource.IsDeleted = true;
        await _db.SaveChangesAsync(ct);
        return true;
    }

    private async Task<List<int>> GetCategoryTreeIdsAsync(int rootCategoryId, CancellationToken ct)
    {
        var allCats = await _db.Categories.AsNoTracking().ToListAsync(ct);
        var ids = new HashSet<int> { rootCategoryId };
        Queue<int> toProcess = new Queue<int>();
        toProcess.Enqueue(rootCategoryId);
        while (toProcess.Count > 0)
        {
            var current = toProcess.Dequeue();
            var children = allCats.Where(c => c.ParentId == current).Select(c => c.Id);
            foreach (var child in children)
            {
                if (ids.Add(child))
                    toProcess.Enqueue(child);
            }
        }
        return ids.ToList();
    }
}

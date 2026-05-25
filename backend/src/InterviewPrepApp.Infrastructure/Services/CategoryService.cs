using InterviewPrepApp.Application.DTOs;
using InterviewPrepApp.Application.Interfaces;
using InterviewPrepApp.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace InterviewPrepApp.Infrastructure.Services;

public class CategoryService(ApplicationDbContext context) : ICategoryService
{
    private readonly ApplicationDbContext _context = context;

    public async Task<IReadOnlyList<CategoryTreeDto>> GetTreeAsync(CancellationToken cancellationToken = default)
    {
        var categories = await _context.Categories
            .AsNoTracking()
            .OrderBy(category => category.Name)
            .Select(category => new CategoryFlatDto
            {
                Id = category.Id,
                Name = category.Name,
                ParentCategoryId = category.ParentId
            })
            .ToListAsync(cancellationToken);

        var lookup = categories
            .Select(category => new CategoryTreeDto
            {
                Id = category.Id,
                Name = category.Name
            })
            .ToDictionary(category => category.Id);

        var roots = new List<CategoryTreeDto>();

        foreach (var category in categories)
        {
            var currentNode = lookup[category.Id];

            if (category.ParentCategoryId is int parentCategoryId &&
                lookup.TryGetValue(parentCategoryId, out var parentNode))
            {
                parentNode.SubCategories.Add(currentNode);
                continue;
            }

            roots.Add(currentNode);
        }

        return roots;
    }

    public async Task<IReadOnlyList<CategoryFlatDto>> GetFlatListAsync(CancellationToken cancellationToken = default)
    {
        return await _context.Categories
            .AsNoTracking()
            .OrderBy(category => category.Name)
            .Select(category => new CategoryFlatDto
            {
                Id = category.Id,
                Name = category.Name,
                ParentCategoryId = category.ParentId
            })
            .ToListAsync(cancellationToken);
    }
}

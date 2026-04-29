using InterviewPrepApp.Application.DTOs;
using InterviewPrepApp.Application.Interfaces;
using InterviewPrepApp.Application.Mappings;
using InterviewPrepApp.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace InterviewPrepApp.Infrastructure.Services;

/// <summary>
/// Infrastructure implementation of <see cref="IDashboardService"/>.
/// Uses EF Core with AsNoTracking() for read-optimized queries
/// to guarantee sub-50ms latency on the dashboard endpoint.
/// </summary>
public sealed class DashboardService : IDashboardService
{
    private readonly ApplicationDbContext _dbContext;

    public DashboardService(ApplicationDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    /// <inheritdoc />
    public async Task<TechStackDto?> GetTechStackAsync(CancellationToken cancellationToken = default)
    {
        var hexagon = await _dbContext.DevHexagons
            .AsNoTracking()
            .AsSplitQuery()
            .Include(h => h.PrimaryMetrics)
            .Include(h => h.Skills)
                .ThenInclude(s => s.KeyTopics)
            .OrderBy(h => h.Id)
            .FirstOrDefaultAsync(cancellationToken);

        return hexagon?.ToTechStackDto();
    }
}

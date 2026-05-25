using InterviewPrepApp.Application.DTOs;

namespace InterviewPrepApp.Application.Interfaces;

/// <summary>
/// Application-layer contract for retrieving dashboard/tech-stack data.
/// Implemented by Infrastructure; consumed by the API controller.
/// </summary>
public interface IDashboardService
{
    /// <summary>
    /// Retrieves the full tech-stack hexagon data in the shape the frontend expects.
    /// </summary>
    /// <param name="cancellationToken">Cancellation token for async operations.</param>
    /// <returns>The complete tech-stack DTO, or null if no data exists.</returns>
    Task<TechStackDto?> GetTechStackAsync(CancellationToken cancellationToken = default);
}

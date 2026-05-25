using InterviewPrepApp.Application.DTOs;

namespace InterviewPrepApp.Application.Interfaces;

public interface ICategoryService
{
    Task<IReadOnlyList<CategoryTreeDto>> GetTreeAsync(CancellationToken cancellationToken = default);

    Task<IReadOnlyList<CategoryFlatDto>> GetFlatListAsync(CancellationToken cancellationToken = default);
}

using InterviewPrepApp.Application.DTOs;

namespace InterviewPrepApp.Application.Interfaces;

public interface ICheatSheetService
{
    Task<IReadOnlyList<CheatSheetResourceDto>> GetByCategoryAsync(int categoryId, CancellationToken ct = default);
    Task<CheatSheetResourceDto?> CreateAsync(CreateCheatSheetDto dto, CancellationToken ct = default);
    Task<bool> DeleteAsync(int id, CancellationToken ct = default);
}

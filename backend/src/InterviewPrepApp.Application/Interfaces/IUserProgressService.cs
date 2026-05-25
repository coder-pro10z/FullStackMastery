using InterviewPrepApp.Application.DTOs;

namespace InterviewPrepApp.Application.Interfaces;

public interface IUserProgressService
{
    Task<ProgressSummaryDto> GetSummaryAsync(string userId, CancellationToken cancellationToken = default);

    Task<UserProgressStateDto> ToggleSolvedAsync(string userId, int questionId, CancellationToken cancellationToken = default);

    Task<UserProgressStateDto> ToggleRevisionAsync(string userId, int questionId, CancellationToken cancellationToken = default);
}

using InterviewPrepApp.Application.DTOs;

namespace InterviewPrepApp.Application.Interfaces;

public interface IQuizService
{
    Task<QuizAttemptDto> CreateAttemptAsync(CreateQuizAttemptDto dto, string userId, CancellationToken ct = default);
    Task<QuizAttemptDto?> GetAttemptAsync(int attemptId, string userId, CancellationToken ct = default);
    Task<QuizAttemptDto?> SaveResponseAsync(int attemptId, int questionId, QuizAttemptResponseDto responseDto, string userId, CancellationToken ct = default);
    Task<QuizAttemptDto?> SubmitAttemptAsync(int attemptId, string userId, CancellationToken ct = default);
}

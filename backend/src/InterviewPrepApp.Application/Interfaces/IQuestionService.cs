using InterviewPrepApp.Application.DTOs;
using InterviewPrepApp.Domain.Enums;

namespace InterviewPrepApp.Application.Interfaces;

public interface IQuestionService
{
    Task<PagedResponse<QuestionDto>> GetQuestionsAsync(
        int? categoryId = null,
        string? searchTerm = null,
        Difficulty? difficulty = null,
        string? role = null,
        int pageNumber = 1,
        int pageSize = 20,
        string? userId = null,
        CancellationToken cancellationToken = default);
}

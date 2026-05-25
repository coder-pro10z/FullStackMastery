using InterviewPrepApp.Application.DTOs;
using InterviewPrepApp.Application.Interfaces;
using InterviewPrepApp.Domain.Enums;
using InterviewPrepApp.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace InterviewPrepApp.Infrastructure.Services;

public class QuestionService(ApplicationDbContext context) : IQuestionService
{
    private readonly ApplicationDbContext _context = context;

    public async Task<PagedResponse<QuestionDto>> GetQuestionsAsync(
        int? categoryId = null,
        string? searchTerm = null,
        Difficulty? difficulty = null,
        string? role = null,
        int pageNumber = 1,
        int pageSize = 20,
        string? userId = null,
        CancellationToken cancellationToken = default)
    {
        pageNumber = pageNumber < 1 ? 1 : pageNumber;
        pageSize = pageSize < 1 ? 20 : Math.Min(pageSize, 100);

        var query = _context.Questions
            .AsNoTracking()
            .Include(question => question.Category)
            .AsQueryable();

        if (categoryId.HasValue)
        {
            var categoryIds = await GetCategoryIdsAsync(categoryId.Value, cancellationToken);
            query = query.Where(question => categoryIds.Contains(question.CategoryId));
        }

        if (!string.IsNullOrWhiteSpace(searchTerm))
        {
            var normalizedSearchTerm = searchTerm.Trim();
            query = query.Where(question =>
                question.QuestionText.Contains(normalizedSearchTerm) ||
                (question.Title != null && question.Title.Contains(normalizedSearchTerm)) ||
                (question.AnswerText != null && question.AnswerText.Contains(normalizedSearchTerm)));
        }

        if (difficulty.HasValue)
        {
            query = query.Where(question => question.Difficulty == difficulty.Value);
        }

        if (!string.IsNullOrWhiteSpace(role))
        {
            var normalizedRole = role.Trim();
            query = query.Where(question => question.Role == normalizedRole);
        }

        var totalRecords = await query.CountAsync(cancellationToken);

        var questions = await query
            .OrderBy(question => question.Category.Name)
            .ThenBy(question => question.Title ?? question.QuestionText)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .Select(question => new QuestionDto
            {
                Id = question.Id,
                Title = question.Title,
                QuestionText = question.QuestionText,
                AnswerText = question.AnswerText,
                Difficulty = question.Difficulty,
                Role = question.Role,
                CategoryId = question.CategoryId,
                CategoryName = question.Category.Name
            })
            .ToListAsync(cancellationToken);

        if (!string.IsNullOrWhiteSpace(userId) && questions.Count > 0)
        {
            var questionIds = questions.Select(question => question.Id).ToList();
            var progressLookup = await _context.UserProgresses
                .AsNoTracking()
                .Where(progress => progress.UserId == userId && questionIds.Contains(progress.QuestionId))
                .ToDictionaryAsync(progress => progress.QuestionId, cancellationToken);

            foreach (var question in questions)
            {
                if (progressLookup.TryGetValue(question.Id, out var progress))
                {
                    question.IsSolved = progress.IsSolved;
                    question.IsRevision = progress.IsRevision;
                }
            }
        }

        return new PagedResponse<QuestionDto>
        {
            Data = questions,
            TotalRecords = totalRecords,
            PageNumber = pageNumber,
            PageSize = pageSize
        };
    }

    private async Task<List<int>> GetCategoryIdsAsync(int rootCategoryId, CancellationToken cancellationToken)
    {
        var categories = await _context.Categories
            .AsNoTracking()
            .Select(category => new CategoryFlatDto
            {
                Id = category.Id,
                ParentCategoryId = category.ParentId
            })
            .ToListAsync(cancellationToken);

        var childrenByParent = categories
            .Where(category => category.ParentCategoryId.HasValue)
            .GroupBy(category => category.ParentCategoryId!.Value)
            .ToDictionary(group => group.Key, group => group.Select(category => category.Id).ToList());

        var categoryIds = new List<int>();
        var pending = new Queue<int>();
        pending.Enqueue(rootCategoryId);

        while (pending.Count > 0)
        {
            var currentId = pending.Dequeue();
            categoryIds.Add(currentId);

            if (!childrenByParent.TryGetValue(currentId, out var children))
            {
                continue;
            }

            foreach (var childId in children)
            {
                pending.Enqueue(childId);
            }
        }

        return categoryIds;
    }
}

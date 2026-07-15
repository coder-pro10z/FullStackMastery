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
                (question.Title != null && question.Title.Contains(normalizedSearchTerm)));
        }

        if (difficulty.HasValue)
        {
            query = query.Where(question => question.Difficulty == difficulty.Value);
        }

        if (!string.IsNullOrWhiteSpace(role))
        {
            var normalizedRole = role.Trim().ToLower();
            query = query.Where(question => question.QuestionTags.Any(qt => qt.Tag.Name.ToLower() == normalizedRole));
        }

        var totalRecords = await query.CountAsync(cancellationToken);

        var dbQuestions = await query
            .Include(q => q.Answer)
            .Include(q => q.QuestionTags)
            .ThenInclude(qt => qt.Tag)
            .OrderBy(question => question.Category.Name)
            .ThenBy(question => question.Title ?? question.QuestionText)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        var jsonOptions = new System.Text.Json.JsonSerializerOptions { PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase };

        var questions = dbQuestions.Select(question => new QuestionDto
        {
            Id = question.Id,
            ExternalId = question.ExternalId,
            Title = question.Title,
            QuestionText = question.QuestionText,
            Definition = question.Answer?.Definition,
            InterviewAnswer = question.Answer?.InterviewAnswer,
            StructuredContent = question.Answer?.Content != null ? System.Text.Json.JsonSerializer.Deserialize<AnswerContentDto>(question.Answer.Content, jsonOptions) : null,
            Difficulty = question.Difficulty,
            Tags = question.QuestionTags.Select(qt => qt.Tag.Name).ToList(),
            CategoryId = question.CategoryId,
            CategoryName = question.Category.Name
        }).ToList();

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

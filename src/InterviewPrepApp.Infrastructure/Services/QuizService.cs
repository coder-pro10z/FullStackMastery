using InterviewPrepApp.Application.DTOs;
using InterviewPrepApp.Application.Interfaces;
using InterviewPrepApp.Domain.Entities;
using InterviewPrepApp.Domain.Enums;
using InterviewPrepApp.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace InterviewPrepApp.Infrastructure.Services;

public class QuizService : IQuizService
{
    private readonly ApplicationDbContext _db;

    public QuizService(ApplicationDbContext db)
    {
        _db = db;
    }

    public async Task<QuizAttemptDto> CreateAttemptAsync(CreateQuizAttemptDto dto, string userId, CancellationToken ct = default)
    {
        var query = _db.Questions.Where(q => !q.IsDeleted && q.Status == QuestionStatus.Published);

        if (dto.CategoryId.HasValue)
        {
            var categoryIds = await GetCategoryTreeIdsAsync(dto.CategoryId.Value, ct);
            query = query.Where(q => categoryIds.Contains(q.CategoryId));
        }

        if (!string.IsNullOrWhiteSpace(dto.Role))
        {
            query = query.Where(q => q.Role == dto.Role);
        }

        if (dto.Difficulty.HasValue)
        {
            query = query.Where(q => q.Difficulty == dto.Difficulty.Value);
        }

        var availableQuestions = await query
            .Select(q => new { q.Id, q.QuestionText, q.AnswerText, q.Title })
            .ToListAsync(ct);

        // Randomize
        var random = new Random();
        var selectedQuestions = availableQuestions
            .OrderBy(x => random.Next())
            .Take(dto.QuestionCount)
            .ToList();

        var attempt = new QuizAttempt
        {
            UserId = userId,
            Mode = dto.Mode,
            Status = QuizStatus.InProgress,
            StartedAt = DateTime.UtcNow,
            TotalQuestions = selectedQuestions.Count,
            CorrectCount = 0
        };

        for (int i = 0; i < selectedQuestions.Count; i++)
        {
            var sq = selectedQuestions[i];
            attempt.Questions.Add(new QuizAttemptQuestion
            {
                QuestionId = sq.Id,
                OrderIndex = i + 1,
                QuestionTextSnapshot = sq.QuestionText,
                AnswerTextSnapshot = sq.AnswerText ?? string.Empty,
                TitleSnapshot = sq.Title ?? string.Empty
            });
        }

        _db.QuizAttempts.Add(attempt);
        await _db.SaveChangesAsync(ct);

        return await GetAttemptAsync(attempt.Id, userId, ct) ?? throw new Exception("Failed to map attempt");
    }

    public async Task<QuizAttemptDto?> GetAttemptAsync(int attemptId, string userId, CancellationToken ct = default)
    {
        var attempt = await _db.QuizAttempts
            .Include(a => a.Questions)
                .ThenInclude(q => q.Response)
            .AsNoTracking()
            .FirstOrDefaultAsync(a => a.Id == attemptId && a.UserId == userId, ct);

        if (attempt == null) return null;

        return MapToDto(attempt);
    }

    public async Task<QuizAttemptDto?> SaveResponseAsync(int attemptId, int questionId, QuizAttemptResponseDto responseDto, string userId, CancellationToken ct = default)
    {
        var attempt = await _db.QuizAttempts
            .Include(a => a.Questions)
                .ThenInclude(q => q.Response)
            .FirstOrDefaultAsync(a => a.Id == attemptId && a.UserId == userId, ct);

        if (attempt == null) return null;
        if (attempt.Status != QuizStatus.InProgress) throw new InvalidOperationException("Quiz is no longer in progress");

        var question = attempt.Questions.FirstOrDefault(q => q.QuestionId == questionId);
        if (question == null) return null;

        if (question.Response == null)
        {
            question.Response = new QuizAttemptResponse
            {
                QuizAttemptQuestionId = question.Id,
                IsSelfMarkedCorrect = responseDto.IsSelfMarkedCorrect,
                AnsweredAtUtc = DateTime.UtcNow
            };
            _db.QuizAttemptResponses.Add(question.Response);
        }
        else
        {
            question.Response.IsSelfMarkedCorrect = responseDto.IsSelfMarkedCorrect;
            question.Response.AnsweredAtUtc = DateTime.UtcNow;
        }

        await _db.SaveChangesAsync(ct);

        return MapToDto(attempt);
    }

    public async Task<QuizAttemptDto?> SubmitAttemptAsync(int attemptId, string userId, CancellationToken ct = default)
    {
        var attempt = await _db.QuizAttempts
            .Include(a => a.Questions)
                .ThenInclude(q => q.Response)
            .FirstOrDefaultAsync(a => a.Id == attemptId && a.UserId == userId, ct);

        if (attempt == null) return null;
        if (attempt.Status != QuizStatus.InProgress) return MapToDto(attempt);

        attempt.Status = QuizStatus.Completed;
        attempt.CompletedAt = DateTime.UtcNow;
        attempt.CorrectCount = attempt.Questions.Count(q => q.Response?.IsSelfMarkedCorrect == true);

        await _db.SaveChangesAsync(ct);

        return MapToDto(attempt);
    }

    private QuizAttemptDto MapToDto(QuizAttempt a)
    {
        return new QuizAttemptDto
        {
            Id = a.Id,
            Mode = a.Mode.ToString(),
            Status = a.Status.ToString(),
            StartedAt = a.StartedAt,
            CompletedAt = a.CompletedAt,
            TotalQuestions = a.TotalQuestions,
            CorrectCount = a.CorrectCount,
            Questions = a.Questions.OrderBy(q => q.OrderIndex).Select(q => new QuizAttemptQuestionDto
            {
                Id = q.QuestionId,
                OrderIndex = q.OrderIndex,
                Title = q.TitleSnapshot,
                QuestionText = q.QuestionTextSnapshot,
                AnswerText = a.Mode == QuizMode.Assessment && a.Status == QuizStatus.InProgress 
                    ? null 
                    : q.AnswerTextSnapshot,
                Response = q.Response == null ? null : new QuizAttemptResponseDto
                {
                    Id = q.Response.Id,
                    IsSelfMarkedCorrect = q.Response.IsSelfMarkedCorrect,
                    AnsweredAtUtc = q.Response.AnsweredAtUtc
                }
            }).ToList()
        };
    }

    private async Task<List<int>> GetCategoryTreeIdsAsync(int rootCategoryId, CancellationToken ct)
    {
        var allCats = await _db.Categories.AsNoTracking().ToListAsync(ct);
        var ids = new HashSet<int> { rootCategoryId };
        Queue<int> toProcess = new Queue<int>();
        toProcess.Enqueue(rootCategoryId);
        while (toProcess.Count > 0)
        {
            var current = toProcess.Dequeue();
            var children = allCats.Where(c => c.ParentId == current).Select(c => c.Id);
            foreach (var child in children)
            {
                if (ids.Add(child))
                    toProcess.Enqueue(child);
            }
        }
        return ids.ToList();
    }
}

using InterviewPrepApp.Application.DTOs;
using InterviewPrepApp.Application.Interfaces;
using InterviewPrepApp.Domain.Entities;
using InterviewPrepApp.Domain.Enums;
using InterviewPrepApp.Domain.Shared;
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

    // ──────────────────────────────────────────────────────────────
    // Create Attempt — queries QuizQuestion (MCQ), not Question (long-form)
    // Resolves GAP-MCQ-01
    // ──────────────────────────────────────────────────────────────
    public async Task<Result<QuizAttemptDto>> CreateAttemptAsync(CreateQuizAttemptDto dto, string userId, CancellationToken ct = default)
    {
        var query = _db.QuizQuestions.Where(q =>
            !q.IsDeleted &&
            q.Status == QuizQuestionStatus.Published);

        if (dto.CategoryId.HasValue)
        {
            var categoryIds = await GetCategoryTreeIdsAsync(dto.CategoryId.Value, ct);
            query = query.Where(q => categoryIds.Contains(q.CategoryId!.Value));
        }

        if (!string.IsNullOrWhiteSpace(dto.Role))
            query = query.Where(q => q.Role == dto.Role);

        if (dto.Difficulty.HasValue)
            query = query.Where(q => q.Difficulty == dto.Difficulty.Value);

        var pool = await query
            .Select(q => new
            {
                q.Id,
                q.QuestionText,
                q.OptionA,
                q.OptionB,
                q.OptionC,
                q.OptionD,
                q.CorrectAnswer,
                q.Explanation
            })
            .ToListAsync(ct);

        var selected = pool
            .OrderBy(_ => Random.Shared.Next())
            .Take(dto.QuestionCount)
            .ToList();

        if (selected.Count == 0)
            return Result<QuizAttemptDto>.Failure("Insufficient active questions to generate quiz. Please check filters.");

        var attempt = new QuizAttempt
        {
            UserId = userId,
            Mode = dto.Mode,
            Status = QuizStatus.InProgress,
            StartedAt = DateTime.UtcNow,
            TotalQuestions = selected.Count,
            CorrectCount = 0
        };

        for (int i = 0; i < selected.Count; i++)
        {
            var sq = selected[i];
            attempt.Questions.Add(new QuizAttemptQuestion
            {
                QuizQuestionId = sq.Id,
                OrderIndex = i + 1,
                QuestionTextSnapshot = sq.QuestionText,
                OptionASnapshot = sq.OptionA,
                OptionBSnapshot = sq.OptionB,
                OptionCSnapshot = sq.OptionC,
                OptionDSnapshot = sq.OptionD,
                ExplanationSnapshot = sq.Explanation ?? string.Empty,
                CorrectAnswerSnapshot = sq.CorrectAnswer  // stored server-side only
            });
        }

        _db.QuizAttempts.Add(attempt);
        await _db.SaveChangesAsync(ct);

        var dto2 = await GetAttemptAsync(attempt.Id, userId, ct);
        return dto2 != null
            ? Result<QuizAttemptDto>.Success(dto2)
            : Result<QuizAttemptDto>.Failure("Failed to map attempt.");
    }

    // ──────────────────────────────────────────────────────────────
    // Get Attempt
    // ──────────────────────────────────────────────────────────────
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

    // ──────────────────────────────────────────────────────────────
    // Submit Answer — server evaluates correctness against snapshot
    // Resolves GAP-MCQ-03
    // ──────────────────────────────────────────────────────────────
    public async Task<Result<QuizAttemptDto>> SubmitAnswerAsync(
        int attemptId, int questionId, SubmitAnswerDto dto, string userId, CancellationToken ct = default)
    {
        var attempt = await _db.QuizAttempts
            .Include(a => a.Questions)
                .ThenInclude(q => q.Response)
            .FirstOrDefaultAsync(a => a.Id == attemptId && a.UserId == userId, ct);

        if (attempt == null)
            return Result<QuizAttemptDto>.Failure("Attempt not found.");

        if (attempt.Status != QuizStatus.InProgress)
            return Result<QuizAttemptDto>.Failure("Quiz is no longer in progress.");

        var question = attempt.Questions.FirstOrDefault(q => q.Id == questionId);
        if (question == null)
            return Result<QuizAttemptDto>.Failure("Question not found in this attempt.");

        // Gate: if already answered correctly, do not allow re-submission
        if (question.Response?.IsCorrect == true)
            return Result<QuizAttemptDto>.Failure("Question already answered correctly.");

        var key = dto.SelectedAnswer.Trim().ToUpperInvariant();
        var isCorrect = string.Equals(key, question.CorrectAnswerSnapshot, StringComparison.OrdinalIgnoreCase);

        if (question.Response == null)
        {
            question.Response = new QuizAttemptResponse
            {
                QuizAttemptQuestionId = question.Id,
                SelectedAnswer = key,
                IsCorrect = isCorrect,
                AnsweredAtUtc = DateTime.UtcNow
            };
            _db.QuizAttemptResponses.Add(question.Response);
        }
        else
        {
            // Wrong attempt — update with latest wrong key
            question.Response.SelectedAnswer = key;
            question.Response.IsCorrect = isCorrect;
            question.Response.AnsweredAtUtc = DateTime.UtcNow;
        }

        await _db.SaveChangesAsync(ct);
        return Result<QuizAttemptDto>.Success(MapToDto(attempt));
    }

    // ──────────────────────────────────────────────────────────────
    // Submit Quiz (finalize)
    // ──────────────────────────────────────────────────────────────
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
        attempt.CorrectCount = attempt.Questions.Count(q => q.Response?.IsCorrect == true);

        await _db.SaveChangesAsync(ct);
        return MapToDto(attempt);
    }

    // ──────────────────────────────────────────────────────────────
    // Mapping
    // ──────────────────────────────────────────────────────────────
    private static QuizAttemptDto MapToDto(QuizAttempt a)
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
                Id = q.Id,
                OrderIndex = q.OrderIndex,
                QuestionText = q.QuestionTextSnapshot,
                OptionA = q.OptionASnapshot,
                OptionB = q.OptionBSnapshot,
                OptionC = q.OptionCSnapshot,
                OptionD = q.OptionDSnapshot,
                // Explanation revealed only after the user answers correctly
                Explanation = q.Response?.IsCorrect == true ? q.ExplanationSnapshot : null,
                // CorrectAnswerSnapshot is NEVER mapped into the DTO
                Response = q.Response == null ? null : new QuizAttemptResponseDto
                {
                    Id = q.Response.Id,
                    SelectedAnswer = q.Response.SelectedAnswer,
                    IsCorrect = q.Response.IsCorrect,
                    AnsweredAtUtc = q.Response.AnsweredAtUtc
                }
            }).ToList()
        };
    }

    // ──────────────────────────────────────────────────────────────
    // Helpers
    // ──────────────────────────────────────────────────────────────
    private async Task<List<int>> GetCategoryTreeIdsAsync(int rootCategoryId, CancellationToken ct)
    {
        var allCats = await _db.Categories.AsNoTracking().ToListAsync(ct);
        var ids = new HashSet<int> { rootCategoryId };
        var toProcess = new Queue<int>();
        toProcess.Enqueue(rootCategoryId);

        while (toProcess.Count > 0)
        {
            var current = toProcess.Dequeue();
            foreach (var child in allCats.Where(c => c.ParentId == current).Select(c => c.Id))
            {
                if (ids.Add(child))
                    toProcess.Enqueue(child);
            }
        }
        return ids.ToList();
    }

    public Task<QuizAttemptDto?> SaveResponseAsync(int attemptId, int questionId, QuizAttemptResponseDto responseDto, string userId, CancellationToken ct = default)
    {
        throw new NotImplementedException();
    }
}


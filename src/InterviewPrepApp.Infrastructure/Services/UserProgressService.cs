using InterviewPrepApp.Application.DTOs;
using InterviewPrepApp.Application.Interfaces;
using InterviewPrepApp.Domain.Entities;
using InterviewPrepApp.Domain.Enums;
using InterviewPrepApp.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace InterviewPrepApp.Infrastructure.Services;

public class UserProgressService(ApplicationDbContext context) : IUserProgressService
{
    private readonly ApplicationDbContext _context = context;

    public async Task<ProgressSummaryDto> GetSummaryAsync(string userId, CancellationToken cancellationToken = default)
    {
        var totalQuestions = await _context.Questions.CountAsync(cancellationToken);

        var solvedQuestionIds = await _context.UserProgresses
            .AsNoTracking()
            .Where(progress => progress.UserId == userId && progress.IsSolved)
            .Select(progress => progress.QuestionId)
            .ToListAsync(cancellationToken);

        var questionDifficulties = await _context.Questions
            .AsNoTracking()
            .Select(question => question.Difficulty)
            .ToListAsync(cancellationToken);

        var solvedDifficulties = await _context.Questions
            .AsNoTracking()
            .Where(question => solvedQuestionIds.Contains(question.Id))
            .Select(question => question.Difficulty)
            .ToListAsync(cancellationToken);

        return new ProgressSummaryDto
        {
            TotalQuestions = totalQuestions,
            TotalSolved = solvedQuestionIds.Count,
            EasyTotal = questionDifficulties.Count(difficulty => difficulty == Difficulty.Easy),
            EasySolved = solvedDifficulties.Count(difficulty => difficulty == Difficulty.Easy),
            MediumTotal = questionDifficulties.Count(difficulty => difficulty == Difficulty.Medium),
            MediumSolved = solvedDifficulties.Count(difficulty => difficulty == Difficulty.Medium),
            HardTotal = questionDifficulties.Count(difficulty => difficulty == Difficulty.Hard),
            HardSolved = solvedDifficulties.Count(difficulty => difficulty == Difficulty.Hard)
        };
    }

    public Task<UserProgressStateDto> ToggleSolvedAsync(string userId, int questionId, CancellationToken cancellationToken = default)
    {
        return ToggleAsync(
            userId,
            questionId,
            progress => progress.IsSolved = !progress.IsSolved,
            cancellationToken);
    }

    public Task<UserProgressStateDto> ToggleRevisionAsync(string userId, int questionId, CancellationToken cancellationToken = default)
    {
        return ToggleAsync(
            userId,
            questionId,
            progress => progress.IsRevision = !progress.IsRevision,
            cancellationToken);
    }

    private async Task<UserProgressStateDto> ToggleAsync(
        string userId,
        int questionId,
        Action<UserProgress> updateProgress,
        CancellationToken cancellationToken)
    {
        var questionExists = await _context.Questions
            .AsNoTracking()
            .AnyAsync(question => question.Id == questionId, cancellationToken);

        if (!questionExists)
        {
            throw new KeyNotFoundException($"Question with id {questionId} was not found.");
        }

        var progress = await _context.UserProgresses
            .SingleOrDefaultAsync(
                item => item.UserId == userId && item.QuestionId == questionId,
                cancellationToken);

        if (progress is null)
        {
            progress = new UserProgress
            {
                UserId = userId,
                QuestionId = questionId
            };

            _context.UserProgresses.Add(progress);
        }

        updateProgress(progress);

        if (!progress.IsSolved && !progress.IsRevision)
        {
            _context.UserProgresses.Remove(progress);
        }

        await _context.SaveChangesAsync(cancellationToken);

        return new UserProgressStateDto
        {
            QuestionId = questionId,
            IsSolved = progress.IsSolved,
            IsRevision = progress.IsRevision
        };
    }
}

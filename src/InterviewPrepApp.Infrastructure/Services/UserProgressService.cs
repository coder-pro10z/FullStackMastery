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
        var totalSolved = await _context.UserProgresses
            .AsNoTracking()
            .CountAsync(progress => progress.UserId == userId && progress.IsSolved, cancellationToken);

        var totalEasy = await _context.Questions
            .AsNoTracking()
            .CountAsync(question => question.Difficulty == Difficulty.Easy, cancellationToken);

        var totalMedium = await _context.Questions
            .AsNoTracking()
            .CountAsync(question => question.Difficulty == Difficulty.Medium, cancellationToken);

        var totalHard = await _context.Questions
            .AsNoTracking()
            .CountAsync(question => question.Difficulty == Difficulty.Hard, cancellationToken);

        var solvedEasy = await _context.UserProgresses
            .AsNoTracking()
            .Where(progress => progress.UserId == userId && progress.IsSolved)
            .Join(
                _context.Questions.AsNoTracking().Where(question => question.Difficulty == Difficulty.Easy),
                progress => progress.QuestionId,
                question => question.Id,
                (progress, question) => question.Id)
            .CountAsync(cancellationToken);

        var solvedMedium = await _context.UserProgresses
            .AsNoTracking()
            .Where(progress => progress.UserId == userId && progress.IsSolved)
            .Join(
                _context.Questions.AsNoTracking().Where(question => question.Difficulty == Difficulty.Medium),
                progress => progress.QuestionId,
                question => question.Id,
                (progress, question) => question.Id)
            .CountAsync(cancellationToken);

        var solvedHard = await _context.UserProgresses
            .AsNoTracking()
            .Where(progress => progress.UserId == userId && progress.IsSolved)
            .Join(
                _context.Questions.AsNoTracking().Where(question => question.Difficulty == Difficulty.Hard),
                progress => progress.QuestionId,
                question => question.Id,
                (progress, question) => question.Id)
            .CountAsync(cancellationToken);

        return new ProgressSummaryDto
        {
            TotalQuestions = totalQuestions,
            TotalSolved = Math.Max(0, totalSolved),
            EasyTotal = totalEasy,
            EasySolved = Math.Max(0, solvedEasy),
            MediumTotal = totalMedium,
            MediumSolved = Math.Max(0, solvedMedium),
            HardTotal = totalHard,
            HardSolved = Math.Max(0, solvedHard)
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

using System;
using System.Threading.Tasks;
using FluentAssertions;
using InterviewPrepApp.Application.DTOs;
using InterviewPrepApp.Domain.Entities;
using InterviewPrepApp.Domain.Enums;
using InterviewPrepApp.Infrastructure.Persistence;
using InterviewPrepApp.Infrastructure.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Xunit;

namespace InterviewPrepApp.Tests.Import;

public class QuizAttemptServiceTests : IDisposable
{
    private readonly ApplicationDbContext _db;
    private readonly ServiceProvider _serviceProvider;
    private readonly QuizService _sut;

    public QuizAttemptServiceTests()
    {
        var services = new ServiceCollection();
        var dbName = Guid.NewGuid().ToString();

        services.AddDbContext<ApplicationDbContext>(options =>
            options.UseInMemoryDatabase(databaseName: dbName));

        _serviceProvider = services.BuildServiceProvider();
        _db = _serviceProvider.GetRequiredService<ApplicationDbContext>();

        // We explicitly do NOT seed questions matching the filter
        _db.Categories.Add(new Category { Id = 1, Name = "Angular", Slug = "angular" });
        _db.Questions.Add(new Question 
        { 
            Id = 1, 
            QuestionText = "General Q", 
            Role = "Backend", 
            CategoryId = 1, 
            Difficulty = QuizQuestionDifficulty.Easy,
            Status = QuestionStatus.Published
        });
        _db.SaveChanges();

        _sut = new QuizService(_db);
    }

    [Fact]
    public async Task CreateAttemptAsync_InsufficientQuestions_ReturnsFailure()
    {
        // Arrange
        // We filter for "Frontend" questions, but DB only has "Backend"
        var dto = new CreateQuizAttemptDto
        {
            Mode = QuizMode.Practice,
            QuestionCount = 5,
            Role = "Frontend"
        };
        var userId = "test-user-123";

        // Act
        var result = await _sut.CreateAttemptAsync(dto, userId);

        // Assert
        result.IsSuccess.Should().BeFalse();
        result.ErrorMessage.Should().Contain("Insufficient active questions");
        result.Data.Should().BeNull();
        
        var attemptsInDb = await _db.QuizAttempts.CountAsync();
        attemptsInDb.Should().Be(0);
    }

    public void Dispose()
    {
        _db.Dispose();
        _serviceProvider.Dispose();
    }
}

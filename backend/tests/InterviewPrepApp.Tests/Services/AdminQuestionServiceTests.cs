using FluentAssertions;
using InterviewPrepApp.Application.DTOs.Admin;
using InterviewPrepApp.Application.Interfaces;
using InterviewPrepApp.Application.Validators;
using InterviewPrepApp.Domain.Entities;
using InterviewPrepApp.Infrastructure.Persistence;
using InterviewPrepApp.Infrastructure.Services;
using Microsoft.EntityFrameworkCore;
using Moq;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using Xunit;

namespace InterviewPrepApp.Tests.Services
{
    public class AdminQuestionServiceTests
    {
        private ApplicationDbContext GetInMemoryContext()
        {
            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;

            return new ApplicationDbContext(options);
        }

        [Fact]
        public async Task ImportAsync_OrchestratesValidationAndInsertion_Correctly()
        {
            // Arrange
            using var dbContext = GetInMemoryContext();
            var mockAudit = new Mock<IAuditLogService>();
            
            // We use a mock validator to return known validated records
            var mockValidator = new Mock<IQuestionImportValidator>();

            // Setup mock validator to return 1 valid record, 1 skipped, 1 failure
            var validationResult = new QuestionImportValidationResult
            {
                ValidRecords = new List<ValidatedQuestionRecord>
                {
                    new ValidatedQuestionRecord
                    {
                        Title = "Mock Title",
                        QuestionText = "Mock Question",
                        AnswerMarkdown = "Mock Answer",
                        Difficulty = InterviewPrepApp.Domain.Enums.Difficulty.Medium,
                        Role = "Backend",
                        CategoryId = 1
                    }
                },
                Failed = 1,
                Skipped = 1,
                Errors = new List<string> { "Mock Error" },
                Warnings = new List<string> { "Mock Warning" }
            };

            mockValidator.Setup(v => v.ValidateAsync(
                It.IsAny<IReadOnlyList<ImportQuestionRowDto>>(),
                It.IsAny<int?>(),
                It.IsAny<HashSet<string>>(),
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(validationResult);

            var service = new AdminQuestionService(dbContext, mockAudit.Object, mockValidator.Object);

            var rows = new List<ImportQuestionRowDto> { new ImportQuestionRowDto() };

            // Act: Import with dryRun = false
            var result = await service.ImportAsync(rows, 1, false, "admin123", "admin@test.com");

            // Assert
            result.Imported.Should().Be(1);
            result.Failed.Should().Be(1);
            result.Skipped.Should().Be(1);
            result.Warnings.Should().Contain("Mock Warning");
            result.Errors.Should().Contain("Mock Error");

            // Verify db insertion
            var savedQuestion = await dbContext.Questions.SingleOrDefaultAsync();
            savedQuestion.Should().NotBeNull();
            savedQuestion.QuestionText.Should().Be("Mock Question");

            // Verify audit logging
            mockAudit.Verify(a => a.LogAsync(
                "admin123",
                "admin@test.com",
                "IMPORTED",
                "Questions",
                It.IsAny<string?>(),
                It.IsAny<string?>(),
                It.Is<string>(s => s != null && s.Contains("\"Imported\":1")),
                It.IsAny<string?>(),
                It.IsAny<CancellationToken>()), Times.Once);
        }

        [Fact]
        public async Task ImportAsync_DryRun_OrchestratesValidation_WithoutInsertion()
        {
            // Arrange
            using var dbContext = GetInMemoryContext();
            var mockAudit = new Mock<IAuditLogService>();
            var mockValidator = new Mock<IQuestionImportValidator>();

            var validationResult = new QuestionImportValidationResult
            {
                ValidRecords = new List<ValidatedQuestionRecord>
                {
                    new ValidatedQuestionRecord
                    {
                        QuestionText = "Mock Question",
                        Role = "Backend"
                    }
                }
            };

            mockValidator.Setup(v => v.ValidateAsync(
                It.IsAny<IReadOnlyList<ImportQuestionRowDto>>(),
                It.IsAny<int?>(),
                It.IsAny<HashSet<string>>(),
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(validationResult);

            var service = new AdminQuestionService(dbContext, mockAudit.Object, mockValidator.Object);

            var rows = new List<ImportQuestionRowDto> { new ImportQuestionRowDto() };

            // Act: dryRun = true
            var result = await service.ImportAsync(rows, 1, true, "admin123", "admin@test.com");

            // Assert
            result.Imported.Should().Be(1); // shows what WOULD be imported
            result.IsDryRun.Should().BeTrue();

            // Verify NO db insertion
            var count = await dbContext.Questions.CountAsync();
            count.Should().Be(0);

            // Verify NO audit logging
            mockAudit.Verify(a => a.LogAsync(
                It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>(),
                It.IsAny<string?>(), It.IsAny<string?>(), It.IsAny<string?>(), It.IsAny<string?>(), 
                It.IsAny<CancellationToken>()), Times.Never);
        }
    }
}

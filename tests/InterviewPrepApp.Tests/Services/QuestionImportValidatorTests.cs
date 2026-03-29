using FluentAssertions;
using InterviewPrepApp.Application.DTOs.Admin;
using InterviewPrepApp.Domain.Entities;
using InterviewPrepApp.Infrastructure.Persistence;
using InterviewPrepApp.Infrastructure.Services;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Threading.Tasks;
using Xunit;

namespace InterviewPrepApp.Tests.Services
{
    public class QuestionImportValidatorTests
    {
        private ApplicationDbContext GetInMemoryContext()
        {
            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;

            var dbContext = new ApplicationDbContext(options);
            
            // Seed a category
            dbContext.Categories.Add(new Category 
            { 
                Id = 1, 
                Name = "C#", 
                Slug = "csharp" 
            });
            dbContext.SaveChanges();

            return dbContext;
        }

        [Fact]
        public async Task ValidateAsync_ValidRow_ReturnsValidRecord()
        {
            // Arrange
            using var dbContext = GetInMemoryContext();
            var validator = new QuestionImportValidator(dbContext);

            var rows = new List<ImportQuestionRowDto>
            {
                new ImportQuestionRowDto
                {
                    QuestionText = "What is polymorphism?",
                    Role = "Backend",
                    Difficulty = "Hard",
                    CategorySlug = "csharp"
                }
            };

            var existingFingerprints = new HashSet<string>();

            // Act
            var result = await validator.ValidateAsync(rows, null, existingFingerprints);

            // Assert
            result.Failed.Should().Be(0);
            result.Skipped.Should().Be(0);
            result.ValidRecords.Should().HaveCount(1);
            result.ValidRecords[0].QuestionText.Should().Be("What is polymorphism?");
            result.ValidRecords[0].Difficulty.Should().Be(InterviewPrepApp.Domain.Enums.Difficulty.Hard);
            result.ValidRecords[0].CategoryId.Should().Be(1);
        }

        [Fact]
        public async Task ValidateAsync_MissingQuestionText_FailsAndSkipsRow()
        {
            // Arrange
            using var dbContext = GetInMemoryContext();
            var validator = new QuestionImportValidator(dbContext);

            var rows = new List<ImportQuestionRowDto>
            {
                new ImportQuestionRowDto
                {
                    QuestionText = "", // Missing
                    Role = "Backend",
                }
            };

            var existingFingerprints = new HashSet<string>();

            // Act
            var result = await validator.ValidateAsync(rows, null, existingFingerprints);

            // Assert
            result.Failed.Should().Be(1);
            result.ValidRecords.Should().BeEmpty();
            result.Errors.Should().Contain(e => e.Contains("QuestionText is required"));
        }

        [Fact]
        public async Task ValidateAsync_DuplicateInSameBatch_SkipsSecondOccurrence()
        {
            // Arrange
            using var dbContext = GetInMemoryContext();
            var validator = new QuestionImportValidator(dbContext);

            var rows = new List<ImportQuestionRowDto>
            {
                new ImportQuestionRowDto
                {
                    QuestionText = "Duplicate Question",
                    Role = "Backend",
                    CategorySlug = "csharp"
                },
                new ImportQuestionRowDto
                {
                    QuestionText = "Duplicate Question",
                    Role = "Backend",
                    CategorySlug = "csharp"
                }
            };

            var existingFingerprints = new HashSet<string>();

            // Act
            var result = await validator.ValidateAsync(rows, null, existingFingerprints);

            // Assert
            result.Skipped.Should().Be(1);
            result.ValidRecords.Should().HaveCount(1); // Only the first one succeeds
            result.Warnings.Should().Contain(w => w.Contains("Duplicate — question already exists"));
        }

        [Fact]
        public async Task ValidateAsync_DuplicateVsDatabase_SkipsOccurrence()
        {
            // Arrange
            using var dbContext = GetInMemoryContext();
            var validator = new QuestionImportValidator(dbContext);

            var duplicateFingerprint = QuestionImportValidator.ComputeFingerprint("Existing Question", "FullStack");
            var existingFingerprints = new HashSet<string> { duplicateFingerprint };

            var rows = new List<ImportQuestionRowDto>
            {
                new ImportQuestionRowDto
                {
                    QuestionText = "Existing Question",
                    Role = "FullStack", // Matches fingerprint
                    CategorySlug = "csharp"
                }
            };

            // Act
            var result = await validator.ValidateAsync(rows, null, existingFingerprints);

            // Assert
            result.Skipped.Should().Be(1);
            result.ValidRecords.Should().BeEmpty();
            result.Warnings.Should().Contain(w => w.Contains("Duplicate — question already exists in database"));
        }

        [Fact]
        public async Task ValidateAsync_CategoryNotFound_WithDefault_UsesDefault()
        {
            // Arrange
            using var dbContext = GetInMemoryContext();
            var validator = new QuestionImportValidator(dbContext);

            var rows = new List<ImportQuestionRowDto>
            {
                new ImportQuestionRowDto
                {
                    QuestionText = "Valid",
                    Role = "Backend",
                    CategorySlug = "unknown-slug"
                }
            };

            var existingFingerprints = new HashSet<string>();

            // Act
            var result = await validator.ValidateAsync(rows, defaultCategoryId: 1, existingFingerprints);

            // Assert
            result.Failed.Should().Be(0);
            result.ValidRecords.Should().HaveCount(1);
            result.ValidRecords[0].CategoryId.Should().Be(1);
            result.Warnings.Should().Contain(w => w.Contains("not found — using default"));
        }

        [Fact]
        public async Task ValidateAsync_CategoryNotFound_NoDefault_Fails()
        {
            // Arrange
            using var dbContext = GetInMemoryContext();
            var validator = new QuestionImportValidator(dbContext);

            var rows = new List<ImportQuestionRowDto>
            {
                new ImportQuestionRowDto
                {
                    QuestionText = "Valid",
                    Role = "Backend",
                    CategorySlug = "unknown-slug"
                }
            };

            var existingFingerprints = new HashSet<string>();

            // Act
            var result = await validator.ValidateAsync(rows, defaultCategoryId: null, existingFingerprints);

            // Assert
            result.Failed.Should().Be(1);
            result.ValidRecords.Should().BeEmpty();
            result.Errors.Should().Contain(e => e.Contains("not found and no default set"));
        }
    }
}

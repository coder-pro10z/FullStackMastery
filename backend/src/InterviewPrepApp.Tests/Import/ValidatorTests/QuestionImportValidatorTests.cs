using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using FluentAssertions;
using InterviewPrepApp.Application.DTOs.Admin;
using InterviewPrepApp.Domain.Entities;
using InterviewPrepApp.Domain.Enums;
using InterviewPrepApp.Infrastructure.Persistence;
using InterviewPrepApp.Infrastructure.Services;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace InterviewPrepApp.Tests.Import.ValidatorTests;

public class QuestionImportValidatorTests
{
    private readonly ApplicationDbContext _dbContext;
    private readonly QuestionImportValidator _sut;
    private readonly HashSet<string> _existingFingerprints;

    public QuestionImportValidatorTests()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;
        
        _dbContext = new ApplicationDbContext(options);
        
        // Seed categories
        _dbContext.Categories.Add(new Category { Id = 1, Name = "C#", Slug = "csharp" });
        _dbContext.Categories.Add(new Category { Id = 2, Name = "SQL", Slug = "sql" });
        _dbContext.SaveChanges();

        _sut = new QuestionImportValidator(_dbContext);
        _existingFingerprints = new HashSet<string>(StringComparer.Ordinal);
    }

    [Fact]
    public void ComputeFingerprint_SameInputDifferentCase_SameResult()
    {
        var f1 = QuestionImportValidator.ComputeFingerprint("What is Dependency Injection?", "Backend");
        var f2 = QuestionImportValidator.ComputeFingerprint("what is dependency injection?", "BACKEND");

        f1.Should().Be(f2);
        f1.Length.Should().Be(16);
    }

    [Fact]
    public async Task ValidateAsync_EmptyQuestionText_AddsErrorAndIncrementsFailed()
    {
        var rows = new List<ImportQuestionRowDto>
        {
            new() { QuestionText = "", Role = "Backend", CategorySlug = "csharp" }
        };

        var result = await _sut.ValidateAsync(rows, defaultCategoryId: 1, _existingFingerprints, CancellationToken.None);

        result.ValidRecords.Should().BeEmpty();
        result.Failed.Should().Be(1);
        result.Errors.Should().ContainSingle(e => e.Contains("QuestionText is required"));
    }

    [Fact]
    public async Task ValidateAsync_EmptyRole_NormalisedToGeneral()
    {
        var rows = new List<ImportQuestionRowDto>
        {
            new() { QuestionText = "Valid Question", Role = "", CategorySlug = "csharp" }
        };

        var result = await _sut.ValidateAsync(rows, defaultCategoryId: 1, _existingFingerprints, CancellationToken.None);

        result.ValidRecords.Should().ContainSingle();
        result.ValidRecords.First().Role.Should().Be("General");
    }

    [Fact]
    public async Task ValidateAsync_DuplicateWithinFile_SkippedWithWarning()
    {
        var rows = new List<ImportQuestionRowDto>
        {
            new() { QuestionText = "Same Question", Role = "Backend", CategorySlug = "csharp" },
            new() { QuestionText = "same QUESTION", Role = "BACKEND", CategorySlug = "csharp" }
        };

        var result = await _sut.ValidateAsync(rows, defaultCategoryId: 1, _existingFingerprints, CancellationToken.None);

        result.ValidRecords.Should().ContainSingle();
        result.Skipped.Should().Be(1);
        result.Warnings.Should().ContainSingle(w => w.Contains("appears earlier in this file"));
    }

    [Fact]
    public async Task ValidateAsync_DuplicateInDb_SkippedWithWarning()
    {
        var fingerprint = QuestionImportValidator.ComputeFingerprint("Existing Db Question", "Backend");
        _existingFingerprints.Add(fingerprint);

        var rows = new List<ImportQuestionRowDto>
        {
            new() { QuestionText = "Existing Db Question", Role = "Backend", CategorySlug = "csharp" }
        };

        var result = await _sut.ValidateAsync(rows, defaultCategoryId: 1, _existingFingerprints, CancellationToken.None);

        result.ValidRecords.Should().BeEmpty();
        result.Skipped.Should().Be(1);
        result.Warnings.Should().ContainSingle(w => w.Contains("already exists in database"));
    }

    [Fact]
    public async Task ValidateAsync_UnknownDifficulty_DefaultsToMediumWithWarning()
    {
        var rows = new List<ImportQuestionRowDto>
        {
            new() { QuestionText = "Q1", Difficulty = "SuperHard", CategorySlug = "csharp" }
        };

        var result = await _sut.ValidateAsync(rows, defaultCategoryId: 1, _existingFingerprints, CancellationToken.None);

        result.ValidRecords.First().Difficulty.Should().Be(Difficulty.Medium);
        result.Warnings.Should().ContainSingle(w => w.Contains("Unknown difficulty"));
    }

    [Fact]
    public async Task ValidateAsync_KnownCategorySlug_ResolvesCorrectly()
    {
        var rows = new List<ImportQuestionRowDto>
        {
            new() { QuestionText = "Q1", CategorySlug = "sql" } // Seeded ID 2
        };

        var result = await _sut.ValidateAsync(rows, defaultCategoryId: 1, _existingFingerprints, CancellationToken.None);

        result.ValidRecords.First().CategoryId.Should().Be(2); 
        result.Errors.Should().BeEmpty();
    }

    [Fact]
    public async Task ValidateAsync_UnknownSlugWithDefault_UsesDefault_AddsWarning()
    {
        var rows = new List<ImportQuestionRowDto>
        {
            new() { QuestionText = "Q1", CategorySlug = "unknown-category" } 
        };

        var result = await _sut.ValidateAsync(rows, defaultCategoryId: 1, _existingFingerprints, CancellationToken.None);

        result.ValidRecords.First().CategoryId.Should().Be(1); 
        result.Warnings.Should().ContainSingle(w => w.Contains("not found — using default"));
    }

    [Fact]
    public async Task ValidateAsync_UnknownSlugNoDefault_AddsErrorAndIncrementsFailed()
    {
        var rows = new List<ImportQuestionRowDto>
        {
            new() { QuestionText = "Q1", CategorySlug = "unknown-category" } 
        };

        var result = await _sut.ValidateAsync(rows, defaultCategoryId: null, _existingFingerprints, CancellationToken.None);

        result.ValidRecords.Should().BeEmpty();
        result.Failed.Should().Be(1);
        result.Errors.Should().ContainSingle(e => e.Contains("not found and no default set"));
    }
}

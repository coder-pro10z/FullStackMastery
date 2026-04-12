using System;
using System.IO;
using System.Linq;
using System.Threading;
using System.Threading.Channels;
using System.Threading.Tasks;
using ClosedXML.Excel;
using FluentAssertions;
using InterviewPrepApp.Domain.Entities;
using InterviewPrepApp.Domain.Enums;
using InterviewPrepApp.Infrastructure.Persistence;
using InterviewPrepApp.Infrastructure.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging.Abstractions;
using Xunit;

namespace InterviewPrepApp.Tests.Import.IntegrationTests;

public class ImportBackgroundWorkerTests : IDisposable
{
    private readonly ApplicationDbContext _db;
    private readonly ServiceProvider _serviceProvider;
    private readonly Channel<Guid> _channel;
    private readonly ImportBackgroundWorker _sut;
    private readonly string _tempFilePrefix = "test_import_";

    public ImportBackgroundWorkerTests()
    {
        var services = new ServiceCollection();
        
        // In-memory DB
        var dbName = Guid.NewGuid().ToString();
        services.AddDbContext<ApplicationDbContext>(options =>
            options.UseInMemoryDatabase(databaseName: dbName));
            
        _serviceProvider = services.BuildServiceProvider();
        _db = _serviceProvider.GetRequiredService<ApplicationDbContext>();

        // Seed Categories
        _db.Categories.Add(new Category { Id = 1, Name = "C#", Slug = "csharp" });
        _db.Categories.Add(new Category { Id = 2, Name = "SQL", Slug = "sql" });
        _db.SaveChanges();

        _channel = Channel.CreateUnbounded<Guid>();

        var scopeFactory = _serviceProvider.GetRequiredService<IServiceScopeFactory>();
        _sut = new ImportBackgroundWorker(_channel.Reader, scopeFactory, NullLogger<ImportBackgroundWorker>.Instance);
    }

    private string CreateTestExcelFile(Action<IXLWorksheet> configureSheet)
    {
        var path = Path.Combine(Path.GetTempPath(), $"{_tempFilePrefix}{Guid.NewGuid()}.xlsx");
        using var workbook = new XLWorkbook();
        var ws = workbook.Worksheets.Add("Sheet1");
        configureSheet(ws);
        workbook.SaveAs(path);
        return path;
    }

    [Fact]
    public async Task ProcessJobAsync_ValidQuestionFile_SetsStatusCompleted_AndInsertsData()
    {
        // Arrange
        var tempFile = CreateTestExcelFile(ws =>
        {
            ws.Cell(1, 1).Value = "QuestionText";
            ws.Cell(1, 2).Value = "Role";
            ws.Cell(1, 3).Value = "Difficulty";
            ws.Cell(1, 4).Value = "CategorySlug";
            ws.Cell(1, 5).Value = "AnswerText";

            ws.Cell(2, 1).Value = "What is LINQ?";
            ws.Cell(2, 2).Value = "Backend";
            ws.Cell(2, 3).Value = "Medium";
            ws.Cell(2, 4).Value = "csharp";
            ws.Cell(2, 5).Value = "Language Integrated Query";
        });

        var job = new ImportJob
        {
            Id = Guid.NewGuid(),
            Type = ImportJobType.Question,
            Status = ImportJobStatus.Queued,
            TempFilePath = tempFile,
            DefaultCategoryId = 1,
            UploadedAtUtc = DateTime.UtcNow
        };
        _db.ImportJobs.Add(job);
        await _db.SaveChangesAsync();

        await _channel.Writer.WriteAsync(job.Id);
        _channel.Writer.Complete();

        // Act
        // Run worker until the channel is empty and complete
        await _sut.StartAsync(CancellationToken.None);
        if (_sut.ExecuteTask != null)
        {
            await _sut.ExecuteTask;
        }
        await _sut.StopAsync(CancellationToken.None);

        // Assert
        var resultJob = await _db.ImportJobs.AsNoTracking().FirstAsync(j => j.Id == job.Id);
        resultJob.Status.Should().Be(ImportJobStatus.Completed);
        resultJob.ProcessedRows.Should().Be(1);
        resultJob.FailedRows.Should().Be(0);

        var questions = await _db.Questions.ToListAsync();
        questions.Should().HaveCount(1);
        questions[0].QuestionText.Should().Be("What is LINQ?");
        questions[0].CategoryId.Should().Be(1);

        File.Exists(tempFile).Should().BeFalse("Temp file should be deleted after processing");
    }

    [Fact]
    public async Task ProcessJobAsync_MissingTempFile_SetsStatusFailed()
    {
        // Arrange
        var job = new ImportJob
        {
            Id = Guid.NewGuid(),
            Type = ImportJobType.Question,
            Status = ImportJobStatus.Queued,
            TempFilePath = "does_not_exist.xlsx",
            DefaultCategoryId = 1
        };
        _db.ImportJobs.Add(job);
        await _db.SaveChangesAsync();

        await _channel.Writer.WriteAsync(job.Id);
        _channel.Writer.Complete();

        // Act
        await _sut.StartAsync(CancellationToken.None);
        if (_sut.ExecuteTask != null)
        {
            await _sut.ExecuteTask;
        }
        await _sut.StopAsync(CancellationToken.None);

        // Assert
        var resultJob = await _db.ImportJobs.AsNoTracking().FirstAsync(j => j.Id == job.Id);
        resultJob.Status.Should().Be(ImportJobStatus.Failed);
    }

    [Fact]
    public async Task ProcessJobAsync_PartialValidQuizFile_SetsStatusPartiallyCompleted()
    {
        // Arrange
        var tempFile = CreateTestExcelFile(ws =>
        {
            ws.Cell(1, 1).Value = "QuestionText";
            ws.Cell(1, 2).Value = "OptionA";
            ws.Cell(1, 3).Value = "OptionB";
            ws.Cell(1, 4).Value = "OptionC";
            ws.Cell(1, 5).Value = "OptionD";
            ws.Cell(1, 6).Value = "CorrectAnswer";

            // Valid row
            ws.Cell(2, 1).Value = "Valid Q";
            ws.Cell(2, 2).Value = "1";
            ws.Cell(2, 3).Value = "2";
            ws.Cell(2, 4).Value = "3";
            ws.Cell(2, 5).Value = "4";
            ws.Cell(2, 6).Value = "A";

            // Invalid row
            ws.Cell(3, 1).Value = "Invalid Q";
            // Missing all other columns causes error
        });

        var job = new ImportJob
        {
            Id = Guid.NewGuid(),
            Type = ImportJobType.Quiz,
            Status = ImportJobStatus.Queued,
            TempFilePath = tempFile,
            DefaultCategoryId = 1
        };
        _db.ImportJobs.Add(job);
        await _db.SaveChangesAsync();

        await _channel.Writer.WriteAsync(job.Id);
        _channel.Writer.Complete();

        // Act
        await _sut.StartAsync(CancellationToken.None);
        if (_sut.ExecuteTask != null)
        {
            await _sut.ExecuteTask;
        }
        await _sut.StopAsync(CancellationToken.None);

        // Assert
        var resultJob = await _db.ImportJobs.AsNoTracking().FirstAsync(j => j.Id == job.Id);
        resultJob.Status.Should().Be(ImportJobStatus.PartiallyCompleted);
        resultJob.ProcessedRows.Should().Be(1);
        resultJob.FailedRows.Should().BeGreaterThan(0);
        resultJob.ErrorSummaryJson.Should().NotBeNullOrWhiteSpace();

        var questions = await _db.QuizQuestions.ToListAsync();
        questions.Should().HaveCount(1);
        questions[0].QuestionText.Should().Be("Valid Q");
    }

    public void Dispose()
    {
        _db.Dispose();
        _serviceProvider.Dispose();
        // Clean up any stray temp files just in case
        foreach (var file in Directory.GetFiles(Path.GetTempPath(), $"{_tempFilePrefix}*"))
        {
            try { File.Delete(file); } catch { }
        }
    }
}

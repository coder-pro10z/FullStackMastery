using System;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using ClosedXML.Excel;
using FluentAssertions;
using InterviewPrepApp.Infrastructure.Persistence;
using InterviewPrepApp.Infrastructure.Services;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace InterviewPrepApp.Tests.Import.ParserTests;

public class ExcelExtractionServiceTests
{
    private readonly ApplicationDbContext _dbContext;
    private readonly ExcelExtractionService _sut;

    public ExcelExtractionServiceTests()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;
        _dbContext = new ApplicationDbContext(options);
        _sut = new ExcelExtractionService(_dbContext);
    }

    private Stream CreateExcelStream(Action<IXLWorksheet> configureSheet)
    {
        var workbook = new XLWorkbook();
        var ws = workbook.Worksheets.Add("Sheet1");
        configureSheet(ws);

        var ms = new MemoryStream();
        workbook.SaveAs(ms);
        ms.Position = 0;
        return ms;
    }

    [Fact]
    public void ExtractImportRows_EmptyStream_ReturnsFatal()
    {
        // Arrange
        using var stream = CreateExcelStream(ws => { }); // No rows

        // Act
        var result = _sut.ExtractImportRows(stream);

        // Assert
        result.IsFatalError.Should().BeTrue();
        result.FatalErrorMessage.Should().Contain("Excel file is empty");
    }

    [Fact]
    public void ExtractImportRows_HeaderOnlyNoDataRows_ReturnsFatal()
    {
        // Arrange
        using var stream = CreateExcelStream(ws =>
        {
            ws.Cell(1, 1).Value = "QuestionText";
            ws.Cell(1, 2).Value = "Role";
        });

        // Act
        var result = _sut.ExtractImportRows(stream);

        // Assert
        result.IsFatalError.Should().BeTrue();
        result.FatalErrorMessage.Should().Contain("Excel file has a header but no data rows");
    }

    [Fact]
    public void ExtractImportRows_MissingQuestionColumn_ReturnsFatal()
    {
        // Arrange
        using var stream = CreateExcelStream(ws =>
        {
            ws.Cell(1, 1).Value = "AnyColumn";
            ws.Cell(1, 2).Value = "Role";
            ws.Cell(2, 1).Value = "data";
            ws.Cell(2, 2).Value = "data2";
        });

        // Act
        var result = _sut.ExtractImportRows(stream);

        // Assert
        result.IsFatalError.Should().BeTrue();
        result.FatalErrorMessage.Should().Contain("Missing required column: QuestionText");
    }

    [Fact]
    public void ExtractImportRows_ValidFile_ReturnsOkWithRows()
    {
        // Arrange
        using var stream = CreateExcelStream(ws =>
        {
            ws.Cell(1, 1).Value = "QuestionText";
            ws.Cell(1, 2).Value = "Role";
            ws.Cell(1, 3).Value = "Difficulty";
            ws.Cell(1, 4).Value = "AnswerText";

            ws.Cell(2, 1).Value = "What is C#?";
            ws.Cell(2, 2).Value = "Backend";
            ws.Cell(2, 3).Value = "Hard";
            ws.Cell(2, 4).Value = "A language";
        });

        // Act
        var result = _sut.ExtractImportRows(stream);

        // Assert
        result.IsFatalError.Should().BeFalse();
        result.Rows.Should().HaveCount(1);
        var row = result.Rows.First();
        row.QuestionText.Should().Be("What is C#?");
        row.Role.Should().Be("Backend");
        row.Difficulty.Should().Be("Hard");
        row.AnswerMarkdown.Should().Be("A language");
        result.Diagnostics.Should().BeEmpty();
    }

    [Fact]
    public void ExtractImportRows_EmptyRoleCell_DefaultsToGeneralWithWarning()
    {
        // Arrange
        using var stream = CreateExcelStream(ws =>
        {
            ws.Cell(1, 1).Value = "QuestionText";
            ws.Cell(1, 2).Value = "Role";

            ws.Cell(2, 1).Value = "Q1";
            ws.Cell(2, 2).Value = ""; // Empty role
        });

        // Act
        var result = _sut.ExtractImportRows(stream);

        // Assert
        result.IsFatalError.Should().BeFalse();
        result.Rows.First().Role.Should().Be("General");
        result.Diagnostics.Should().Contain(d => d.Message.Contains("Role is empty"));
    }

    [Fact]
    public void ExtractImportRows_BothQuestionAndRoleEmpty_RowSkipped()
    {
        // Arrange
        using var stream = CreateExcelStream(ws =>
        {
            ws.Cell(1, 1).Value = "Question";
            ws.Cell(1, 2).Value = "Role";

            ws.Cell(2, 1).Value = ""; 
            ws.Cell(2, 2).Value = ""; 

            ws.Cell(3, 1).Value = "Valid Q";
            ws.Cell(3, 2).Value = "Backend";
        });

        // Act
        var result = _sut.ExtractImportRows(stream);

        // Assert
        result.IsFatalError.Should().BeFalse();
        result.Rows.Should().HaveCount(1);
        result.Rows.First().QuestionText.Should().Be("Valid Q");
    }

    [Fact]
    public void ExtractImportRows_AnswerInNextRowLegacyFormat_Detected()
    {
        // Arrange
        using var stream = CreateExcelStream(ws =>
        {
            ws.Cell(1, 1).Value = "Question";
            ws.Cell(1, 2).Value = "Role";

            ws.Cell(2, 1).Value = "The Question is Here";
            ws.Cell(2, 2).Value = "Frontend";

            ws.Cell(3, 1).Value = "The Answer is Here";
            ws.Cell(3, 2).Value = ""; // Missing role triggers legacy logic
        });

        // Act
        var result = _sut.ExtractImportRows(stream);

        // Assert
        result.IsFatalError.Should().BeFalse();
        result.Rows.Should().HaveCount(1);
        result.Rows.First().QuestionText.Should().Be("The Question is Here");
        result.Rows.First().AnswerMarkdown.Should().Be("The Answer is Here");
        result.Diagnostics.Should().Contain(d => d.Message.Contains("Answer auto-detected"));
    }
}

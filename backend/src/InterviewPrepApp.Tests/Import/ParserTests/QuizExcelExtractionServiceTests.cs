using System;
using System.IO;
using System.Linq;
using ClosedXML.Excel;
using FluentAssertions;
using InterviewPrepApp.Infrastructure.Services;
using Xunit;

namespace InterviewPrepApp.Tests.Import.ParserTests;

public class QuizExcelExtractionServiceTests
{
    private readonly QuizExcelExtractionService _sut;

    public QuizExcelExtractionServiceTests()
    {
        _sut = new QuizExcelExtractionService();
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
    public void Extract_MissingRequiredColumns_ReturnsErrorsAndNoRows()
    {
        // Arrange
        using var stream = CreateExcelStream(ws =>
        {
            // Missing all required columns
            ws.Cell(1, 1).Value = "RandomCol";
        });

        // Act
        var (rows, errors) = _sut.Extract(stream);

        // Assert
        rows.Should().BeEmpty();
        errors.Should().Contain(e => e.Message.Contains("Required column 'questiontext' is missing"));
    }

    [Fact]
    public void Extract_ValidRowWithoutExternalId_GeneratesHashAndAddsWarning()
    {
        // Arrange
        using var stream = CreateExcelStream(ws =>
        {
            ws.Cell(1, 1).Value = "QuestionText";
            ws.Cell(1, 2).Value = "OptionA";
            ws.Cell(1, 3).Value = "OptionB";
            ws.Cell(1, 4).Value = "OptionC";
            ws.Cell(1, 5).Value = "OptionD";
            ws.Cell(1, 6).Value = "CorrectAnswer";

            ws.Cell(2, 1).Value = "What is 2+2?";
            ws.Cell(2, 2).Value = "3";
            ws.Cell(2, 3).Value = "4";
            ws.Cell(2, 4).Value = "5";
            ws.Cell(2, 5).Value = "6";
            ws.Cell(2, 6).Value = "B";
        });

        // Act
        var (rows, errors) = _sut.Extract(stream);

        // Assert
        rows.Should().HaveCount(1);
        rows[0].QuestionText.Should().Be("What is 2+2?");
        rows[0].ExternalId.Should().NotBeNullOrEmpty();
        
        errors.Should().ContainSingle(e => e.Message.Contains("ExternalId missing — auto-assigned hash"));
    }

    [Fact]
    public void Extract_InvalidCorrectAnswer_ReturnsErrorAndSkipsRow()
    {
        // Arrange
        using var stream = CreateExcelStream(ws =>
        {
            ws.Cell(1, 1).Value = "QuestionText";
            ws.Cell(1, 2).Value = "OptionA";
            ws.Cell(1, 3).Value = "OptionB";
            ws.Cell(1, 4).Value = "OptionC";
            ws.Cell(1, 5).Value = "OptionD";
            ws.Cell(1, 6).Value = "CorrectAnswer";

            ws.Cell(2, 1).Value = "Valid Q but wrong answer code";
            ws.Cell(2, 2).Value = "a";
            ws.Cell(2, 3).Value = "b";
            ws.Cell(2, 4).Value = "c";
            ws.Cell(2, 5).Value = "d";
            ws.Cell(2, 6).Value = "E"; // Invalid
        });

        // Act
        var (rows, errors) = _sut.Extract(stream);

        // Assert
        rows.Should().BeEmpty();
        errors.Should().Contain(e => e.Message.Contains("CorrectAnswer 'E' is not valid"));
    }
}

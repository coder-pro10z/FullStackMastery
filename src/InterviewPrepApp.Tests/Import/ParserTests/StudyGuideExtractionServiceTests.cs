using System;
using System.IO;
using System.Linq;
using ClosedXML.Excel;
using FluentAssertions;
using InterviewPrepApp.Infrastructure.Services;
using Xunit;

namespace InterviewPrepApp.Tests.Import.ParserTests;

public class StudyGuideExtractionServiceTests
{
    private readonly StudyGuideExtractionService _sut;

    public StudyGuideExtractionServiceTests()
    {
        _sut = new StudyGuideExtractionService();
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
            ws.Cell(1, 1).Value = "RandomCol";
            ws.Cell(1, 2).Value = "Title";
            // Content is missing
        });

        // Act
        var (rows, errors) = _sut.Extract(stream);

        // Assert
        rows.Should().BeEmpty();
        errors.Should().Contain(e => e.Message.Contains("Required column 'content' is missing"));
    }

    [Fact]
    public void Extract_EmptyTitleOrContent_ReturnsErrorAndSkipsRow()
    {
        // Arrange
        using var stream = CreateExcelStream(ws =>
        {
            ws.Cell(1, 1).Value = "Title";
            ws.Cell(1, 2).Value = "Content";

            // Title is empty
            ws.Cell(2, 1).Value = "";
            ws.Cell(2, 2).Value = "Some content";

            // Content is empty
            ws.Cell(3, 1).Value = "Some title";
            ws.Cell(3, 2).Value = "";
        });

        // Act
        var (rows, errors) = _sut.Extract(stream);

        // Assert
        rows.Should().BeEmpty();
        errors.Should().Contain(e => e.Row == 2 && e.Message.Contains("Title is required"));
        errors.Should().Contain(e => e.Row == 3 && e.Message.Contains("Content is required"));
    }

    [Fact]
    public void Extract_ValidRowWithoutExternalId_GeneratesHash()
    {
        // Arrange
        using var stream = CreateExcelStream(ws =>
        {
            ws.Cell(1, 1).Value = "Title";
            ws.Cell(1, 2).Value = "Content";

            ws.Cell(2, 1).Value = "Dependency Injection";
            ws.Cell(2, 2).Value = "DI makes code testable.";
        });

        // Act
        var (rows, errors) = _sut.Extract(stream);

        // Assert
        errors.Should().BeEmpty();
        rows.Should().HaveCount(1);
        rows[0].Title.Should().Be("Dependency Injection");
        rows[0].ExternalId.Should().NotBeNullOrEmpty();
    }

    [Fact]
    public void Extract_ValidRows_GeneratesDisplayOrderSequentially()
    {
        // Arrange
        using var stream = CreateExcelStream(ws =>
        {
            ws.Cell(1, 1).Value = "Title";
            ws.Cell(1, 2).Value = "Content";
            ws.Cell(1, 3).Value = "DisplayOrder";

            ws.Cell(2, 1).Value = "T1";
            ws.Cell(2, 2).Value = "C1";

            ws.Cell(3, 1).Value = "T2";
            ws.Cell(3, 2).Value = "C2";
            ws.Cell(3, 3).Value = "99"; // Explicit DisplayOrder
        });

        // Act
        var (rows, errors) = _sut.Extract(stream);

        // Assert
        errors.Should().BeEmpty();
        rows.Should().HaveCount(2);
        rows[0].DisplayOrder.Should().Be(1); // Auto-increment starts at 1
        rows[1].DisplayOrder.Should().Be(99); // Explicit
    }
}

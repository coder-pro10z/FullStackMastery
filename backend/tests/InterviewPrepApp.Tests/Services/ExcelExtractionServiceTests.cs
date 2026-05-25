using ClosedXML.Excel;
using FluentAssertions;
using InterviewPrepApp.Infrastructure.Persistence;
using InterviewPrepApp.Infrastructure.Services;
using Microsoft.EntityFrameworkCore;
using System;
using System.IO;
using Xunit;

namespace InterviewPrepApp.Tests.Services
{
    public class ExcelExtractionServiceTests
    {
        private readonly ExcelExtractionService _sut;
        private readonly ApplicationDbContext _dbContext;

        public ExcelExtractionServiceTests()
        {
            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;
            _dbContext = new ApplicationDbContext(options);
            _sut = new ExcelExtractionService(_dbContext);
        }

        private MemoryStream CreateEmptyExcelStream()
        {
            var ms = new MemoryStream();
            using var workbook = new XLWorkbook();
            workbook.AddWorksheet("Sheet1");
            workbook.SaveAs(ms);
            ms.Position = 0;
            return ms;
        }

        private MemoryStream CreateExcelStreamWithHeaders(params string[] headers)
        {
            var ms = new MemoryStream();
            using var workbook = new XLWorkbook();
            var ws = workbook.AddWorksheet("Sheet1");
            for (int i = 0; i < headers.Length; i++)
            {
                ws.Cell(1, i + 1).Value = headers[i];
            }
            workbook.SaveAs(ms);
            ms.Position = 0;
            return ms;
        }

        [Fact]
        public void ExtractImportRows_EmptyFile_ReturnsFatal()
        {
            // Arrange
            using var ms = CreateEmptyExcelStream();

            // Act
            var result = _sut.ExtractImportRows(ms);

            // Assert
            result.IsFatalError.Should().BeTrue();
            result.FatalErrorMessage.Should().Contain("Excel file is empty");
        }

        [Fact]
        public void ExtractImportRows_MissingRequiredHeaders_ReturnsFatal()
        {
            // Arrange
            using var ms = CreateExcelStreamWithHeaders("Title", "AnswerText");

            // Act
            var result = _sut.ExtractImportRows(ms);

            // Assert
            result.IsFatalError.Should().BeTrue();
            result.FatalErrorMessage.Should().Contain("Missing required column: QuestionText");
        }

        [Fact]
        public void ExtractImportRows_MissingRoleHeader_ReturnsFatal()
        {
            // Arrange
            using var ms = CreateExcelStreamWithHeaders("QuestionText", "AnswerText");

            // Act
            var result = _sut.ExtractImportRows(ms);

            // Assert
            result.IsFatalError.Should().BeTrue();
            result.FatalErrorMessage.Should().Contain("Missing required column: Role");
        }

        [Fact]
        public void ExtractImportRows_ValidHeadersNoData_ReturnsFatal()
        {
            // Arrange
            using var ms = CreateExcelStreamWithHeaders("QuestionText", "Role", "AnswerText");

            // Act
            var result = _sut.ExtractImportRows(ms);

            // Assert
            result.IsFatalError.Should().BeTrue();
            result.FatalErrorMessage.Should().Contain("Excel file has a header but no data rows");
        }

        [Fact]
        public void ExtractImportRows_ValidFile_ParsesCorrectlyAndProvidesDefaults()
        {
            // Arrange
            var ms = new MemoryStream();
            using (var workbook = new XLWorkbook())
            {
                var ws = workbook.AddWorksheet("Sheet1");
                ws.Cell(1, 1).Value = "Question Title"; // tests case-insensitive mapping
                ws.Cell(1, 2).Value = "Role";
                ws.Cell(1, 3).Value = "Answer"; // maps to AnswerMarkdown
                // Difficulty and Category omitted to test defaults

                // Data row 1 - fully populated with available columns
                ws.Cell(2, 1).Value = "What is LINQ?";
                ws.Cell(2, 2).Value = "Backend";
                ws.Cell(2, 3).Value = "Language Integrated Query";
                
                // Data row 2 - empty row (should be skipped entirely)
                // Data row 3 - Missing Role
                ws.Cell(4, 1).Value = "Entity Framework Core";
                ws.Cell(4, 3).Value = "ORM for .NET";

                workbook.SaveAs(ms);
            }
            ms.Position = 0;

            // Act
            var result = _sut.ExtractImportRows(ms);

            // Assert
            result.IsFatalError.Should().BeFalse();
            result.Rows.Should().HaveCount(2);

            // Row 1
            result.Rows[0].QuestionText.Should().Be("What is LINQ?");
            result.Rows[0].Role.Should().Be("Backend");
            result.Rows[0].AnswerMarkdown.Should().Be("Language Integrated Query");
            result.Rows[0].Difficulty.Should().Be("Medium"); // default

            // Row 3
            result.Rows[1].QuestionText.Should().Be("Entity Framework Core");
            result.Rows[1].Role.Should().Be("General"); // Role defaulted
            result.Rows[1].Difficulty.Should().Be("Medium"); // default

            // Diagnostics should warn about empty role and difficulty
            result.Diagnostics.Should().ContainSingle(d => d.RowNumber == 4 && d.Message.Contains("Role is empty"));
            result.Diagnostics.Should().Contain(d => d.Message.Contains("Difficulty is empty"));
        }
    }
}

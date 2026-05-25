using ClosedXML.Excel;
using InterviewPrepApp.Application.DTOs;

namespace InterviewPrepApp.Infrastructure.Services;

/// <summary>
/// Parses a Quiz MCQ Excel file and returns rows and row-level errors.
/// Does NOT interact with the database — pure extraction only.
/// </summary>
public class QuizExcelExtractionService
{
    private static readonly string[] RequiredColumns = { "questiontext", "optiona", "optionb", "optionc", "optiond", "correctanswer" };

    public (List<ImportQuizRowDto> Rows, List<RowImportErrorDto> Errors) Extract(Stream stream)
    {
        var rows = new List<ImportQuizRowDto>();
        var errors = new List<RowImportErrorDto>();

        using var workbook = new XLWorkbook(stream);
        var sheet = workbook.Worksheets.First();
        var headerRow = sheet.Row(1);
        var index = ExcelSharedUtils.BuildHeaderIndex(headerRow);

        // Header validation
        foreach (var required in RequiredColumns)
        {
            if (!index.ContainsKey(required))
            {
                errors.Add(new RowImportErrorDto
                {
                    Row = 0,
                    Column = required,
                    Message = $"Required column '{required}' is missing from the header row."
                });
            }
        }
        if (errors.Any()) return (rows, errors);

        int rowNum = 2;
        foreach (var row in sheet.RowsUsed().Skip(1))
        {
            var questionText = ExcelSharedUtils.Get(row, index, "questiontext");
            if (string.IsNullOrWhiteSpace(questionText))
            {
                // Skip entirely empty rows
                if (ExcelSharedUtils.IsRowEmpty(row, index.Values))
                {
                    rowNum++;
                    continue;
                }
                errors.Add(new RowImportErrorDto { Row = rowNum, Column = "QuestionText", Message = "QuestionText is required." });
                rowNum++;
                continue;
            }

            var correctAnswer = ExcelSharedUtils.Get(row, index, "correctanswer")?.ToUpperInvariant();
            if (correctAnswer == null || !new[] { "A", "B", "C", "D" }.Contains(correctAnswer))
            {
                errors.Add(new RowImportErrorDto
                {
                    Row = rowNum,
                    Column = "CorrectAnswer",
                    Message = $"CorrectAnswer '{ExcelSharedUtils.Get(row, index, "correctanswer")}' is not valid. Expected A, B, C, or D."
                });
                rowNum++;
                continue;
            }

            var externalId = ExcelSharedUtils.Get(row, index, "externalid");
            if (string.IsNullOrEmpty(externalId))
            {
                // Assign deterministic hash from question stem + OptionA
                externalId = Convert.ToHexString(
                    System.Security.Cryptography.SHA256.HashData(
                        System.Text.Encoding.UTF8.GetBytes($"{questionText}|{ExcelSharedUtils.Get(row, index, "optiona")}")))
                    [..16];
                errors.Add(new RowImportErrorDto
                {
                    Row = rowNum,
                    Column = "ExternalId",
                    Message = $"ExternalId missing — auto-assigned hash '{externalId}'. Provide a stable ExternalId for reliability.",
                    ExternalId = externalId
                });
            }

            rows.Add(new ImportQuizRowDto
            {
                ExternalId = externalId,
                QuestionText = questionText,
                OptionA = ExcelSharedUtils.Get(row, index, "optiona") ?? string.Empty,
                OptionB = ExcelSharedUtils.Get(row, index, "optionb") ?? string.Empty,
                OptionC = ExcelSharedUtils.Get(row, index, "optionc") ?? string.Empty,
                OptionD = ExcelSharedUtils.Get(row, index, "optiond") ?? string.Empty,
                CorrectAnswer = correctAnswer,
                Explanation = ExcelSharedUtils.Get(row, index, "explanation"),
                Category = ExcelSharedUtils.Get(row, index, "category"),
                Difficulty = ExcelSharedUtils.Get(row, index, "difficulty"),
                Role = ExcelSharedUtils.Get(row, index, "role"),
                Tags = ExcelSharedUtils.Get(row, index, "tags")
            });

            rowNum++;
        }

        return (rows, errors);
    }
}

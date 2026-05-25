using ClosedXML.Excel;
using InterviewPrepApp.Application.DTOs;

namespace InterviewPrepApp.Infrastructure.Services;

/// <summary>
/// Parses a Study Guide Excel file and returns rows and row-level errors.
/// Does NOT interact with the database — pure extraction only.
/// </summary>
public class StudyGuideExtractionService
{
    private static readonly string[] RequiredColumns = { "title", "content" };

    public (List<ImportStudyGuideRowDto> Rows, List<RowImportErrorDto> Errors) Extract(Stream stream)
    {
        var rows = new List<ImportStudyGuideRowDto>();
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
        int displayOrder = 0;
        foreach (var row in sheet.RowsUsed().Skip(1))
        {
            var title = ExcelSharedUtils.Get(row, index, "title");
            var content = ExcelSharedUtils.Get(row, index, "content");

            if (string.IsNullOrWhiteSpace(title) || string.IsNullOrWhiteSpace(content))
            {
                if (ExcelSharedUtils.IsRowEmpty(row, index.Values))
                {
                    rowNum++;
                    continue;
                }

                if (string.IsNullOrWhiteSpace(title))
                    errors.Add(new RowImportErrorDto { Row = rowNum, Column = "Title", Message = "Title is required." });
                if (string.IsNullOrWhiteSpace(content))
                    errors.Add(new RowImportErrorDto { Row = rowNum, Column = "Content", Message = "Content is required." });
                rowNum++;
                continue;
            }

            var externalId = ExcelSharedUtils.Get(row, index, "externalid");
            if (string.IsNullOrEmpty(externalId))
            {
                externalId = Convert.ToHexString(
                    System.Security.Cryptography.SHA256.HashData(
                        System.Text.Encoding.UTF8.GetBytes($"{title}")))
                    [..16];
            }

            var orderStr = ExcelSharedUtils.Get(row, index, "displayorder");
            int.TryParse(orderStr, out var explicitOrder);

            displayOrder++;
            rows.Add(new ImportStudyGuideRowDto
            {
                ExternalId = externalId,
                Title = title,
                Content = content,
                Category = ExcelSharedUtils.Get(row, index, "category"),
                Role = ExcelSharedUtils.Get(row, index, "role"),
                Tags = ExcelSharedUtils.Get(row, index, "tags"),
                DisplayOrder = explicitOrder > 0 ? explicitOrder : displayOrder
            });

            rowNum++;
        }

        return (rows, errors);
    }
}

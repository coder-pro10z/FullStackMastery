using InterviewPrepApp.Application.DTOs.Admin;
using InterviewPrepApp.Domain.Entities;
using InterviewPrepApp.Domain.Shared;

namespace InterviewPrepApp.Application.Interfaces
{
    public interface IExcelExtractor
    {
        /// <summary>
        /// Extracts a list of Question entities from an Excel stream.
        /// </summary>
        Task<Result<List<Question>>> ExtractQuestionsAsync(Stream excelStream, int defaultCategoryId);

        /// <summary>
        /// Extracts rows from an Excel stream as ImportQuestionRowDto with per-row diagnostics.
        /// </summary>
        ExcelExtractionResult ExtractImportRows(Stream excelStream);
    }

    /// <summary>
    /// Result of Excel extraction: parsed rows + per-row warnings/errors.
    /// If IsFatalError is true, the file could not be parsed at all (missing headers, empty, corrupt).
    /// </summary>
    public class ExcelExtractionResult
    {
        public bool IsFatalError { get; set; }
        public string? FatalErrorMessage { get; set; }
        public List<ImportQuestionRowDto> Rows { get; set; } = [];
        public List<ExcelRowDiagnostic> Diagnostics { get; set; } = [];

        public static ExcelExtractionResult Fatal(string message) => new()
        {
            IsFatalError = true,
            FatalErrorMessage = message
        };

        public static ExcelExtractionResult Ok(List<ImportQuestionRowDto> rows, List<ExcelRowDiagnostic> diagnostics) => new()
        {
            Rows = rows,
            Diagnostics = diagnostics
        };
    }

    public class ExcelRowDiagnostic
    {
        public int RowNumber { get; set; }
        public string Severity { get; set; } = "Warning"; // "Warning" or "Error"
        public string Message { get; set; } = string.Empty;
    }
}
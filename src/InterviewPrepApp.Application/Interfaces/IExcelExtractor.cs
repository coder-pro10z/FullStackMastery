using InterviewPrepApp.Domain.Entities;
using InterviewPrepApp.Domain.Shared;

namespace InterviewPrepApp.Application.Interfaces
{
    public interface IExcelExtractor
    {
        /// <summary>
        /// Extracts a list of Question entities from an Excel stream.
        /// </summary>
        /// <param name="excelStream">Stream containing the Excel file.</param>
        /// <param name="defaultCategoryId">Category ID to assign if sheet lacks a Category column.</param>
        /// <returns>Result containing the list of questions or an error message.</returns>
        Task<Result<List<Question>>> ExtractQuestionsAsync(Stream excelStream, int defaultCategoryId);
    }
}
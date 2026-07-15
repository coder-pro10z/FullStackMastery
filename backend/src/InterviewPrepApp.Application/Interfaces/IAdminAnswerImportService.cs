using InterviewPrepApp.Application.DTOs.Admin;
using InterviewPrepApp.Domain.Entities;

namespace InterviewPrepApp.Application.Interfaces;

public interface IAdminAnswerImportService
{
    /// <summary>
    /// Processes a batch of structured answers from answers.json.
    /// Upserts into the Answer entity based on QuestionId mapping to Question.ExternalId.
    /// </summary>
    Task<ImportLog> ImportAsync(
        IEnumerable<ImportAnswerRowDto> rows,
        bool dryRun,
        string userId,
        string userEmail,
        CancellationToken ct = default);
}

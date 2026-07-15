using InterviewPrepApp.Application.DTOs.Admin;
using Microsoft.AspNetCore.Http;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace InterviewPrepApp.Infrastructure.Services;

public interface IAnswerExtractionService
{
    Task<List<ImportAnswerRowDto>> ExtractFromJsonAsync(IFormFile file, CancellationToken ct = default);
}

public class AnswerExtractionService : IAnswerExtractionService
{
    public async Task<List<ImportAnswerRowDto>> ExtractFromJsonAsync(IFormFile file, CancellationToken ct = default)
    {
        if (file == null || file.Length == 0)
        {
            throw new ArgumentException("File is empty or null.");
        }

        using var stream = file.OpenReadStream();
        
        var options = new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true,
            AllowTrailingCommas = true
        };

        var rows = await JsonSerializer.DeserializeAsync<List<ImportAnswerRowDto>>(stream, options, ct);
        
        return rows ?? [];
    }
}

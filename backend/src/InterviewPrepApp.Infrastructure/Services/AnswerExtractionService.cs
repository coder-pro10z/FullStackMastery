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
        using var document = await JsonDocument.ParseAsync(stream, cancellationToken: ct);
        
        var options = new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true,
            AllowTrailingCommas = true
        };

        JsonElement root = document.RootElement;
        
        if (root.ValueKind == JsonValueKind.Object && root.TryGetProperty("answers", out JsonElement answersElement))
        {
            if (answersElement.ValueKind == JsonValueKind.Array)
            {
                var rows = answersElement.Deserialize<List<ImportAnswerRowDto>>(options);
                return rows ?? [];
            }
        }
        else if (root.ValueKind == JsonValueKind.Array)
        {
            var rows = root.Deserialize<List<ImportAnswerRowDto>>(options);
            return rows ?? [];
        }

        throw new ArgumentException("Invalid JSON format. Expected a JSON array at the root or an object with an 'answers' array.");
    }
}

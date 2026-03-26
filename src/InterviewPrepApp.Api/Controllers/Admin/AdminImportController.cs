using InterviewPrepApp.Application.DTOs.Admin;
using InterviewPrepApp.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using System.Text.Json;

namespace InterviewPrepApp.Api.Controllers.Admin;

[ApiController]
[Route("api/admin/import")]
[Authorize(Roles = "Admin")]
public class AdminImportController : ControllerBase
{
    private readonly IAdminQuestionService _service;

    public AdminImportController(IAdminQuestionService service)
    {
        _service = service;
    }

    /// <summary>Upload .json or .csv file to import questions.</summary>
    [HttpPost]
    [Consumes("multipart/form-data")]
    public async Task<IActionResult> ImportFile(
        [FromForm] IFormFile file,
        [FromForm] int? defaultCategoryId,
        [FromForm] bool dryRun = false,
        CancellationToken ct = default)
    {
        if (file is null || file.Length == 0)
            return BadRequest(new { error = "No file uploaded." });

        var ext = Path.GetExtension(file.FileName).ToLowerInvariant();
        IEnumerable<ImportQuestionRowDto> rows;

        try
        {
            using var reader = new StreamReader(file.OpenReadStream());
            var content = await reader.ReadToEndAsync(ct);

            rows = ext switch
            {
                ".json" => ParseJson(content),
                ".csv" => ParseCsv(content),
                _ => throw new NotSupportedException($"Unsupported format: {ext}")
            };
        }
        catch (Exception ex)
        {
            return BadRequest(new { error = $"File parse error: {ex.Message}" });
        }

        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? "system";
        var userEmail = User.FindFirstValue(ClaimTypes.Email) ?? User.Identity?.Name ?? userId;
        var result = await _service.ImportAsync(rows, defaultCategoryId, dryRun, userId, userEmail, ct);
        return Ok(result);
    }

    /// <summary>Import from raw JSON body.</summary>
    [HttpPost("json")]
    public async Task<IActionResult> ImportJson(
        [FromBody] JsonImportBody body,
        [FromQuery] int? defaultCategoryId,
        [FromQuery] bool dryRun = false,
        CancellationToken ct = default)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? "system";
        var userEmail = User.FindFirstValue(ClaimTypes.Email) ?? User.Identity?.Name ?? userId;
        var result = await _service.ImportAsync(body.Questions, defaultCategoryId, dryRun, userId, userEmail, ct);
        return Ok(result);
    }

    private static IEnumerable<ImportQuestionRowDto> ParseJson(string json)
    {
        var doc = JsonSerializer.Deserialize<JsonImportDocument>(json,
            new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

        return doc?.Questions ?? [];
    }

    private static IEnumerable<ImportQuestionRowDto> ParseCsv(string csv)
    {
        var lines = csv.Split('\n', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);
        if (lines.Length <= 1) return [];

        // Skip header row
        return lines.Skip(1).Select(line =>
        {
            var parts = SplitCsvLine(line);
            return new ImportQuestionRowDto
            {
                Title = parts.ElementAtOrDefault(0),
                QuestionText = parts.ElementAtOrDefault(1) ?? string.Empty,
                Difficulty = parts.ElementAtOrDefault(2) ?? "Easy",
                Role = parts.ElementAtOrDefault(3) ?? "General",
                CategorySlug = parts.ElementAtOrDefault(4) ?? string.Empty,
                AnswerMarkdown = parts.ElementAtOrDefault(5)
            };
        }).ToList();
    }

    private static string[] SplitCsvLine(string line)
    {
        // Basic CSV split respecting quoted fields
        var result = new List<string>();
        bool inQuotes = false;
        var current = new System.Text.StringBuilder();

        foreach (char c in line)
        {
            if (c == '"') { inQuotes = !inQuotes; continue; }
            if (c == ',' && !inQuotes) { result.Add(current.ToString().Trim()); current.Clear(); continue; }
            current.Append(c);
        }
        result.Add(current.ToString().Trim());
        return [.. result];
    }
}

public class JsonImportBody { public IReadOnlyList<ImportQuestionRowDto> Questions { get; set; } = []; }
public class JsonImportDocument { public IReadOnlyList<ImportQuestionRowDto>? Questions { get; set; } }



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
    private readonly IExcelExtractor _excelExtractor;

    public AdminImportController(IAdminQuestionService service, IExcelExtractor excelExtractor)
    {
        _service = service;
        _excelExtractor = excelExtractor;
    }

    /// <summary>Upload .json, .csv, or .xlsx file to import questions.</summary>
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
        List<ExcelRowDiagnostic>? excelDiagnostics = null;

        try
        {
            if (ext == ".xlsx")
            {
                using var stream = file.OpenReadStream();
                var extractResult = _excelExtractor.ExtractImportRows(stream);
                if (extractResult.IsFatalError)
                    return BadRequest(new { error = $"Excel parse error: {extractResult.FatalErrorMessage}" });
                rows = extractResult.Rows;
                excelDiagnostics = extractResult.Diagnostics;
            }
            else if (ext == ".xls")
            {
                return BadRequest(new { error = "Legacy .xls format is not supported. Please save as .xlsx and re-upload." });
            }
            else
            {
                using var reader = new StreamReader(file.OpenReadStream());
                var content = await reader.ReadToEndAsync(ct);

                rows = ext switch
                {
                    ".json" => ParseJson(content),
                    ".csv" => ParseCsv(content),
                    _ => throw new NotSupportedException($"Unsupported format: {ext}. Accepted: .xlsx, .csv, .json")
                };
            }
        }
        catch (Exception ex)
        {
            return BadRequest(new { error = $"File parse error: {ex.Message}" });
        }

        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? "system";
        var userEmail = User.FindFirstValue(ClaimTypes.Email) ?? User.Identity?.Name ?? userId;
        var result = await _service.ImportAsync(rows, defaultCategoryId, dryRun, userId, userEmail, ct);

        // Merge Excel extraction diagnostics into the response
        if (excelDiagnostics is { Count: > 0 })
        {
            foreach (var d in excelDiagnostics)
            {
                var msg = $"Excel Row {d.RowNumber}: {d.Message}";
                if (d.Severity == "Error")
                    result.Errors.Add(msg);
                else
                    result.Warnings.Add(msg);
            }
        }

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
        var lines = SplitCsvLines(csv);
        if (lines.Count <= 1) return [];

        // Parse header row — column-name-based mapping (case-insensitive)
        var headerParts = SplitCsvLine(lines[0]);
        var headerMap = new Dictionary<string, int>(StringComparer.OrdinalIgnoreCase);
        for (int h = 0; h < headerParts.Length; h++)
        {
            var name = headerParts[h].Trim();
            if (!string.IsNullOrEmpty(name) && !headerMap.ContainsKey(name))
                headerMap[name] = h;
        }

        string GetCol(string[] parts, params string[] names)
        {
            foreach (var name in names)
                if (headerMap.TryGetValue(name, out var idx) && idx < parts.Length)
                    return parts[idx];
            return string.Empty;
        }

        return lines.Skip(1).Select(line =>
        {
            var parts = SplitCsvLine(line);
            return new ImportQuestionRowDto
            {
                Title = NullIfEmpty(GetCol(parts, "Title")),
                QuestionText = GetCol(parts, "QuestionText", "Question", "Question Title"),
                Difficulty = NullCoalesce(GetCol(parts, "Difficulty"), "Medium"),
                Role = NullCoalesce(GetCol(parts, "Role"), "General"),
                CategorySlug = GetCol(parts, "CategorySlug", "Category"),
                AnswerMarkdown = NullIfEmpty(GetCol(parts, "AnswerMarkdown", "AnswerText", "Answer"))
            };
        }).ToList();
    }

    private static string NullCoalesce(string value, string fallback) =>
        string.IsNullOrWhiteSpace(value) ? fallback : value;

    private static string? NullIfEmpty(string value) =>
        string.IsNullOrWhiteSpace(value) ? null : value;

    /// <summary>
    /// Split CSV content into logical lines, handling newlines inside quoted fields.
    /// </summary>
    private static List<string> SplitCsvLines(string csv)
    {
        var lines = new List<string>();
        var current = new System.Text.StringBuilder();
        bool inQuotes = false;

        foreach (char c in csv)
        {
            if (c == '"') { inQuotes = !inQuotes; current.Append(c); continue; }
            if ((c == '\n' || c == '\r') && !inQuotes)
            {
                if (current.Length > 0)
                {
                    lines.Add(current.ToString().Trim());
                    current.Clear();
                }
                continue;
            }
            current.Append(c);
        }
        if (current.Length > 0)
            lines.Add(current.ToString().Trim());
        return lines;
    }

    /// <summary>
    /// RFC-4180 compliant CSV line splitter: handles quoted fields and escaped double-quotes ("").
    /// </summary>
    private static string[] SplitCsvLine(string line)
    {
        var result = new List<string>();
        bool inQuotes = false;
        var current = new System.Text.StringBuilder();

        for (int i = 0; i < line.Length; i++)
        {
            char c = line[i];

            if (c == '"')
            {
                if (inQuotes && i + 1 < line.Length && line[i + 1] == '"')
                {
                    // Escaped double-quote ("") → literal "
                    current.Append('"');
                    i++;
                }
                else
                {
                    inQuotes = !inQuotes;
                }
                continue;
            }
            if (c == ',' && !inQuotes)
            {
                result.Add(current.ToString().Trim());
                current.Clear();
                continue;
            }
            current.Append(c);
        }
        result.Add(current.ToString().Trim());
        return [.. result];
    }
}

public class JsonImportBody { public IReadOnlyList<ImportQuestionRowDto> Questions { get; set; } = []; }
public class JsonImportDocument { public IReadOnlyList<ImportQuestionRowDto>? Questions { get; set; } }

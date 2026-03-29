using InterviewPrepApp.Application.DTOs.Admin;
using InterviewPrepApp.Application.Validators;
using InterviewPrepApp.Domain.Enums;
using InterviewPrepApp.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using System.Security.Cryptography;
using System.Text;

namespace InterviewPrepApp.Infrastructure.Services;

/// <summary>
/// Validates imported question rows: required fields, difficulty parsing, category resolution, deduplication.
/// Pure validation — no DB writes.
/// </summary>
public class QuestionImportValidator : IQuestionImportValidator
{
    private readonly ApplicationDbContext _db;

    public QuestionImportValidator(ApplicationDbContext db) => _db = db;

    public async Task<QuestionImportValidationResult> ValidateAsync(
        IReadOnlyList<ImportQuestionRowDto> rows,
        int? defaultCategoryId,
        HashSet<string> existingFingerprints,
        CancellationToken ct = default)
    {
        var result = new QuestionImportValidationResult();

        var categoryMap = await _db.Categories
            .AsNoTracking()
            .ToDictionaryAsync(c => c.Slug.ToLower(), c => c.Id, ct);

        // Track fingerprints within this batch to catch intra-file duplicates
        var fileFingerprints = new HashSet<string>(StringComparer.Ordinal);

        for (int i = 0; i < rows.Count; i++)
        {
            var row = rows[i];
            var rowNum = i + 1;

            // ── Required field: QuestionText ──
            if (string.IsNullOrWhiteSpace(row.QuestionText))
            {
                result.Errors.Add($"Row {rowNum}: QuestionText is required — skipped.");
                result.Failed++;
                continue;
            }

            // ── Role normalisation ──
            var role = string.IsNullOrWhiteSpace(row.Role) ? "General" : row.Role;

            // ── Deduplication ──
            var fingerprint = ComputeFingerprint(row.QuestionText, role);

            if (existingFingerprints.Contains(fingerprint))
            {
                result.Warnings.Add($"Row {rowNum}: Duplicate — question already exists in database. Skipped.");
                result.Skipped++;
                continue;
            }
            if (!fileFingerprints.Add(fingerprint))
            {
                result.Warnings.Add($"Row {rowNum}: Duplicate — same question appears earlier in this file. Skipped.");
                result.Skipped++;
                continue;
            }

            // ── Difficulty parsing ──
            if (!Enum.TryParse<Difficulty>(row.Difficulty, true, out var difficulty))
            {
                result.Warnings.Add($"Row {rowNum}: Unknown difficulty '{row.Difficulty}' — defaulted to Medium.");
                difficulty = Difficulty.Medium;
            }

            // ── Category resolution ──
            int categoryId;
            if (!string.IsNullOrWhiteSpace(row.CategorySlug) &&
                categoryMap.TryGetValue(row.CategorySlug.ToLower(), out var catId))
            {
                categoryId = catId;
            }
            else if (defaultCategoryId.HasValue)
            {
                result.Warnings.Add($"Row {rowNum}: Category '{row.CategorySlug}' not found — using default.");
                categoryId = defaultCategoryId.Value;
            }
            else
            {
                result.Errors.Add($"Row {rowNum}: Category '{row.CategorySlug}' not found and no default set — skipped.");
                result.Failed++;
                continue;
            }

            // ── Valid record ──
            result.ValidRecords.Add(new ValidatedQuestionRecord
            {
                Title = row.Title,
                QuestionText = row.QuestionText,
                AnswerMarkdown = row.AnswerMarkdown,
                Difficulty = difficulty,
                Role = role,
                CategoryId = categoryId
            });

            // Also add to fingerprint set so subsequent rows in this batch deduplicate correctly
            existingFingerprints.Add(fingerprint);
        }

        return result;
    }

    /// <summary>
    /// Deterministic fingerprint: SHA-256(upper(QuestionText)|upper(Role)), truncated to 16 hex chars.
    /// </summary>
    public static string ComputeFingerprint(string questionText, string role)
    {
        var input = $"{questionText.Trim().ToUpperInvariant()}|{role.Trim().ToUpperInvariant()}";
        var hash = SHA256.HashData(Encoding.UTF8.GetBytes(input));
        return Convert.ToHexString(hash)[..16];
    }
}

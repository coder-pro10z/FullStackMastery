using ClosedXML.Excel;
using InterviewPrepApp.Application.DTOs.Admin;
using InterviewPrepApp.Application.Interfaces;
using InterviewPrepApp.Domain.Entities;
using InterviewPrepApp.Domain.Enums;
using InterviewPrepApp.Domain.Shared;
using Microsoft.EntityFrameworkCore;
using InterviewPrepApp.Infrastructure.Persistence;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;

namespace InterviewPrepApp.Infrastructure.Services
{
    public class ExcelExtractionService : IExcelExtractor
    {
        private readonly ApplicationDbContext _context;

        public ExcelExtractionService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<Result<List<Question>>> ExtractQuestionsAsync(Stream excelStream, int defaultCategoryId)
        {
            using var workbook = new XLWorkbook(excelStream);
            var worksheet = workbook.Worksheet(1);
            var firstRow = worksheet.FirstRowUsed();
            if (firstRow == null)
                return Result<List<Question>>.Failure("Excel file is empty.");

            // Read headers (case-insensitive)
            var headers = firstRow.Cells().Select(c => c.GetString().Trim()).ToList();
            var questionColIndex = FindHeaderIndex(headers, "Question", "Question Title");
            var roleColIndex = FindHeaderIndex(headers, "Role");
            var difficultyColIndex = FindHeaderIndex(headers, "Difficulty");
            var categoryColIndex = FindHeaderIndex(headers, "Category");

            if (questionColIndex == -1 || roleColIndex == -1 || difficultyColIndex == -1)
                return Result<List<Question>>.Failure("Missing required columns: Question (or Question Title), Role, or Difficulty.");

            var rows = worksheet.RangeUsed().RowsUsed().Skip(1).ToList(); // skip header
            var questions = new List<Question>();
            var errors = new List<string>();

            // Preload all categories for lookups
            var allCategories = await _context.Categories.ToListAsync();
            var categoryByName = allCategories.ToDictionary(c => c.Name, c => c, StringComparer.OrdinalIgnoreCase);
            
            // Build full‑path lookup for Category column (if present)
            Dictionary<string, Category> pathToCategory = new Dictionary<string, Category>(StringComparer.OrdinalIgnoreCase);
            if (categoryColIndex != -1)
            {
                var categoryById = allCategories.ToDictionary(c => c.Id);
                foreach (var cat in allCategories)
                {
                    string path = GetFullPath(cat, categoryById);
                    if (!pathToCategory.ContainsKey(path))
                        pathToCategory[path] = cat;
                }
            }

            int i = 0;
            while (i < rows.Count)
            {
                var currentRow = rows[i];
                var rowNumber = currentRow.RowNumber();

                // Read the question row
                var questionText = currentRow.Cell(questionColIndex + 1).GetString().Trim();
                var role = currentRow.Cell(roleColIndex + 1).GetString().Trim();
                var difficultyText = currentRow.Cell(difficultyColIndex + 1).GetString().Trim();

                // Validate question row
                if (string.IsNullOrWhiteSpace(questionText))
                {
                    errors.Add($"Row {rowNumber}: Question is empty.");
                    i++;
                    continue;
                }
                if (string.IsNullOrWhiteSpace(role))
                {
                    errors.Add($"Row {rowNumber}: Role is empty.");
                    i++;
                    continue;
                }
                if (!Enum.TryParse<Difficulty>(difficultyText, true, out var difficulty))
                {
                    difficulty = Difficulty.Medium;
                }

                // Determine category ID – priority:
                // 1. Category column (if present)
                // 2. Role column (if it matches a category name)
                // 3. Default category ID (if provided and valid)
                int categoryId = 0;
                bool categoryFound = false;

                if (categoryColIndex != -1)
                {
                    // Use Category column
                    var categoryPathInput = currentRow.Cell(categoryColIndex + 1).GetString().Trim();
                    if (string.IsNullOrWhiteSpace(categoryPathInput))
                    {
                        errors.Add($"Row {rowNumber}: Category column present but empty.");
                        i++;
                        continue;
                    }

                    string normalizedPath = NormalizeCategoryPath(categoryPathInput);

                    if (pathToCategory.TryGetValue(normalizedPath, out var cat))
                    {
                        categoryId = cat.Id;
                        categoryFound = true;
                    }
                    else
                    {
                        var samplePaths = pathToCategory.Keys.Take(3).Select(p => $"'{p}'");
                        errors.Add($"Row {rowNumber}: Category path '{categoryPathInput}' not found. Examples: {string.Join(", ", samplePaths)}");
                        i++;
                        continue;
                    }
                }
                else if (categoryByName.TryGetValue(role, out var roleCategory))
                {
                    // Role matches a category name – use that
                    categoryId = roleCategory.Id;
                    categoryFound = true;
                }
                else
                {
                    // Fallback to default – check if default category exists
                    var defaultCategory = await _context.Categories.FindAsync(defaultCategoryId);
                    if (defaultCategory == null)
                    {
                        errors.Add($"Row {rowNumber}: No category found and default category ID {defaultCategoryId} is invalid.");
                        i++;
                        continue;
                    }
                    categoryId = defaultCategory.Id;
                    categoryFound = true;
                }

                if (!categoryFound)
                {
                    // This should not happen because we either found it or added an error and continued.
                    i++;
                    continue;
                }

                // Check if next row exists and looks like an answer row
                string? answerText = null;
                if (i + 1 < rows.Count)
                {
                    var nextRow = rows[i + 1];
                    var nextQuestionCell = nextRow.Cell(questionColIndex + 1);
                    var nextRoleCell = nextRow.Cell(roleColIndex + 1);
                    var nextDifficultyCell = nextRow.Cell(difficultyColIndex + 1);

                    var aboveRoleCell = currentRow.Cell(roleColIndex + 1);
                    var aboveDifficultyCell = currentRow.Cell(difficultyColIndex + 1);

                    bool roleEmptyForAnswer = IsCellEmptyForAnswer(nextRoleCell, aboveRoleCell);
                    bool difficultyEmptyForAnswer = IsCellEmptyForAnswer(nextDifficultyCell, aboveDifficultyCell);

                    if (!string.IsNullOrWhiteSpace(nextQuestionCell.GetString()) && roleEmptyForAnswer && difficultyEmptyForAnswer)
                    {
                        answerText = nextQuestionCell.GetString().Trim();
                        i += 2; // consume both rows
                    }
                    else
                    {
                        i++; // consume only current row
                    }
                }
                else
                {
                    i++;
                }

                questions.Add(new Question
                {
                    QuestionText = questionText,
                    Role = role,
                    Difficulty = difficulty,
                    CategoryId = categoryId,
                    AnswerText = answerText
                });
            }

            if (errors.Any())
                return Result<List<Question>>.Failure(string.Join("; ", errors));

            return Result<List<Question>>.Success(questions);
        }

        private static bool IsCellEmptyForAnswer(IXLCell cell, IXLCell aboveCell)
        {
            if (string.IsNullOrWhiteSpace(cell.GetString()))
                return true;

            if (cell.IsMerged())
            {
                var mergedRange = cell.MergedRange();
                if (mergedRange != null && mergedRange.Contains(aboveCell))
                    return true;
            }
            return false;
        }

        private static int FindHeaderIndex(IReadOnlyList<string> headers, params string[] acceptedNames)
        {
            for (int i = 0; i < headers.Count; i++)
            {
                if (acceptedNames.Any(name => headers[i].Equals(name, StringComparison.OrdinalIgnoreCase)))
                    return i;
            }

            return -1;
        }

        private static string GetFullPath(Category category, Dictionary<int, Category> categoryById)
        {
            var parts = new List<string>();
            var current = category;
            while (current != null)
            {
                parts.Insert(0, current.Name);
                current = current.ParentId.HasValue ? categoryById.GetValueOrDefault(current.ParentId.Value) : null;
            }
            return string.Join("/", parts);
        }

        private static string NormalizeCategoryPath(string input)
        {
            if (string.IsNullOrWhiteSpace(input))
                return string.Empty;

            string normalized = input.Replace("->", "/");
            var segments = normalized.Split('/', StringSplitOptions.RemoveEmptyEntries)
                                      .Select(s => s.Trim())
                                      .Where(s => !string.IsNullOrEmpty(s));
            return string.Join("/", segments);
        }

        // ── New DTO-based extraction for unified import pipeline ──────────────────

        public ExcelExtractionResult ExtractImportRows(Stream excelStream)
        {
            using var workbook = new XLWorkbook(excelStream);
            var worksheet = workbook.Worksheet(1);
            var firstRow = worksheet.FirstRowUsed();
            if (firstRow == null)
                return ExcelExtractionResult.Fatal("Excel file is empty.");

            var headers = firstRow.Cells().Select(c => c.GetString().Trim()).ToList();

            // Flexible column mapping (case-insensitive)
            var questionCol = FindHeaderIndex(headers, "QuestionText", "Question", "Question Title");
            var roleCol = FindHeaderIndex(headers, "Role");
            var difficultyCol = FindHeaderIndex(headers, "Difficulty");
            var categoryCol = FindHeaderIndex(headers, "Category", "CategorySlug");
            var answerCol = FindHeaderIndex(headers, "AnswerText", "AnswerMarkdown", "Answer");
            var titleCol = FindHeaderIndex(headers, "Title");

            if (questionCol == -1)
                return ExcelExtractionResult.Fatal("Missing required column: QuestionText (or Question, Question Title).");
            if (roleCol == -1)
                return ExcelExtractionResult.Fatal("Missing required column: Role.");

            var dataRows = worksheet.RangeUsed()?.RowsUsed().Skip(1).ToList();
            if (dataRows == null || dataRows.Count == 0)
                return ExcelExtractionResult.Fatal("Excel file has a header but no data rows.");

            var result = new List<ImportQuestionRowDto>();
            var diagnostics = new List<ExcelRowDiagnostic>();
            int i = 0;

            while (i < dataRows.Count)
            {
                var currentRow = dataRows[i];
                var excelRowNum = currentRow.RowNumber(); // Actual Excel row number for user-friendly messages
                var questionText = currentRow.Cell(questionCol + 1).GetString().Trim();
                var role = currentRow.Cell(roleCol + 1).GetString().Trim();

                // Skip entirely empty rows
                if (string.IsNullOrWhiteSpace(questionText) && string.IsNullOrWhiteSpace(role))
                {
                    i++;
                    continue;
                }

                // ── Per-row validation ──
                if (string.IsNullOrWhiteSpace(questionText))
                {
                    diagnostics.Add(new ExcelRowDiagnostic
                    {
                        RowNumber = excelRowNum,
                        Severity = "Error",
                        Message = "QuestionText is empty — row skipped."
                    });
                    i++;
                    continue;
                }

                if (string.IsNullOrWhiteSpace(role))
                {
                    diagnostics.Add(new ExcelRowDiagnostic
                    {
                        RowNumber = excelRowNum,
                        Severity = "Warning",
                        Message = "Role is empty — defaulted to 'General'."
                    });
                    role = "General";
                }

                var difficulty = difficultyCol != -1
                    ? currentRow.Cell(difficultyCol + 1).GetString().Trim()
                    : string.Empty;

                if (string.IsNullOrWhiteSpace(difficulty))
                {
                    diagnostics.Add(new ExcelRowDiagnostic
                    {
                        RowNumber = excelRowNum,
                        Severity = "Warning",
                        Message = "Difficulty is empty — defaulted to 'Medium'."
                    });
                    difficulty = "Medium";
                }

                var category = categoryCol != -1
                    ? currentRow.Cell(categoryCol + 1).GetString().Trim()
                    : string.Empty;

                var title = titleCol != -1
                    ? currentRow.Cell(titleCol + 1).GetString().Trim()
                    : null;

                // Direct AnswerText column takes priority
                string? answerText = null;
                if (answerCol != -1)
                {
                    answerText = currentRow.Cell(answerCol + 1).GetString().Trim();
                    if (string.IsNullOrEmpty(answerText)) answerText = null;
                }

                // Legacy answer-row detection
                if (answerText == null && i + 1 < dataRows.Count)
                {
                    var nextRow = dataRows[i + 1];
                    var nextQuestion = nextRow.Cell(questionCol + 1).GetString().Trim();
                    var nextRole = nextRow.Cell(roleCol + 1).GetString().Trim();
                    var nextDifficulty = difficultyCol != -1
                        ? nextRow.Cell(difficultyCol + 1).GetString().Trim()
                        : string.Empty;

                    if (!string.IsNullOrWhiteSpace(nextQuestion) &&
                        string.IsNullOrWhiteSpace(nextRole) &&
                        string.IsNullOrWhiteSpace(nextDifficulty))
                    {
                        answerText = nextQuestion;
                        diagnostics.Add(new ExcelRowDiagnostic
                        {
                            RowNumber = excelRowNum,
                            Severity = "Warning",
                            Message = $"Answer auto-detected from row {nextRow.RowNumber()} (legacy two-row format)."
                        });
                        i += 2; // consume both rows
                    }
                    else
                    {
                        i++;
                    }
                }
                else
                {
                    i++;
                }

                if (answerText == null)
                {
                    diagnostics.Add(new ExcelRowDiagnostic
                    {
                        RowNumber = excelRowNum,
                        Severity = "Warning",
                        Message = "No answer found — question imported without an answer."
                    });
                }

                result.Add(new ImportQuestionRowDto
                {
                    Title = title,
                    QuestionText = questionText,
                    AnswerMarkdown = answerText,
                    Difficulty = difficulty,
                    Role = role,
                    CategorySlug = category
                });
            }

            return ExcelExtractionResult.Ok(result, diagnostics);
        }
    }
}

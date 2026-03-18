using ClosedXML.Excel;
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
            var questionColIndex = headers.FindIndex(h => h.Equals("Question", StringComparison.OrdinalIgnoreCase));
            var roleColIndex = headers.FindIndex(h => h.Equals("Role", StringComparison.OrdinalIgnoreCase));
            var difficultyColIndex = headers.FindIndex(h => h.Equals("Difficulty", StringComparison.OrdinalIgnoreCase));
            var categoryColIndex = headers.FindIndex(h => h.Equals("Category", StringComparison.OrdinalIgnoreCase));

            if (questionColIndex == -1 || roleColIndex == -1 || difficultyColIndex == -1)
                return Result<List<Question>>.Failure("Missing required columns: Question, Role, or Difficulty.");

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
    }
}

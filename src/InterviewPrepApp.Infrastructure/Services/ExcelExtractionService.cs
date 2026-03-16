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
            // Validate default category exists
            var defaultCategory = await _context.Categories.FindAsync(defaultCategoryId);
            if (defaultCategory == null)
                return Result<List<Question>>.Failure($"Default category with ID {defaultCategoryId} does not exist.");

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

            // Preload categories for optional lookup
            var categoryCache = new Dictionary<string, Category>();
            if (categoryColIndex != -1)
            {
                var allCategories = await _context.Categories.ToListAsync();
                foreach (var cat in allCategories)
                    categoryCache[cat.Name] = cat;
            }

            int i = 0;
            while (i < rows.Count)
            {
                var currentRow = rows[i];
                var rowNumber = currentRow.RowNumber();

                // Read the question row
                var questionText = currentRow.Cell(questionColIndex + 1).GetString().Trim();
                var role = currentRow.Cell(roleColIndex + 1).GetString().Trim();
                var difficultyStr = currentRow.Cell(difficultyColIndex + 1).GetString().Trim();

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
                if (!Enum.TryParse<Difficulty>(difficultyStr, true, out var difficulty))
                {
                    errors.Add($"Row {rowNumber}: Invalid difficulty '{difficultyStr}'. Must be Easy, Medium, or Hard.");
                    i++;
                    continue;
                }

                // Determine category ID
                int categoryId;
                if (categoryColIndex != -1)
                {
                    var categoryName = currentRow.Cell(categoryColIndex + 1).GetString().Trim();
                    if (string.IsNullOrWhiteSpace(categoryName))
                    {
                        errors.Add($"Row {rowNumber}: Category column present but empty.");
                        i++;
                        continue;
                    }
                    if (!categoryCache.TryGetValue(categoryName, out var cat))
                    {
                        errors.Add($"Row {rowNumber}: Category '{categoryName}' not found.");
                        i++;
                        continue;
                    }
                    categoryId = cat.Id;
                }
                else
                {
                    categoryId = defaultCategoryId;
                }

                // Check if next row exists and looks like an answer row
                string? answerText = null;
                if (i + 1 < rows.Count)
                {
                    var nextRow = rows[i + 1];
                    var nextQuestionCell = nextRow.Cell(questionColIndex + 1);
                    var nextRoleCell = nextRow.Cell(roleColIndex + 1);
                    var nextDifficultyCell = nextRow.Cell(difficultyColIndex + 1);

                    // Get cells from current row for merge comparison
                    var aboveRoleCell = currentRow.Cell(roleColIndex + 1);
                    var aboveDifficultyCell = currentRow.Cell(difficultyColIndex + 1);

                    bool roleEmptyForAnswer = IsCellEmptyForAnswer(nextRoleCell, aboveRoleCell);
                    bool difficultyEmptyForAnswer = IsCellEmptyForAnswer(nextDifficultyCell, aboveDifficultyCell);

                    // If next row has text in Question column and Role/Difficulty are effectively empty,
                    // treat it as answer row.
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

            // If cell is merged and the merged range includes the cell above, treat as empty.
            if (cell.IsMerged())
            {
                var mergedRange = cell.MergedRange();
                if (mergedRange != null && mergedRange.Contains(aboveCell))
                    return true;
            }
            return false;
        }
    }
}
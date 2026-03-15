using ClosedXML.Excel;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;

public class QuestionExtractionPoc
{
    // Simple Result class for the POC
    public class Result<T>
    {
        public bool IsSuccess { get; set; }
        public T Data { get; set; }
        public string ErrorMessage { get; set; }

        public static Result<T> Success(T data) => new Result<T> { IsSuccess = true, Data = data };
        public static Result<T> Failure(string error) => new Result<T> { IsSuccess = false, ErrorMessage = error };
    }

    public enum Difficulty { Easy = 1, Medium = 2, Hard = 3 }

    public class Question
    {
        public string QuestionText { get; set; }
        public string Role { get; set; }
        public Difficulty Difficulty { get; set; }
        public int CategoryId { get; set; } // You'll provide this
        // AnswerText is optional in your sheet; we'll leave it null
        public string AnswerText { get; set; }
    }

    public static Result<List<Question>> ExtractQuestions(Stream excelStream, int defaultCategoryId)
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

        if (questionColIndex == -1 || roleColIndex == -1 || difficultyColIndex == -1)
            return Result<List<Question>>.Failure("Missing required columns: Question, Role, or Difficulty.");

        var rows = worksheet.RangeUsed().RowsUsed().Skip(1); // skip header
        var questions = new List<Question>();
        var errors = new List<string>();

        foreach (var row in rows)
        {
            var rowNumber = row.RowNumber();

            var questionText = row.Cell(questionColIndex + 1).GetString().Trim();
            if (string.IsNullOrWhiteSpace(questionText))
            {
                errors.Add($"Row {rowNumber}: Question is empty.");
                continue;
            }

            var role = row.Cell(roleColIndex + 1).GetString().Trim();
            if (string.IsNullOrWhiteSpace(role))
            {
                errors.Add($"Row {rowNumber}: Role is empty.");
                continue;
            }

            var difficultyStr = row.Cell(difficultyColIndex + 1).GetString().Trim();
            if (!Enum.TryParse<Difficulty>(difficultyStr, true, out var difficulty))
            {
                errors.Add($"Row {rowNumber}: Invalid difficulty '{difficultyStr}'. Must be Easy, Medium, or Hard.");
                continue;
            }

            questions.Add(new Question
            {
                QuestionText = questionText,
                Role = role,
                Difficulty = difficulty,
                CategoryId = defaultCategoryId,
                AnswerText = null // Your sheet doesn't have answers yet
            });
        }

        if (errors.Any())
            return Result<List<Question>>.Failure(string.Join("; ", errors));

        return Result<List<Question>>.Success(questions);
    }
}
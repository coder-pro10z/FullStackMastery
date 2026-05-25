using ClosedXML.Excel;
using InterviewPrepApp.Application.DTOs;

namespace InterviewPrepApp.Infrastructure.Services;

/// <summary>
/// Shared column resolution utilities for all Excel extraction services.
/// </summary>
internal static class ExcelSharedUtils
{
    public static string DetectVersion(IXLWorkbook workbook)
    {
        var metaSheet = workbook.Worksheets.FirstOrDefault(ws =>
            ws.Name.Equals("_schema", StringComparison.OrdinalIgnoreCase));

        if (metaSheet != null)
        {
            var versionCell = metaSheet.Cell(1, 2);
            if (!versionCell.IsEmpty())
                return versionCell.GetString().Trim().ToLowerInvariant();
        }
        return "v1";
    }

    public static Dictionary<string, int> BuildHeaderIndex(IXLRow headerRow)
    {
        return headerRow.CellsUsed()
            .ToDictionary(
                c => c.GetString().Trim().ToLowerInvariant().Replace(" ", "").Replace("_", ""),
                c => c.Address.ColumnNumber,
                StringComparer.OrdinalIgnoreCase);
    }

    public static string? Get(IXLRow row, Dictionary<string, int> index, string key)
    {
        if (!index.TryGetValue(key.ToLowerInvariant().Replace(" ", "").Replace("_", ""), out var col))
            return null;
        var val = row.Cell(col).GetString().Trim();
        return string.IsNullOrEmpty(val) ? null : val;
    }

    public static bool IsRowEmpty(IXLRow row, IEnumerable<int> colIndexes)
        => colIndexes.All(c => string.IsNullOrWhiteSpace(row.Cell(c).GetString()));
}

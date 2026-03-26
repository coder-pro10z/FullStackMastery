using InterviewPrepApp.Application.Interfaces;
using InterviewPrepApp.Infrastructure.Persistence;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using System.Text.Json;

namespace InterviewPrepApp.Api.Controllers
{
    [Route("api/admin")]
    [ApiController]
    // [Authorize(Roles = "Admin")] // Ensure you have an Admin role set up
    public class AdminController : ControllerBase
    {
        private readonly IExcelExtractor _excelExtractor;
        private readonly ApplicationDbContext _context;
        private readonly IAuditLogService _audit;

        public AdminController(IExcelExtractor excelExtractor, ApplicationDbContext context, IAuditLogService audit)
        {
            _excelExtractor = excelExtractor;
            _context = context;
            _audit = audit;
        }

        [HttpPost("import-questions")]
        public async Task<IActionResult> ImportQuestions(IFormFile file, [FromForm] int defaultCategoryId)
        {
            if (file == null || file.Length == 0)
                return BadRequest(new ProblemDetails { Title = "No file uploaded." });

            using var stream = file.OpenReadStream();
            var result = await _excelExtractor.ExtractQuestionsAsync(stream, defaultCategoryId);

            if (!result.IsSuccess)
            {
                return BadRequest(new ProblemDetails
                {
                    Title = "Import failed",
                    Detail = result.ErrorMessage
                });
            }

            // Add questions to database
            await _context.Questions.AddRangeAsync(result.Data!);
            await _context.SaveChangesAsync();

            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? "system";
            var userEmail = User.FindFirstValue(ClaimTypes.Email) ?? User.Identity?.Name ?? userId;
            await _audit.LogAsync(
                userId,
                userEmail,
                "IMPORTED",
                "Questions",
                newValues: JsonSerializer.Serialize(new
                {
                    Imported = result.Data!.Count,
                    Source = file.FileName
                }));

            return Ok(new { imported = result.Data!.Count });
        }

        [HttpGet("debug-categories")]
        public async Task<IActionResult> DebugCategories()
        {
            var categories = await _context.Categories
                .OrderBy(c => c.Id)
                .Select(c => new { c.Id, c.Name, ParentName = c.Parent != null ? c.Parent.Name : null })
                .ToListAsync();
            
            return Ok(new {
                message = "Available categories",
                categories = categories,
                suggestion = "Use one of these IDs as DefaultCategoryId"
            });
        }
    }

    

    public class ImportQuestionsRequest
    {
        public IFormFile File { get; set; } = null!;
        public int DefaultCategoryId { get; set; }
    }
}

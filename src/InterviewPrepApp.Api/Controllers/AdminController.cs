using InterviewPrepApp.Application.Interfaces;
using InterviewPrepApp.Infrastructure.Persistence;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

namespace InterviewPrepApp.Api.Controllers
{
    [Route("api/admin")]
    [ApiController]
    // [Authorize(Roles = "Admin")] // Ensure you have an Admin role set up
    public class AdminController : ControllerBase
    {
        private readonly IExcelExtractor _excelExtractor;
        private readonly ApplicationDbContext _context;

        public AdminController(IExcelExtractor excelExtractor, ApplicationDbContext context)
        {
            _excelExtractor = excelExtractor;
            _context = context;
        }

        [HttpPost("import-questions")]
        public async Task<IActionResult> ImportQuestions([FromForm] ImportQuestionsRequest request)
        {
            if (request.File == null || request.File.Length == 0)
                return BadRequest(new ProblemDetails { Title = "No file uploaded." });

            using var stream = request.File.OpenReadStream();
            var result = await _excelExtractor.ExtractQuestionsAsync(stream, request.DefaultCategoryId);

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

            return Ok(new { imported = result.Data!.Count });
        }
    }

    public class ImportQuestionsRequest
    {
        public IFormFile File { get; set; } = null!;
        public int DefaultCategoryId { get; set; }
    }
}
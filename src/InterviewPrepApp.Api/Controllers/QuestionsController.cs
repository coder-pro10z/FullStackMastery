using System.Security.Claims;
using InterviewPrepApp.Application.Interfaces;
using InterviewPrepApp.Domain.Enums;
using Microsoft.AspNetCore.Mvc;

namespace InterviewPrepApp.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class QuestionsController(IQuestionService questionService) : ControllerBase
{
    private readonly IQuestionService _questionService = questionService;

    [HttpGet]
    public async Task<IActionResult> GetQuestions(
        [FromQuery] int? categoryId,
        [FromQuery] string? searchTerm,
        [FromQuery] Difficulty? difficulty,
        [FromQuery] string? role,
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 20,
        CancellationToken cancellationToken = default)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

        var response = await _questionService.GetQuestionsAsync(
            categoryId,
            searchTerm,
            difficulty,
            role,
            pageNumber,
            pageSize,
            userId,
            cancellationToken);

        return Ok(response);
    }
}

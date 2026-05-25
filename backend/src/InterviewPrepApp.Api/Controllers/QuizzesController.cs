using InterviewPrepApp.Application.DTOs;
using InterviewPrepApp.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace InterviewPrepApp.Api.Controllers;

[ApiController]
[Route("api/quizzes")]
[Authorize]
public class QuizzesController : ControllerBase
{
    private readonly IQuizService _quizService;

    public QuizzesController(IQuizService quizService)
    {
        _quizService = quizService;
    }

    [HttpPost]
    public async Task<IActionResult> CreateAttempt([FromBody] CreateQuizAttemptDto dto, CancellationToken ct)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userId is null) return Unauthorized();

        var attemptResult = await _quizService.CreateAttemptAsync(dto, userId, ct);
        
        if (!attemptResult.IsSuccess)
        {
            return BadRequest(new { Error = attemptResult.ErrorMessage });
        }

        return Ok(attemptResult.Data);
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetAttempt(int id, CancellationToken ct)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userId is null) return Unauthorized();

        var attempt = await _quizService.GetAttemptAsync(id, userId, ct);
        if (attempt is null) return NotFound();

        return Ok(attempt);
    }

    [HttpPost("{id:int}/responses/{questionId:int}")]
    public async Task<IActionResult> SaveResponse(int id, int questionId, [FromBody] QuizAttemptResponseDto response, CancellationToken ct)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userId is null) return Unauthorized();

        var attempt = await _quizService.SaveResponseAsync(id, questionId, response, userId, ct);
        if (attempt is null) return BadRequest();

        return Ok(attempt);
    }

    [HttpPost("{id:int}/submit")]
    public async Task<IActionResult> SubmitAttempt(int id, CancellationToken ct)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userId is null) return Unauthorized();

        var attempt = await _quizService.SubmitAttemptAsync(id, userId, ct);
        if (attempt is null) return NotFound();

        return Ok(attempt);
    }
}

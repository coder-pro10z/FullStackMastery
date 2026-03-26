using InterviewPrepApp.Application.DTOs.Admin;
using InterviewPrepApp.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace InterviewPrepApp.Api.Controllers.Admin;

[ApiController]
[Route("api/admin/questions")]
[Authorize(Roles = "Admin,Editor")]
public class AdminQuestionsController : ControllerBase
{
    private readonly IAdminQuestionService _service;

    public AdminQuestionsController(IAdminQuestionService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] AdminQuestionFilter filter, CancellationToken ct)
        => Ok(await _service.GetQuestionsAsync(filter, ct));

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id, [FromQuery] bool includeDeleted, CancellationToken ct)
    {
        var result = await _service.GetByIdAsync(id, includeDeleted, ct);
        return result is null ? NotFound() : Ok(result);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateQuestionDto dto, CancellationToken ct)
    {
        if (!ModelState.IsValid) return ValidationProblem();
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? "system";
        var userEmail = User.FindFirstValue(ClaimTypes.Email) ?? User.Identity?.Name ?? userId;
        var result = await _service.CreateAsync(dto, userId, userEmail, ct);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateQuestionDto dto, CancellationToken ct)
    {
        if (!ModelState.IsValid) return ValidationProblem();
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? "system";
        var userEmail = User.FindFirstValue(ClaimTypes.Email) ?? User.Identity?.Name ?? userId;
        var result = await _service.UpdateAsync(id, dto, userId, userEmail, ct);
        return result is null ? NotFound() : Ok(result);
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id, CancellationToken ct)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? "system";
        var userEmail = User.FindFirstValue(ClaimTypes.Email) ?? User.Identity?.Name ?? userId;
        var success = await _service.SoftDeleteAsync(id, userId, userEmail, ct);
        return success ? NoContent() : NotFound();
    }

    [HttpPost("{id:int}/restore")]
    public async Task<IActionResult> Restore(int id, CancellationToken ct)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? "system";
        var userEmail = User.FindFirstValue(ClaimTypes.Email) ?? User.Identity?.Name ?? userId;
        var success = await _service.RestoreAsync(id, userId, userEmail, ct);
        return success ? Ok() : NotFound();
    }

    [HttpGet("{id:int}/versions")]
    public async Task<IActionResult> GetVersions(int id, CancellationToken ct)
        => Ok(await _service.GetVersionsAsync(id, ct));
}

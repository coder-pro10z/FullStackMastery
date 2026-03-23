using InterviewPrepApp.Application.DTOs;
using InterviewPrepApp.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace InterviewPrepApp.Api.Controllers;

[ApiController]
[Route("api/resources")]
[Authorize]
public class ResourcesController : ControllerBase
{
    private readonly ICheatSheetService _service;

    public ResourcesController(ICheatSheetService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<IActionResult> GetByCategory([FromQuery] int categoryId, CancellationToken ct)
    {
        var result = await _service.GetByCategoryAsync(categoryId, ct);
        return Ok(result);
    }
}

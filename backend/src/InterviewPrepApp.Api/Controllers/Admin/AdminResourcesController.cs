using InterviewPrepApp.Application.DTOs;
using InterviewPrepApp.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace InterviewPrepApp.Api.Controllers.Admin;

[ApiController]
[Route("api/admin/resources")]
[Authorize(Roles = "Admin")]
public class AdminResourcesController : ControllerBase
{
    private readonly ICheatSheetService _service;

    public AdminResourcesController(ICheatSheetService service)
    {
        _service = service;
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateCheatSheetDto dto, CancellationToken ct)
    {
        var result = await _service.CreateAsync(dto, ct);
        if (result == null) return BadRequest("Invalid category or type");

        return Ok(result);
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id, CancellationToken ct)
    {
        var success = await _service.DeleteAsync(id, ct);
        if (!success) return NotFound();

        return NoContent();
    }
}

using InterviewPrepApp.Application.DTOs.Admin;
using InterviewPrepApp.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace InterviewPrepApp.Api.Controllers.Admin;

[ApiController]
[Route("api/admin/categories")]
[Authorize(Roles = "Admin")]
public class AdminCategoriesController : ControllerBase
{
    private readonly IAdminCategoryService _service;

    public AdminCategoriesController(IAdminCategoryService service)
        => _service = service;

    [HttpGet]
    public async Task<IActionResult> GetTree(CancellationToken ct)
        => Ok(await _service.GetTreeAsync(ct));

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateCategoryDto dto, CancellationToken ct)
    {
        if (!ModelState.IsValid) return ValidationProblem();
        var result = await _service.CreateAsync(dto, ct);
        return CreatedAtAction(nameof(GetTree), result);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateCategoryDto dto, CancellationToken ct)
    {
        if (!ModelState.IsValid) return ValidationProblem();
        var result = await _service.UpdateAsync(id, dto, ct);
        return result is null ? NotFound() : Ok(result);
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id, CancellationToken ct)
    {
        var success = await _service.DeleteAsync(id, ct);
        return success
            ? NoContent()
            : BadRequest(new { error = "Cannot delete category with existing questions." });
    }
}

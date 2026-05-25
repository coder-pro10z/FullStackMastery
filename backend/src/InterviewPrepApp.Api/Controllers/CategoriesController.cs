using InterviewPrepApp.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace InterviewPrepApp.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CategoriesController(ICategoryService categoryService) : ControllerBase
{
    private readonly ICategoryService _categoryService = categoryService;

    [HttpGet("tree")]
    public async Task<IActionResult> GetTree(CancellationToken cancellationToken)
    {
        var categories = await _categoryService.GetTreeAsync(cancellationToken);
        return Ok(categories);
    }

    [HttpGet("flat")]
    public async Task<IActionResult> GetFlatList(CancellationToken cancellationToken)
    {
        var categories = await _categoryService.GetFlatListAsync(cancellationToken);
        return Ok(categories);
    }
}

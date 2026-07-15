using InterviewPrepApp.Application.DTOs;
using InterviewPrepApp.Application.DTOs.Interviews;
using InterviewPrepApp.Infrastructure.Persistence;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace InterviewPrepApp.Api.Controllers;

[ApiController]
[Route("api/interviews")]
[Authorize]
public class InterviewsController : ControllerBase
{
    private readonly ApplicationDbContext _db;

    public InterviewsController(ApplicationDbContext db)
    {
        _db = db;
    }

    [HttpGet("companies")]
    [AllowAnonymous] // Or keep authorized based on requirements
    public async Task<IActionResult> GetCompanies()
    {
        var companies = await _db.Companies.ToListAsync();
        return Ok(companies.Select(c => new CompanyDto
        {
            Id = c.Id,
            Name = c.Name,
            LogoUrl = c.LogoUrl,
            IndustryType = c.IndustryType
        }));
    }

    [HttpGet("companies/{id:guid}/details")]
    [AllowAnonymous]
    public async Task<IActionResult> GetCompanyDetails(Guid id)
    {
        // For the readonly view, we need the company, its interviews, rounds, and associated questions.
        // Returning a deep object might be easiest for the frontend.
        var company = await _db.Companies
            .Include(c => c.Interviews)
                .ThenInclude(i => i.Rounds)
                    .ThenInclude(r => r.RoundQuestions)
                        .ThenInclude(rq => rq.Question)
                            .ThenInclude(q => q.Category)
            .FirstOrDefaultAsync(c => c.Id == id);

        if (company == null) return NotFound();

        var result = new 
        {
            Id = company.Id,
            Name = company.Name,
            LogoUrl = company.LogoUrl,
            IndustryType = company.IndustryType,
            Interviews = company.Interviews.Select(i => new 
            {
                Id = i.Id,
                RoleName = i.RoleName,
                LevelTier = i.LevelTier,
                InterviewDate = i.InterviewDate,
                Rounds = i.Rounds.OrderBy(r => r.RoundNumber).Select(r => new 
                {
                    Id = r.Id,
                    RoundNumber = r.RoundNumber,
                    FocusArea = r.FocusArea,
                    Questions = r.RoundQuestions.OrderBy(rq => rq.OrderIndex).Select(rq => new 
                    {
                        Id = rq.Question.Id.ToString(), // UI expects string
                        RoundId = r.Id.ToString(),
                        Title = rq.Question.Title,
                        DifficultyLevel = rq.Question.Difficulty.ToString(),
                        CategoryName = rq.Question.Category?.Name,
                        SolutionMd = rq.Question.Answer.InterviewAnswer // or SolutionMarkdown equivalent
                    })
                })
            })
        };

        return Ok(result);
    }
}

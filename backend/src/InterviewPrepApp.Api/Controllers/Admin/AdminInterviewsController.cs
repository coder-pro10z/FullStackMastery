using InterviewPrepApp.Application.DTOs.Interviews;
using InterviewPrepApp.Domain.Entities;
using InterviewPrepApp.Infrastructure.Persistence;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace InterviewPrepApp.Api.Controllers.Admin;

[ApiController]
[Route("api/admin/interviews")]
[Authorize(Roles = "Admin,Editor")]
public class AdminInterviewsController : ControllerBase
{
    private readonly ApplicationDbContext _db;

    public AdminInterviewsController(ApplicationDbContext db)
    {
        _db = db;
    }

    // --- COMPANIES ---
    [HttpGet("companies")]
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

    [HttpPost("companies")]
    public async Task<IActionResult> CreateCompany([FromBody] CompanyDto dto)
    {
        var company = new Company
        {
            Id = Guid.NewGuid(),
            Name = dto.Name,
            LogoUrl = dto.LogoUrl,
            IndustryType = dto.IndustryType
        };
        _db.Companies.Add(company);
        await _db.SaveChangesAsync();
        dto.Id = company.Id;
        return Ok(dto);
    }

    [HttpPut("companies/{id:guid}")]
    public async Task<IActionResult> UpdateCompany(Guid id, [FromBody] CompanyDto dto)
    {
        var company = await _db.Companies.FindAsync(id);
        if (company == null) return NotFound();
        
        if (!string.IsNullOrWhiteSpace(dto.Name)) company.Name = dto.Name;
        if (dto.LogoUrl != null) company.LogoUrl = dto.LogoUrl;
        if (dto.IndustryType != null) company.IndustryType = dto.IndustryType;
        
        await _db.SaveChangesAsync();
        return Ok(dto);
    }

    [HttpDelete("companies/{id:guid}")]
    public async Task<IActionResult> DeleteCompany(Guid id)
    {
        var company = await _db.Companies.FindAsync(id);
        if (company == null) return NotFound();
        _db.Companies.Remove(company);
        await _db.SaveChangesAsync();
        return NoContent();
    }

    // --- INTERVIEWS ---
    [HttpGet("roles")]
    public async Task<IActionResult> GetInterviews([FromQuery] Guid companyId)
    {
        var interviews = await _db.CompanyInterviews.Where(i => i.CompanyId == companyId).ToListAsync();
        return Ok(interviews.Select(i => new CompanyInterviewDto
        {
            Id = i.Id,
            CompanyId = i.CompanyId,
            RoleName = i.RoleName,
            LevelTier = i.LevelTier,
            InterviewDate = i.InterviewDate
        }));
    }

    [HttpPost("roles")]
    public async Task<IActionResult> CreateInterview([FromBody] CompanyInterviewDto dto)
    {
        try
        {
            var interview = new CompanyInterview
            {
                Id = Guid.NewGuid(),
                CompanyId = dto.CompanyId,
                RoleName = dto.RoleName,
                LevelTier = dto.LevelTier,
                InterviewDate = dto.InterviewDate.HasValue ? DateTime.SpecifyKind(dto.InterviewDate.Value, DateTimeKind.Utc) : null
            };
            _db.CompanyInterviews.Add(interview);
            await _db.SaveChangesAsync();
            dto.Id = interview.Id;
            return Ok(dto);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { 
                error = ex.Message, 
                inner = ex.InnerException?.Message,
                stack = ex.StackTrace 
            });
        }
    }

    [HttpPut("roles/{id:guid}")]
    public async Task<IActionResult> UpdateInterview(Guid id, [FromBody] CompanyInterviewDto dto)
    {
        var interview = await _db.CompanyInterviews.FindAsync(id);
        if (interview == null) return NotFound();
        
        if (dto.CompanyId != Guid.Empty) interview.CompanyId = dto.CompanyId;
        if (!string.IsNullOrWhiteSpace(dto.RoleName)) interview.RoleName = dto.RoleName;
        if (dto.LevelTier != null) interview.LevelTier = dto.LevelTier;
        if (dto.InterviewDate != null) interview.InterviewDate = DateTime.SpecifyKind(dto.InterviewDate.Value, DateTimeKind.Utc);
        
        await _db.SaveChangesAsync();
        return Ok(dto);
    }

    [HttpDelete("roles/{id:guid}")]
    public async Task<IActionResult> DeleteInterview(Guid id)
    {
        var interview = await _db.CompanyInterviews.FindAsync(id);
        if (interview == null) return NotFound();
        _db.CompanyInterviews.Remove(interview);
        await _db.SaveChangesAsync();
        return NoContent();
    }

    // --- ROUNDS ---
    [HttpGet("rounds")]
    public async Task<IActionResult> GetRounds([FromQuery] Guid interviewId)
    {
        var rounds = await _db.InterviewRounds.Where(r => r.InterviewId == interviewId).ToListAsync();
        return Ok(rounds.Select(r => new InterviewRoundDto
        {
            Id = r.Id,
            InterviewId = r.InterviewId,
            RoundNumber = r.RoundNumber,
            FocusArea = r.FocusArea
        }));
    }

    [HttpPost("rounds")]
    public async Task<IActionResult> CreateRound([FromBody] InterviewRoundDto dto)
    {
        try
        {
            var round = new InterviewRound
            {
                Id = Guid.NewGuid(),
                InterviewId = dto.InterviewId,
                RoundNumber = dto.RoundNumber,
                FocusArea = dto.FocusArea
            };
            _db.InterviewRounds.Add(round);
            await _db.SaveChangesAsync();
            dto.Id = round.Id;
            return Ok(dto);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { 
                error = ex.Message, 
                inner = ex.InnerException?.Message,
                stack = ex.StackTrace 
            });
        }
    }

    [HttpPut("rounds/{id:guid}")]
    public async Task<IActionResult> UpdateRound(Guid id, [FromBody] InterviewRoundDto dto)
    {
        var round = await _db.InterviewRounds.FindAsync(id);
        if (round == null) return NotFound();
        
        if (dto.InterviewId != Guid.Empty) round.InterviewId = dto.InterviewId;
        if (dto.RoundNumber > 0) round.RoundNumber = dto.RoundNumber;
        if (dto.FocusArea != null) round.FocusArea = dto.FocusArea;
        
        await _db.SaveChangesAsync();
        return Ok(dto);
    }

    [HttpDelete("rounds/{id:guid}")]
    public async Task<IActionResult> DeleteRound(Guid id)
    {
        var round = await _db.InterviewRounds.FindAsync(id);
        if (round == null) return NotFound();
        _db.InterviewRounds.Remove(round);
        await _db.SaveChangesAsync();
        return NoContent();
    }

    // --- ROUND QUESTIONS ---
    [HttpGet("rounds/{id:guid}/questions")]
    public async Task<IActionResult> GetQuestionsForRound(Guid id)
    {
        var questions = await _db.InterviewRoundQuestions
            .Where(rq => rq.RoundId == id)
            .OrderBy(rq => rq.OrderIndex)
            .Select(rq => new 
            {
                Id = rq.Question.Id.ToString(),
                RoundId = rq.RoundId.ToString(),
                Title = rq.Question.Title,
                DifficultyLevel = rq.Question.Difficulty.ToString(),
                CategoryName = rq.Question.Category.Name,
                SolutionMd = rq.Question.AnswerText, // Mapping AnswerText to SolutionMd for now
                DiagramPayload = ""
            })
            .ToListAsync();
            
        return Ok(questions);
    }

    [HttpPost("rounds/{id:guid}/questions/{questionId:int}")]
    public async Task<IActionResult> AddQuestionToRound(Guid id, int questionId)
    {
        var exists = await _db.InterviewRoundQuestions.AnyAsync(q => q.RoundId == id && q.QuestionId == questionId);
        if (!exists)
        {
            _db.InterviewRoundQuestions.Add(new InterviewRoundQuestion
            {
                RoundId = id,
                QuestionId = questionId,
                OrderIndex = 0
            });
            await _db.SaveChangesAsync();
        }
        return Ok();
    }

    [HttpDelete("rounds/{id:guid}/questions/{questionId:int}")]
    public async Task<IActionResult> RemoveQuestionFromRound(Guid id, int questionId)
    {
        var rq = await _db.InterviewRoundQuestions.FirstOrDefaultAsync(q => q.RoundId == id && q.QuestionId == questionId);
        if (rq != null)
        {
            _db.InterviewRoundQuestions.Remove(rq);
            await _db.SaveChangesAsync();
        }
        return NoContent();
    }
}

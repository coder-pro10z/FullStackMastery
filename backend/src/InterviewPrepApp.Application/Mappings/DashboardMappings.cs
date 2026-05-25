using InterviewPrepApp.Application.DTOs;
using InterviewPrepApp.Domain.Entities;

namespace InterviewPrepApp.Application.Mappings;

/// <summary>
/// Pure mapping functions from Domain Entities to Application DTOs.
/// No framework dependency (AutoMapper/Mapster) — manual projection
/// keeps it explicit, testable, and allocation-efficient.
/// </summary>
public static class DashboardMappings
{
    /// <summary>
    /// Maps a <see cref="DevHexagon"/> aggregate (with its loaded navigation properties)
    /// to the <see cref="TechStackDto"/> shape expected by the frontend.
    /// </summary>
    public static TechStackDto ToTechStackDto(this DevHexagon entity)
    {
        return new TechStackDto(
            DevHexagon: new DevHexagonDto(
                Version: entity.Version,
                Role: entity.Role,
                TargetLevel: entity.TargetLevel,
                PrimaryMetrics: entity.PrimaryMetrics
                    .OrderBy(m => m.Id)
                    .Select(m => m.Value)
                    .ToList(),
                Skills: entity.Skills
                    .OrderBy(s => s.Id)
                    .Select(s => new SkillCategoryDto(
                        Category: s.Category,
                        HighLevelGoal: s.HighLevelGoal,
                        InterviewGotcha: s.InterviewGotcha,
                        KeyTopics: s.KeyTopics
                            .OrderBy(t => t.Id)
                            .Select(t => t.TopicName)
                            .ToList()
                    ))
                    .ToList()
            )
        );
    }
}

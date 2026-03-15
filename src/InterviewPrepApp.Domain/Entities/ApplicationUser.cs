using Microsoft.AspNetCore.Identity;

namespace InterviewPrepApp.Domain.Entities;

public class ApplicationUser : IdentityUser
{
    public ICollection<UserProgress> UserProgresses { get; set; } = new List<UserProgress>();
}

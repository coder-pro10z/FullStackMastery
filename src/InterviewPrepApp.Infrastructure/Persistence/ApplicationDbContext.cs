using InterviewPrepApp.Domain.Entities;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace InterviewPrepApp.Infrastructure.Persistence;

public class ApplicationDbContext : IdentityDbContext<ApplicationUser>
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    public DbSet<Category> Categories => Set<Category>();

    public DbSet<Question> Questions => Set<Question>();

    public DbSet<UserProgress> UserProgresses => Set<UserProgress>();

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        builder.Entity<UserProgress>(entity =>
        {
            entity.HasKey(progress => new { progress.UserId, progress.QuestionId });

            entity.HasOne(progress => progress.User)
                .WithMany(user => user.UserProgresses)
                .HasForeignKey(progress => progress.UserId);

            entity.HasOne(progress => progress.Question)
                .WithMany(question => question.UserProgresses)
                .HasForeignKey(progress => progress.QuestionId);
        });

        builder.Entity<Category>(entity =>
        {
            entity.HasOne(category => category.Parent)
                .WithMany(category => category.SubCategories)
                .HasForeignKey(category => category.ParentId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasData(DatabaseSeeder.GetSeedCategories());
        });

        builder.Entity<Question>(entity =>
        {
            entity.HasOne(question => question.Category)
                .WithMany(category => category.Questions)
                .HasForeignKey(question => question.CategoryId);
        });
    }
}

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
    public DbSet<AuditLog> AuditLogs => Set<AuditLog>();
    public DbSet<QuestionVersion> QuestionVersions => Set<QuestionVersion>();

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

            entity.Property(c => c.Slug).HasMaxLength(150);
            entity.HasIndex(c => c.Slug).IsUnique();

            entity.HasData(DatabaseSeeder.GetSeedCategories());
        });

        builder.Entity<Question>(entity =>
        {
            entity.HasOne(question => question.Category)
                .WithMany(category => category.Questions)
                .HasForeignKey(question => question.CategoryId);

            entity.HasMany(q => q.Versions)
                .WithOne(v => v.Question)
                .HasForeignKey(v => v.QuestionId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.Property(q => q.Status).HasConversion<int>();
            entity.Property(q => q.Difficulty).HasConversion<int>();
        });

        builder.Entity<QuestionVersion>(entity =>
        {
            entity.HasIndex(v => new { v.QuestionId, v.VersionNumber }).IsUnique();
        });

        builder.Entity<AuditLog>(entity =>
        {
            entity.HasIndex(l => l.Timestamp);
            entity.HasIndex(l => new { l.EntityType, l.EntityId });
        });
    }
}

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

    public DbSet<QuizAttempt> QuizAttempts => Set<QuizAttempt>();
    public DbSet<QuizAttemptQuestion> QuizAttemptQuestions => Set<QuizAttemptQuestion>();
    public DbSet<QuizAttemptResponse> QuizAttemptResponses => Set<QuizAttemptResponse>();
    public DbSet<CheatSheetResource> CheatSheetResources => Set<CheatSheetResource>();
    public DbSet<QuizQuestion> QuizQuestions => Set<QuizQuestion>();
    public DbSet<StudyGuideSection> StudyGuideSections => Set<StudyGuideSection>();
    public DbSet<ImportJob> ImportJobs => Set<ImportJob>();

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

        // Quiz configurations
        builder.Entity<QuizAttempt>(entity =>
        {
            entity.HasOne(q => q.User)
                  .WithMany()
                  .HasForeignKey(q => q.UserId)
                  .OnDelete(DeleteBehavior.Restrict);

            entity.Property(q => q.Mode).HasConversion<int>();
            entity.Property(q => q.Status).HasConversion<int>();
        });

        builder.Entity<QuizAttemptQuestion>(entity =>
        {
            entity.HasOne(qa => qa.QuizAttempt)
                  .WithMany(q => q.Questions)
                  .HasForeignKey(qa => qa.QuizAttemptId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(qa => qa.Question)
                  .WithMany()
                  .HasForeignKey(qa => qa.QuestionId)
                  .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(qa => qa.Response)
                  .WithOne(r => r.QuizAttemptQuestion)
                  .HasForeignKey<QuizAttemptResponse>(r => r.QuizAttemptQuestionId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        // CheatSheet Configurations
        builder.Entity<CheatSheetResource>(entity =>
        {
            entity.HasOne(r => r.Category)
                  .WithMany()
                  .HasForeignKey(r => r.CategoryId)
                  .OnDelete(DeleteBehavior.Restrict);

            entity.HasIndex(r => r.CategoryId);
            entity.HasIndex(r => new { r.CategoryId, r.Type });
            entity.Property(r => r.Type).HasConversion<int>();
            entity.Property(r => r.Title).IsRequired().HasMaxLength(200);
            entity.Property(r => r.Url).HasMaxLength(1000);
        });

        // QuizQuestion configurations
        builder.Entity<QuizQuestion>(entity =>
        {
            entity.HasIndex(q => q.ExternalId).IsUnique();
            entity.Property(q => q.ExternalId).HasMaxLength(200).IsRequired();
            entity.Property(q => q.QuestionText).IsRequired();
            entity.Property(q => q.CorrectAnswer).HasMaxLength(1).IsRequired();
            entity.Property(q => q.Difficulty).HasConversion<int>();
            entity.HasOne(q => q.Category)
                  .WithMany()
                  .HasForeignKey(q => q.CategoryId)
                  .OnDelete(DeleteBehavior.SetNull);
        });

        // StudyGuideSection configurations
        builder.Entity<StudyGuideSection>(entity =>
        {
            entity.HasIndex(s => s.ExternalId).IsUnique();
            entity.Property(s => s.ExternalId).HasMaxLength(200).IsRequired();
            entity.Property(s => s.Title).HasMaxLength(400).IsRequired();
            entity.HasOne(s => s.Category)
                  .WithMany()
                  .HasForeignKey(s => s.CategoryId)
                  .OnDelete(DeleteBehavior.SetNull);
        });

        // ImportJob configurations
        builder.Entity<ImportJob>(entity =>
        {
            entity.Property(j => j.Id).ValueGeneratedOnAdd();
            entity.Property(j => j.Type).HasConversion<int>();
            entity.Property(j => j.Status).HasConversion<int>();
            entity.Property(j => j.FileName).HasMaxLength(500);
            entity.HasIndex(j => new { j.UploadedByUserId, j.UploadedAtUtc });
        });
    }
}

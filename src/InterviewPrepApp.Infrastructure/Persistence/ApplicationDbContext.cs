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

    //Dashboard

    // ── NEW DB SETS (Migrated from EduDash) ─────────────────
    public DbSet<DevHexagon> DevHexagons => Set<DevHexagon>();
    public DbSet<SkillCategory> SkillCategories => Set<SkillCategory>();
    public DbSet<Skill> Skills => Set<Skill>();
    public DbSet<PrimaryMetric> PrimaryMetrics => Set<PrimaryMetric>();

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

            entity.HasOne(qa => qa.QuizQuestion) // QuizQuestion replaceed ny Question
                  .WithMany()
                  .HasForeignKey(qa => qa.QuizQuestionId)  // FK  replaced by  Question ID
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


        // ── NEW CONFIGURATIONS (Migrated from EduDash) ──────
        builder.Entity<DevHexagon>(entity =>
        {
            entity.ToTable("DevHexagons");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Version).HasMaxLength(20).IsRequired();
            entity.Property(e => e.Role).HasMaxLength(100).IsRequired();
            entity.Property(e => e.TargetLevel).HasMaxLength(50).IsRequired();

            entity.HasMany(e => e.PrimaryMetrics)
                .WithOne(m => m.DevHexagon)
                .HasForeignKey(m => m.DevHexagonId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasMany(e => e.Skills)
                .WithOne(s => s.DevHexagon)
                .HasForeignKey(s => s.DevHexagonId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        builder.Entity<PrimaryMetric>(entity =>
        {
            entity.ToTable("PrimaryMetrics");
            entity.Property(e => e.Value).HasMaxLength(100).IsRequired();
        });

        builder.Entity<SkillCategory>(entity =>
        {
            entity.ToTable("SkillCategories");
            entity.Property(e => e.Category).HasMaxLength(100).IsRequired();
            entity.Property(e => e.HighLevelGoal).HasMaxLength(200).IsRequired();
            entity.Property(e => e.InterviewGotcha).HasMaxLength(500).IsRequired();
        });

        builder.Entity<Skill>(entity =>
        {
            entity.ToTable("Skills");
            entity.Property(e => e.TopicName).HasMaxLength(200).IsRequired();
        });

        SeedData(builder);
    }



       private static void SeedData(ModelBuilder modelBuilder)
    {
        // Root aggregate
        modelBuilder.Entity<DevHexagon>().HasData(new DevHexagon
        {
            Id = 1,
            Version = "2026.2",
            Role = ".NET Full Stack Engineer",
            TargetLevel = "Intermediate/Senior"
        });

        // Primary Metrics
        modelBuilder.Entity<PrimaryMetric>().HasData(
            new PrimaryMetric { Id = 1, DevHexagonId = 1, Value = "Sub-50ms latency" },
            new PrimaryMetric { Id = 2, DevHexagonId = 1, Value = "500+ concurrent users" }
        );

        // ── Skill Categories & Topics ───────────────────────────────

        // 1. Backend (.NET)
        modelBuilder.Entity<SkillCategory>().HasData(new SkillCategory
        {
            Id = 1,
            DevHexagonId = 1,
            Category = "Backend (.NET)",
            HighLevelGoal = "Reliability & Performance",
            InterviewGotcha = "How do you handle a failing 3rd party API?"
        });
        modelBuilder.Entity<Skill>().HasData(
            new Skill { Id = 1, SkillCategoryId = 1, TopicName = "Concurrency (async/await, Task, Thread Pool)" },
            new Skill { Id = 2, SkillCategoryId = 1, TopicName = "Garbage Collection (Gen 0/1/2, LOH, IDisposable)" },
            new Skill { Id = 3, SkillCategoryId = 1, TopicName = "Dependency Injection (Lifetimes, Scopes)" },
            new Skill { Id = 4, SkillCategoryId = 1, TopicName = "Middleware & Request Pipeline" },
            new Skill { Id = 5, SkillCategoryId = 1, TopicName = "Minimal APIs vs. Controllers" },
            new Skill { Id = 6, SkillCategoryId = 1, TopicName = "Performance Profiling (BenchmarkDotNet, dotTrace)" },
            new Skill { Id = 7, SkillCategoryId = 1, TopicName = "Caching Strategies (MemoryCache, Distributed Cache)" },
            new Skill { Id = 8, SkillCategoryId = 1, TopicName = "Background Services (IHostedService)" },
            new Skill { Id = 9, SkillCategoryId = 1, TopicName = "Exception Handling & Resiliency (Polly)" },
            new Skill { Id = 10, SkillCategoryId = 1, TopicName = "Clean Architecture" }
        );

        // 2. Frontend (Angular)
        modelBuilder.Entity<SkillCategory>().HasData(new SkillCategory
        {
            Id = 2,
            DevHexagonId = 1,
            Category = "Frontend (Angular)",
            HighLevelGoal = "User Experience & State Management",
            InterviewGotcha = "How do you optimize a page with 1,000+ data rows?"
        });
        modelBuilder.Entity<Skill>().HasData(
            new Skill { Id = 11, SkillCategoryId = 2, TopicName = "RxJS & Reactive Programming (Observables, Subjects)" },
            new Skill { Id = 12, SkillCategoryId = 2, TopicName = "Signal-Based State Management" },
            new Skill { Id = 13, SkillCategoryId = 2, TopicName = "Component Lifecycle & Change Detection (OnPush)" },
            new Skill { Id = 14, SkillCategoryId = 2, TopicName = "Lazy Loading & Route Guards" },
            new Skill { Id = 15, SkillCategoryId = 2, TopicName = "Interceptors (Auth, Error Handling)" },
            new Skill { Id = 16, SkillCategoryId = 2, TopicName = "State Management Libraries (NgRx)" },
            new Skill { Id = 17, SkillCategoryId = 2, TopicName = "Performance Optimization (Bundle Size reduction)" },
            new Skill { Id = 18, SkillCategoryId = 2, TopicName = "Custom Directives & Pipes" },
            new Skill { Id = 19, SkillCategoryId = 2, TopicName = "SSR (Server-Side Rendering) & Hydration" },
            new Skill { Id = 20, SkillCategoryId = 2, TopicName = "WebSockets & SignalR Integration" }
        );

        // 3. DBMS (SQL Server & EF Core)
        modelBuilder.Entity<SkillCategory>().HasData(new SkillCategory
        {
            Id = 3,
            DevHexagonId = 1,
            Category = "DBMS (SQL Server & EF Core)",
            HighLevelGoal = "Data Integrity & Query Optimization",
            InterviewGotcha = "Explain your strategy for database migrations in production."
        });
        modelBuilder.Entity<Skill>().HasData(
            new Skill { Id = 21, SkillCategoryId = 3, TopicName = "Query Execution Plans & Optimization" },
            new Skill { Id = 22, SkillCategoryId = 3, TopicName = "Indexing Strategies (Clustered vs. Non-Clustered)" },
            new Skill { Id = 23, SkillCategoryId = 3, TopicName = "N+1 Problem & Eager/Lazy Loading" },
            new Skill { Id = 24, SkillCategoryId = 3, TopicName = "Dapper for High-Performance Read Paths" },
            new Skill { Id = 25, SkillCategoryId = 3, TopicName = "Database Migrations & CI/CD Versioning" },
            new Skill { Id = 26, SkillCategoryId = 3, TopicName = "Transactions & Isolation Levels (Deadlocks)" },
            new Skill { Id = 27, SkillCategoryId = 3, TopicName = "Connection Pooling" },
            new Skill { Id = 28, SkillCategoryId = 3, TopicName = "Stored Procedures vs. ORM" },
            new Skill { Id = 29, SkillCategoryId = 3, TopicName = "Data Modeling & Normalization" },
            new Skill { Id = 30, SkillCategoryId = 3, TopicName = "Partitioning & Archiving Strategies" }
        );

        // 4. DevOps (Azure)
        modelBuilder.Entity<SkillCategory>().HasData(new SkillCategory
        {
            Id = 4,
            DevHexagonId = 1,
            Category = "DevOps (Azure)",
            HighLevelGoal = "Automation & CI/CD",
            InterviewGotcha = "How do you ensure zero-downtime deployments?"
        });
        modelBuilder.Entity<Skill>().HasData(
            new Skill { Id = 31, SkillCategoryId = 4, TopicName = "CI/CD Pipelines (YAML in Azure DevOps/GitHub Actions)" },
            new Skill { Id = 32, SkillCategoryId = 4, TopicName = "Infrastructure as Code (Bicep/Terraform)" },
            new Skill { Id = 33, SkillCategoryId = 4, TopicName = "Docker Containerization" },
            new Skill { Id = 34, SkillCategoryId = 4, TopicName = "Azure App Services & Serverless (Functions)" },
            new Skill { Id = 35, SkillCategoryId = 4, TopicName = "Secrets Management (Azure Key Vault)" },
            new Skill { Id = 36, SkillCategoryId = 4, TopicName = "Blue/Green & Canary Deployments" },
            new Skill { Id = 37, SkillCategoryId = 4, TopicName = "Role-Based Access Control (RBAC) & Managed Identities" },
            new Skill { Id = 38, SkillCategoryId = 4, TopicName = "Load Balancing & Traffic Manager" },
            new Skill { Id = 39, SkillCategoryId = 4, TopicName = "Container Orchestration (Azure Container Apps)" },
            new Skill { Id = 40, SkillCategoryId = 4, TopicName = "API Management (APIM)" }
        );

        // 5. System Design & Architecture
        modelBuilder.Entity<SkillCategory>().HasData(new SkillCategory
        {
            Id = 5,
            DevHexagonId = 1,
            Category = "System Design & Architecture",
            HighLevelGoal = "Scalability & Resilience",
            InterviewGotcha = "How would you handle a 10x spike in traffic?"
        });
        modelBuilder.Entity<Skill>().HasData(
            new Skill { Id = 41, SkillCategoryId = 5, TopicName = "Domain-Driven Design (DDD - Entities, Aggregates)" },
            new Skill { Id = 42, SkillCategoryId = 5, TopicName = "Microservices vs. Modular Monolith" },
            new Skill { Id = 43, SkillCategoryId = 5, TopicName = "CQRS (Command Query Responsibility Segregation)" },
            new Skill { Id = 44, SkillCategoryId = 5, TopicName = "Event-Driven Architecture (Pub/Sub)" },
            new Skill { Id = 45, SkillCategoryId = 5, TopicName = "Message Brokers (Azure Service Bus, RabbitMQ)" },
            new Skill { Id = 46, SkillCategoryId = 5, TopicName = "API Gateway Pattern" },
            new Skill { Id = 47, SkillCategoryId = 5, TopicName = "Distributed Caching (Redis)" },
            new Skill { Id = 48, SkillCategoryId = 5, TopicName = "Rate Limiting & Throttling" },
            new Skill { Id = 49, SkillCategoryId = 5, TopicName = "SAGA Pattern & Distributed Transactions" },
            new Skill { Id = 50, SkillCategoryId = 5, TopicName = "CAP Theorem & Database Selection" }
        );

        // 6. Testing & Observability
        modelBuilder.Entity<SkillCategory>().HasData(new SkillCategory
        {
            Id = 6,
            DevHexagonId = 1,
            Category = "Testing & Observability",
            HighLevelGoal = "Maintainability & Fast Debugging",
            InterviewGotcha = "How do you identify a memory leak in a production environment?"
        });
        modelBuilder.Entity<Skill>().HasData(
            new Skill { Id = 51, SkillCategoryId = 6, TopicName = "Test-Driven Development (TDD: Red-Green-Refactor)" },
            new Skill { Id = 52, SkillCategoryId = 6, TopicName = "Unit Testing (xUnit)" },
            new Skill { Id = 53, SkillCategoryId = 6, TopicName = "Mocking Frameworks (Moq, NSubstitute)" },
            new Skill { Id = 54, SkillCategoryId = 6, TopicName = "Integration Testing (WebApplicationFactory, Testcontainers)" },
            new Skill { Id = 55, SkillCategoryId = 6, TopicName = "Structured Logging (Serilog)" },
            new Skill { Id = 56, SkillCategoryId = 6, TopicName = "Distributed Tracing (OpenTelemetry)" },
            new Skill { Id = 57, SkillCategoryId = 6, TopicName = "Metrics & Dashboards (Application Insights/Grafana)" },
            new Skill { Id = 58, SkillCategoryId = 6, TopicName = "Application Health Checks" },
            new Skill { Id = 59, SkillCategoryId = 6, TopicName = "Alerting & Incident Response" },
            new Skill { Id = 60, SkillCategoryId = 6, TopicName = "Load Testing (k6, JMeter)" }
        );
    }

}

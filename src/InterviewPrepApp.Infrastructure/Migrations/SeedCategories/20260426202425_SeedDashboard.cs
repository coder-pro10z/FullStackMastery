using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace InterviewPrepApp.Infrastructure.Migrations.SeedCategories
{
    /// <inheritdoc />
    public partial class SeedDashboard : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_QuizAttemptQuestions_Questions_QuestionId",
                table: "QuizAttemptQuestions");

            migrationBuilder.DropColumn(
                name: "QuestionVersionId",
                table: "QuizAttemptQuestions");

            migrationBuilder.RenameColumn(
                name: "ResponseText",
                table: "QuizAttemptResponses",
                newName: "SelectedAnswer");

            migrationBuilder.RenameColumn(
                name: "IsSelfMarkedCorrect",
                table: "QuizAttemptResponses",
                newName: "IsCorrect");

            migrationBuilder.RenameColumn(
                name: "TitleSnapshot",
                table: "QuizAttemptQuestions",
                newName: "OptionDSnapshot");

            migrationBuilder.RenameColumn(
                name: "QuestionId",
                table: "QuizAttemptQuestions",
                newName: "QuizQuestionId");

            migrationBuilder.RenameColumn(
                name: "AnswerTextSnapshot",
                table: "QuizAttemptQuestions",
                newName: "OptionCSnapshot");

            migrationBuilder.RenameIndex(
                name: "IX_QuizAttemptQuestions_QuestionId",
                table: "QuizAttemptQuestions",
                newName: "IX_QuizAttemptQuestions_QuizQuestionId");

            migrationBuilder.AddColumn<string>(
                name: "CorrectAnswerSnapshot",
                table: "QuizAttemptQuestions",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "ExplanationSnapshot",
                table: "QuizAttemptQuestions",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "OptionASnapshot",
                table: "QuizAttemptQuestions",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "OptionBSnapshot",
                table: "QuizAttemptQuestions",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.CreateTable(
                name: "DevHexagons",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Version = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    Role = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    TargetLevel = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DevHexagons", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "ImportJobs",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Type = table.Column<int>(type: "int", nullable: false),
                    Status = table.Column<int>(type: "int", nullable: false),
                    FileName = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    FileSizeBytes = table.Column<long>(type: "bigint", nullable: false),
                    TempFilePath = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    UploadedByUserId = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    UploadedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: false),
                    StartedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CompletedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: true),
                    TotalRows = table.Column<int>(type: "int", nullable: false),
                    ProcessedRows = table.Column<int>(type: "int", nullable: false),
                    FailedRows = table.Column<int>(type: "int", nullable: false),
                    ErrorSummaryJson = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    RetryPayloadJson = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    LastProcessedBatch = table.Column<int>(type: "int", nullable: false),
                    DefaultCategoryId = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ImportJobs", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "QuizQuestions",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ExternalId = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    QuestionText = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    OptionA = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    OptionB = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    OptionC = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    OptionD = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CorrectAnswer = table.Column<string>(type: "nvarchar(1)", maxLength: 1, nullable: false),
                    Explanation = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Role = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Tags = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Difficulty = table.Column<int>(type: "int", nullable: false),
                    Status = table.Column<int>(type: "int", nullable: false),
                    CategoryId = table.Column<int>(type: "int", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_QuizQuestions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_QuizQuestions_Categories_CategoryId",
                        column: x => x.CategoryId,
                        principalTable: "Categories",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "StudyGuideSections",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ExternalId = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Title = table.Column<string>(type: "nvarchar(400)", maxLength: 400, nullable: false),
                    ContentMarkdown = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Role = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Tags = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DisplayOrder = table.Column<int>(type: "int", nullable: false),
                    CategoryId = table.Column<int>(type: "int", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_StudyGuideSections", x => x.Id);
                    table.ForeignKey(
                        name: "FK_StudyGuideSections_Categories_CategoryId",
                        column: x => x.CategoryId,
                        principalTable: "Categories",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "PrimaryMetrics",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Value = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    DevHexagonId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PrimaryMetrics", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PrimaryMetrics_DevHexagons_DevHexagonId",
                        column: x => x.DevHexagonId,
                        principalTable: "DevHexagons",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "SkillCategories",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Category = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    HighLevelGoal = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    InterviewGotcha = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    DevHexagonId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SkillCategories", x => x.Id);
                    table.ForeignKey(
                        name: "FK_SkillCategories_DevHexagons_DevHexagonId",
                        column: x => x.DevHexagonId,
                        principalTable: "DevHexagons",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Skills",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    TopicName = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    SkillCategoryId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Skills", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Skills_SkillCategories_SkillCategoryId",
                        column: x => x.SkillCategoryId,
                        principalTable: "SkillCategories",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.InsertData(
                table: "DevHexagons",
                columns: new[] { "Id", "Role", "TargetLevel", "Version" },
                values: new object[] { 1, ".NET Full Stack Engineer", "Intermediate/Senior", "2026.2" });

            migrationBuilder.InsertData(
                table: "PrimaryMetrics",
                columns: new[] { "Id", "DevHexagonId", "Value" },
                values: new object[,]
                {
                    { 1, 1, "Sub-50ms latency" },
                    { 2, 1, "500+ concurrent users" }
                });

            migrationBuilder.InsertData(
                table: "SkillCategories",
                columns: new[] { "Id", "Category", "DevHexagonId", "HighLevelGoal", "InterviewGotcha" },
                values: new object[,]
                {
                    { 1, "Backend (.NET)", 1, "Reliability & Performance", "How do you handle a failing 3rd party API?" },
                    { 2, "Frontend (Angular)", 1, "User Experience & State Management", "How do you optimize a page with 1,000+ data rows?" },
                    { 3, "DBMS (SQL Server & EF Core)", 1, "Data Integrity & Query Optimization", "Explain your strategy for database migrations in production." },
                    { 4, "DevOps (Azure)", 1, "Automation & CI/CD", "How do you ensure zero-downtime deployments?" },
                    { 5, "System Design & Architecture", 1, "Scalability & Resilience", "How would you handle a 10x spike in traffic?" },
                    { 6, "Testing & Observability", 1, "Maintainability & Fast Debugging", "How do you identify a memory leak in a production environment?" }
                });

            migrationBuilder.InsertData(
                table: "Skills",
                columns: new[] { "Id", "SkillCategoryId", "TopicName" },
                values: new object[,]
                {
                    { 1, 1, "Concurrency (async/await, Task, Thread Pool)" },
                    { 2, 1, "Garbage Collection (Gen 0/1/2, LOH, IDisposable)" },
                    { 3, 1, "Dependency Injection (Lifetimes, Scopes)" },
                    { 4, 1, "Middleware & Request Pipeline" },
                    { 5, 1, "Minimal APIs vs. Controllers" },
                    { 6, 1, "Performance Profiling (BenchmarkDotNet, dotTrace)" },
                    { 7, 1, "Caching Strategies (MemoryCache, Distributed Cache)" },
                    { 8, 1, "Background Services (IHostedService)" },
                    { 9, 1, "Exception Handling & Resiliency (Polly)" },
                    { 10, 1, "Clean Architecture" },
                    { 11, 2, "RxJS & Reactive Programming (Observables, Subjects)" },
                    { 12, 2, "Signal-Based State Management" },
                    { 13, 2, "Component Lifecycle & Change Detection (OnPush)" },
                    { 14, 2, "Lazy Loading & Route Guards" },
                    { 15, 2, "Interceptors (Auth, Error Handling)" },
                    { 16, 2, "State Management Libraries (NgRx)" },
                    { 17, 2, "Performance Optimization (Bundle Size reduction)" },
                    { 18, 2, "Custom Directives & Pipes" },
                    { 19, 2, "SSR (Server-Side Rendering) & Hydration" },
                    { 20, 2, "WebSockets & SignalR Integration" },
                    { 21, 3, "Query Execution Plans & Optimization" },
                    { 22, 3, "Indexing Strategies (Clustered vs. Non-Clustered)" },
                    { 23, 3, "N+1 Problem & Eager/Lazy Loading" },
                    { 24, 3, "Dapper for High-Performance Read Paths" },
                    { 25, 3, "Database Migrations & CI/CD Versioning" },
                    { 26, 3, "Transactions & Isolation Levels (Deadlocks)" },
                    { 27, 3, "Connection Pooling" },
                    { 28, 3, "Stored Procedures vs. ORM" },
                    { 29, 3, "Data Modeling & Normalization" },
                    { 30, 3, "Partitioning & Archiving Strategies" },
                    { 31, 4, "CI/CD Pipelines (YAML in Azure DevOps/GitHub Actions)" },
                    { 32, 4, "Infrastructure as Code (Bicep/Terraform)" },
                    { 33, 4, "Docker Containerization" },
                    { 34, 4, "Azure App Services & Serverless (Functions)" },
                    { 35, 4, "Secrets Management (Azure Key Vault)" },
                    { 36, 4, "Blue/Green & Canary Deployments" },
                    { 37, 4, "Role-Based Access Control (RBAC) & Managed Identities" },
                    { 38, 4, "Load Balancing & Traffic Manager" },
                    { 39, 4, "Container Orchestration (Azure Container Apps)" },
                    { 40, 4, "API Management (APIM)" },
                    { 41, 5, "Domain-Driven Design (DDD - Entities, Aggregates)" },
                    { 42, 5, "Microservices vs. Modular Monolith" },
                    { 43, 5, "CQRS (Command Query Responsibility Segregation)" },
                    { 44, 5, "Event-Driven Architecture (Pub/Sub)" },
                    { 45, 5, "Message Brokers (Azure Service Bus, RabbitMQ)" },
                    { 46, 5, "API Gateway Pattern" },
                    { 47, 5, "Distributed Caching (Redis)" },
                    { 48, 5, "Rate Limiting & Throttling" },
                    { 49, 5, "SAGA Pattern & Distributed Transactions" },
                    { 50, 5, "CAP Theorem & Database Selection" },
                    { 51, 6, "Test-Driven Development (TDD: Red-Green-Refactor)" },
                    { 52, 6, "Unit Testing (xUnit)" },
                    { 53, 6, "Mocking Frameworks (Moq, NSubstitute)" },
                    { 54, 6, "Integration Testing (WebApplicationFactory, Testcontainers)" },
                    { 55, 6, "Structured Logging (Serilog)" },
                    { 56, 6, "Distributed Tracing (OpenTelemetry)" },
                    { 57, 6, "Metrics & Dashboards (Application Insights/Grafana)" },
                    { 58, 6, "Application Health Checks" },
                    { 59, 6, "Alerting & Incident Response" },
                    { 60, 6, "Load Testing (k6, JMeter)" }
                });

            migrationBuilder.CreateIndex(
                name: "IX_ImportJobs_UploadedByUserId_UploadedAtUtc",
                table: "ImportJobs",
                columns: new[] { "UploadedByUserId", "UploadedAtUtc" });

            migrationBuilder.CreateIndex(
                name: "IX_PrimaryMetrics_DevHexagonId",
                table: "PrimaryMetrics",
                column: "DevHexagonId");

            migrationBuilder.CreateIndex(
                name: "IX_QuizQuestions_CategoryId",
                table: "QuizQuestions",
                column: "CategoryId");

            migrationBuilder.CreateIndex(
                name: "IX_QuizQuestions_ExternalId",
                table: "QuizQuestions",
                column: "ExternalId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_SkillCategories_DevHexagonId",
                table: "SkillCategories",
                column: "DevHexagonId");

            migrationBuilder.CreateIndex(
                name: "IX_Skills_SkillCategoryId",
                table: "Skills",
                column: "SkillCategoryId");

            migrationBuilder.CreateIndex(
                name: "IX_StudyGuideSections_CategoryId",
                table: "StudyGuideSections",
                column: "CategoryId");

            migrationBuilder.CreateIndex(
                name: "IX_StudyGuideSections_ExternalId",
                table: "StudyGuideSections",
                column: "ExternalId",
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_QuizAttemptQuestions_QuizQuestions_QuizQuestionId",
                table: "QuizAttemptQuestions",
                column: "QuizQuestionId",
                principalTable: "QuizQuestions",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_QuizAttemptQuestions_QuizQuestions_QuizQuestionId",
                table: "QuizAttemptQuestions");

            migrationBuilder.DropTable(
                name: "ImportJobs");

            migrationBuilder.DropTable(
                name: "PrimaryMetrics");

            migrationBuilder.DropTable(
                name: "QuizQuestions");

            migrationBuilder.DropTable(
                name: "Skills");

            migrationBuilder.DropTable(
                name: "StudyGuideSections");

            migrationBuilder.DropTable(
                name: "SkillCategories");

            migrationBuilder.DropTable(
                name: "DevHexagons");

            migrationBuilder.DropColumn(
                name: "CorrectAnswerSnapshot",
                table: "QuizAttemptQuestions");

            migrationBuilder.DropColumn(
                name: "ExplanationSnapshot",
                table: "QuizAttemptQuestions");

            migrationBuilder.DropColumn(
                name: "OptionASnapshot",
                table: "QuizAttemptQuestions");

            migrationBuilder.DropColumn(
                name: "OptionBSnapshot",
                table: "QuizAttemptQuestions");

            migrationBuilder.RenameColumn(
                name: "SelectedAnswer",
                table: "QuizAttemptResponses",
                newName: "ResponseText");

            migrationBuilder.RenameColumn(
                name: "IsCorrect",
                table: "QuizAttemptResponses",
                newName: "IsSelfMarkedCorrect");

            migrationBuilder.RenameColumn(
                name: "QuizQuestionId",
                table: "QuizAttemptQuestions",
                newName: "QuestionId");

            migrationBuilder.RenameColumn(
                name: "OptionDSnapshot",
                table: "QuizAttemptQuestions",
                newName: "TitleSnapshot");

            migrationBuilder.RenameColumn(
                name: "OptionCSnapshot",
                table: "QuizAttemptQuestions",
                newName: "AnswerTextSnapshot");

            migrationBuilder.RenameIndex(
                name: "IX_QuizAttemptQuestions_QuizQuestionId",
                table: "QuizAttemptQuestions",
                newName: "IX_QuizAttemptQuestions_QuestionId");

            migrationBuilder.AddColumn<int>(
                name: "QuestionVersionId",
                table: "QuizAttemptQuestions",
                type: "int",
                nullable: true);

            migrationBuilder.AddForeignKey(
                name: "FK_QuizAttemptQuestions_Questions_QuestionId",
                table: "QuizAttemptQuestions",
                column: "QuestionId",
                principalTable: "Questions",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }
    }
}

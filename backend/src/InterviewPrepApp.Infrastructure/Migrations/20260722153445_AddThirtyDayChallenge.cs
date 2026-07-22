using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace InterviewPrepApp.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddThirtyDayChallenge : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "ChallengeDays",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    DayNumber = table.Column<int>(type: "integer", nullable: false),
                    Title = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    MainFocus = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    SqlCodingNote = table.Column<string>(type: "text", nullable: true),
                    Notes = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ChallengeDays", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Competencies",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    CompetencyId = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: false),
                    Category = table.Column<int>(type: "integer", nullable: false),
                    Title = table.Column<string>(type: "character varying(300)", maxLength: 300, nullable: false),
                    SortOrder = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Competencies", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "UserChallengeProgresses",
                columns: table => new
                {
                    UserId = table.Column<string>(type: "text", nullable: false),
                    ChallengeDayId = table.Column<int>(type: "integer", nullable: false),
                    IsCompleted = table.Column<bool>(type: "boolean", nullable: false),
                    CompletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    Notes = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserChallengeProgresses", x => new { x.UserId, x.ChallengeDayId });
                    table.ForeignKey(
                        name: "FK_UserChallengeProgresses_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_UserChallengeProgresses_ChallengeDays_ChallengeDayId",
                        column: x => x.ChallengeDayId,
                        principalTable: "ChallengeDays",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ChallengeDayCompetencies",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    ChallengeDayId = table.Column<int>(type: "integer", nullable: false),
                    CompetencyId = table.Column<int>(type: "integer", nullable: false),
                    IsPrimary = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ChallengeDayCompetencies", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ChallengeDayCompetencies_ChallengeDays_ChallengeDayId",
                        column: x => x.ChallengeDayId,
                        principalTable: "ChallengeDays",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ChallengeDayCompetencies_Competencies_CompetencyId",
                        column: x => x.CompetencyId,
                        principalTable: "Competencies",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.InsertData(
                table: "ChallengeDays",
                columns: new[] { "Id", "DayNumber", "MainFocus", "Notes", "SqlCodingNote", "Title" },
                values: new object[,]
                {
                    { 1, 1, "Deep-dive into how .NET manages memory, value/reference types, and boxing. Intro to Collections and access scoping.", "Focus on stack vs heap diagrams. Draw the memory model.", null, "Memory Management & C# Fundamentals" },
                    { 2, 2, "Master the four pillars of OOP with real examples. Cover Generics and the Interface vs Abstract Class decision.", "Write one concrete example of each OOP pillar in C#.", "SC01 – Find 2nd Highest Salary", "OOP Foundations" },
                    { 3, 3, "Full coverage of .NET collection types and their time complexity. Pair with SQL Join deep-dive.", "Draw a Venn diagram for SQL join types.", "SC02 – Find Nth Highest Salary", "Collections + SQL Joins" },
                    { 4, 4, "Func/Action/Predicate delegates, lambda expressions, and Extension Methods. Intro to Exception Handling.", "Implement a fluent builder using extension methods.", "SC03, SC04 – Find & Delete Duplicate Records", "Methods, Delegates & Lambdas" },
                    { 5, 5, "GC generations, LOH, Dispose vs Finalize pattern (IDisposable). Full exception handling best practices.", "Write a custom exception hierarchy for a domain.", "SC05, SC06, SC07, SC08", "Exception Handling & Garbage Collection" },
                    { 6, 6, "Apply all 5 SOLID principles with code examples. Revisit Interface vs Abstract Class decision tree.", "Refactor a violation of each SOLID principle.", "SC09, SC10, SC11, SC12", "SOLID Principles" },
                    { 7, 7, "Generic type constraints, covariance/contravariance, and advanced extension method patterns.", "Build a generic repository pattern using constraints.", "SC13, SC14, SC15 + SQL Revision SC01–SC15", "Generics & Extension Methods" },
                    { 8, 8, "Publisher-Subscriber pattern, EventHandler<T>, custom event args, weak event pattern.", "Wire up a real event system: ProgressChanged event.", "SQL Mock Round #1", "Events & Delegates" },
                    { 9, 9, "Deferred vs immediate execution, expression trees, IEnumerable vs IQueryable. Full LINQ operator coverage.", "Profile a LINQ query with vs without AsNoTracking.", "SQL Mock Round #2", "LINQ Deep Dive" },
                    { 10, 10, "async/await internals, Task vs Task<T>, Task.WhenAll/WhenAny, ConfigureAwait, CPU vs I/O bound work.", "Build a parallel async pipeline with cancellation.", "SQL Mock Round #3", "Async Programming" },
                    { 11, 11, "Middleware order, request pipeline internals, ASP.NET Core vs .NET Framework architecture differences.", "Draw the ASP.NET Core request pipeline from memory.", "SQL Revision – Window Functions", "ASP.NET Core Pipeline" },
                    { 12, 12, "Scoped vs Transient vs Singleton lifetimes, IServiceCollection, service registration patterns. SOLID revisit.", "Identify which lifetime to use in 5 different scenarios.", "SQL Revision – Joins & CTEs", "Dependency Injection" },
                    { 13, 13, "Code-First migrations, DbContext lifecycle, change tracking, IQueryable vs IEnumerable in EF context.", "Profile N+1 query and fix with Include/ThenInclude.", "SQL Revision – Ranking Problems", "Entity Framework Core" },
                    { 14, 14, "RESTful design principles, HTTP status codes, model binding, [FromBody]/[FromQuery]/[FromRoute], validation.", "Design a complete REST API contract for a resource.", "SQL Timed Practice", "REST APIs" },
                    { 15, 15, "JWT token lifecycle, Claims, Roles, Policies. AuthN vs AuthZ boundary. ASP.NET Identity overview.", "Trace a JWT request from browser → API → DB.", "SQL Mock Interview", "Authentication & Authorization" },
                    { 16, 16, "Generic Repository, Unit of Work, EF Core integration. Why and when to use the pattern.", "Implement a testable generic repository with IUnitOfWork.", "SQL Revision", "Repository Pattern" },
                    { 17, 17, "IExceptionHandler, ProblemDetails (RFC 7807), structured logging with ILogger, configuration providers.", "Wire up Serilog or structured logging with correlation IDs.", "SQL Revision", "Global Exception Handling" },
                    { 18, 18, "Clustered vs non-clustered indexes, execution plans, query tuning strategies, covering indexes.", "Run EXPLAIN on 3 queries and optimize each.", "Apply SC01–SC15 with Index Analysis", "SQL Performance" },
                    { 19, 19, "ACID properties, isolation levels (Read Uncommitted → Serializable), deadlock detection and prevention.", "Reproduce a deadlock scenario and resolve it.", "Apply SQL Coding with Transactions", "Transactions" },
                    { 20, 20, "Caching strategies, async I/O, response compression, pagination best practices. Production troubleshooting.", "Profile an API endpoint and apply 3 optimizations.", "SQL Performance Mock", "API Performance" },
                    { 21, 21, "CORS policy configuration, preflight requests. Angular HttpClient, HTTP interceptors, retry strategies.", "Build a global error-handling interceptor in Angular.", "SQL Revision", "CORS & Angular HTTP" },
                    { 22, 22, "Command Query Responsibility Segregation pattern. MediatR pipeline behaviors, notifications.", "Compare CQRS vs standard DI service approach tradeoffs.", "SQL Revision", "CQRS & MediatR" },
                    { 23, 23, "CTEs, window functions, stored procedures vs functions, views, temp tables, normalization deep-dive.", "Write a complex reporting query using CTEs + Window Functions.", "Integrate SC01–SC15 with Advanced SQL", "Advanced SQL Theory" },
                    { 24, 24, "Angular DI system, RxJS Observables vs Promises, component lifecycle hooks, decorators, component communication.", "Build a parent→child→grandchild component data flow.", "SQL Mock Interview", "Angular Fundamentals" },
                    { 25, 25, "OnPush change detection, reactive forms, lazy loading, route guards, custom directives & pipes, NgRx Signals.", "Implement a feature with OnPush + async pipe + trackBy.", "SQL Timed Challenge", "Angular Advanced" },
                    { 26, 26, "Full-stack integration of all 75 competencies in a single production-grade feature. End-to-end vertical slice.", "Build one complete vertical slice from DB → API → Angular.", "SQL Integration in Project", "Enterprise Project" },
                    { 27, 27, "Root cause analysis, distributed tracing, log correlation, production API troubleshooting playbook.", "Walk through 3 real production bug scenarios and diagnose.", "Production SQL Scenarios", "Production Debugging" },
                    { 28, 28, "Full revision of all 75 competencies. Cover every category without reference materials.", "Time-box: 5 mins per competency. No notes allowed.", "Solve SC01–SC15 Without Notes", "Complete Revision" },
                    { 29, 29, "Technical + SQL coding + behavioral + production interview simulation. All 75 competencies in scope.", "Record yourself answering 10 random competency questions.", "Live SQL Coding Interview", "Mock Interviews" },
                    { 30, 30, "Final mock interview covering all 75 competencies. Identify and revise remaining weak areas.", "Score yourself on each of the 75 competencies 1–5.", "Final SQL Assessment", "Final Assessment" }
                });

            migrationBuilder.InsertData(
                table: "Competencies",
                columns: new[] { "Id", "Category", "CompetencyId", "SortOrder", "Title" },
                values: new object[,]
                {
                    { 1, 1, "C01", 1, "OOP Principles (Encapsulation, Inheritance, Polymorphism, Abstraction)" },
                    { 2, 1, "C02", 2, "Memory Management (Stack vs Heap, Value Types vs Reference Types, Boxing & Unboxing)" },
                    { 3, 1, "C03", 3, "Garbage Collection (GC, Generations 0/1/2, LOH, Dispose vs Finalize)" },
                    { 4, 1, "C04", 4, "Exception Handling (try-catch-finally, Custom Exceptions, throw vs throw ex)" },
                    { 5, 1, "C05", 5, "Async Programming (async/await, Task, Task.Run(), CPU-bound vs I/O-bound)" },
                    { 6, 1, "C06", 6, "Collections (Array, List, Dictionary, HashSet, Queue, Stack, Concurrent Collections)" },
                    { 7, 1, "C07", 7, "LINQ (Deferred vs Immediate Execution, IEnumerable vs IQueryable)" },
                    { 8, 1, "C08", 8, "Delegates & Lambda Expressions" },
                    { 9, 1, "C09", 9, "Events (Publisher-Subscriber Pattern)" },
                    { 10, 1, "C10", 10, "Generics" },
                    { 11, 1, "C11", 11, "Interface vs Abstract Class" },
                    { 12, 1, "C12", 12, "Access Modifiers" },
                    { 13, 1, "C13", 13, "Static Concepts (Static Class, Static Method, Static Constructor, Singleton)" },
                    { 14, 1, "C14", 14, "Extension Methods" },
                    { 15, 1, "C15", 15, "SOLID Principles" },
                    { 16, 2, "A01", 1, "ASP.NET Core vs .NET Framework" },
                    { 17, 2, "A02", 2, "Request Pipeline & Middleware" },
                    { 18, 2, "A03", 3, "Dependency Injection & Service Lifetimes" },
                    { 19, 2, "A04", 4, "IEnumerable vs IQueryable vs IAsyncEnumerable" },
                    { 20, 2, "A05", 5, "Entity Framework Core" },
                    { 21, 2, "A06", 6, "Authentication vs Authorization" },
                    { 22, 2, "A07", 7, "REST APIs & HTTP Status Codes" },
                    { 23, 2, "A08", 8, "Model Binding & Validation" },
                    { 24, 2, "A09", 9, "Repository Pattern & Unit of Work" },
                    { 25, 2, "A10", 10, "Global Exception Handling" },
                    { 26, 2, "A11", 11, "CORS" },
                    { 27, 2, "A12", 12, "Logging & Configuration" },
                    { 28, 2, "A13", 13, "API Performance Optimization" },
                    { 29, 2, "A14", 14, "CQRS & MediatR" },
                    { 30, 2, "A15", 15, "Production API Troubleshooting" },
                    { 31, 3, "S01", 1, "SQL Joins" },
                    { 32, 3, "S02", 2, "Clustered vs Non-Clustered Index" },
                    { 33, 3, "S03", 3, "Common Table Expressions (CTE)" },
                    { 34, 3, "S04", 4, "Window Functions" },
                    { 35, 3, "S05", 5, "Stored Procedures vs Functions" },
                    { 36, 3, "S06", 6, "Transactions & ACID Properties" },
                    { 37, 3, "S07", 7, "Isolation Levels" },
                    { 38, 3, "S08", 8, "Deadlocks" },
                    { 39, 3, "S09", 9, "Execution Plans" },
                    { 40, 3, "S10", 10, "Query Performance Tuning" },
                    { 41, 3, "S11", 11, "Temp Tables vs Table Variables" },
                    { 42, 3, "S12", 12, "Views" },
                    { 43, 3, "S13", 13, "Keys & Constraints" },
                    { 44, 3, "S14", 14, "Pagination" },
                    { 45, 3, "S15", 15, "Normalization vs Denormalization" },
                    { 46, 4, "SC01", 1, "Find the 2nd Highest Salary" },
                    { 47, 4, "SC02", 2, "Find the Nth Highest Salary" },
                    { 48, 4, "SC03", 3, "Find Duplicate Records" },
                    { 49, 4, "SC04", 4, "Delete Duplicate Records" },
                    { 50, 4, "SC05", 5, "Employees Earning More Than Their Manager" },
                    { 51, 4, "SC06", 6, "Highest Salary in Each Department" },
                    { 52, 4, "SC07", 7, "Department with Maximum Employees" },
                    { 53, 4, "SC08", 8, "Customers with No Orders" },
                    { 54, 4, "SC09", 9, "Running Total" },
                    { 55, 4, "SC10", 10, "Top 3 Salaries per Department" },
                    { 56, 4, "SC11", 11, "Employees Joined in the Last 30 Days" },
                    { 57, 4, "SC12", 12, "Find Missing IDs" },
                    { 58, 4, "SC13", 13, "Swap Column Values" },
                    { 59, 4, "SC14", 14, "Consecutive Duplicate Values" },
                    { 60, 4, "SC15", 15, "SQL Pagination" },
                    { 61, 5, "NG01", 1, "Dependency Injection (DI)" },
                    { 62, 5, "NG02", 2, "Observables vs Promises" },
                    { 63, 5, "NG03", 3, "Component Lifecycle Hooks" },
                    { 64, 5, "NG04", 4, "Change Detection Strategy" },
                    { 65, 5, "NG05", 5, "Reactive Forms" },
                    { 66, 5, "NG06", 6, "Angular Routing & Lazy Loading" },
                    { 67, 5, "NG07", 7, "HTTP Client & Interceptors" },
                    { 68, 5, "NG08", 8, "JWT Authentication & Route Guards" },
                    { 69, 5, "NG09", 9, "Angular Decorators" },
                    { 70, 5, "NG10", 10, "Component Communication" },
                    { 71, 5, "NG11", 11, "Directives & Pipes" },
                    { 72, 5, "NG12", 12, "Standalone Components & Modules" },
                    { 73, 5, "NG13", 13, "State Management (BehaviorSubject / NgRx / Signals)" },
                    { 74, 5, "NG14", 14, "Performance Optimization (trackBy, Lazy Loading, OnPush)" },
                    { 75, 5, "NG15", 15, "Signals vs Observables" }
                });

            migrationBuilder.InsertData(
                table: "ChallengeDayCompetencies",
                columns: new[] { "Id", "ChallengeDayId", "CompetencyId", "IsPrimary" },
                values: new object[,]
                {
                    { 1, 1, 2, true },
                    { 2, 1, 6, true },
                    { 3, 1, 12, true },
                    { 4, 2, 1, true },
                    { 5, 2, 10, true },
                    { 6, 2, 11, true },
                    { 7, 2, 46, false },
                    { 8, 3, 6, true },
                    { 9, 3, 31, true },
                    { 10, 3, 47, false },
                    { 11, 4, 8, true },
                    { 12, 4, 14, true },
                    { 13, 4, 4, true },
                    { 14, 4, 48, false },
                    { 15, 4, 49, false },
                    { 16, 5, 3, true },
                    { 17, 5, 4, true },
                    { 18, 5, 50, false },
                    { 19, 5, 51, false },
                    { 20, 5, 52, false },
                    { 21, 5, 53, false },
                    { 22, 6, 11, true },
                    { 23, 6, 15, true },
                    { 24, 6, 54, false },
                    { 25, 6, 55, false },
                    { 26, 6, 56, false },
                    { 27, 6, 57, false },
                    { 28, 7, 10, true },
                    { 29, 7, 14, true },
                    { 30, 7, 58, false },
                    { 31, 7, 59, false },
                    { 32, 7, 60, false },
                    { 33, 8, 8, true },
                    { 34, 8, 9, true },
                    { 35, 9, 7, true },
                    { 36, 9, 19, true },
                    { 37, 10, 5, true },
                    { 38, 11, 16, true },
                    { 39, 11, 17, true },
                    { 40, 11, 34, false },
                    { 41, 12, 18, true },
                    { 42, 12, 15, true },
                    { 43, 12, 31, false },
                    { 44, 12, 33, false },
                    { 45, 13, 20, true },
                    { 46, 13, 19, true },
                    { 47, 13, 34, false },
                    { 48, 14, 22, true },
                    { 49, 14, 23, true },
                    { 50, 15, 21, true },
                    { 51, 16, 24, true },
                    { 52, 16, 20, true },
                    { 53, 17, 25, true },
                    { 54, 17, 27, true },
                    { 55, 18, 32, true },
                    { 56, 18, 39, true },
                    { 57, 18, 40, true },
                    { 58, 19, 36, true },
                    { 59, 19, 37, true },
                    { 60, 19, 38, true },
                    { 61, 20, 28, true },
                    { 62, 20, 30, true },
                    { 63, 21, 26, true },
                    { 64, 21, 67, true },
                    { 65, 22, 29, true },
                    { 66, 23, 33, true },
                    { 67, 23, 34, true },
                    { 68, 23, 35, true },
                    { 69, 23, 41, true },
                    { 70, 23, 42, true },
                    { 71, 23, 43, true },
                    { 72, 23, 44, true },
                    { 73, 23, 45, true },
                    { 74, 24, 61, true },
                    { 75, 24, 62, true },
                    { 76, 24, 63, true },
                    { 77, 24, 69, true },
                    { 78, 24, 70, true },
                    { 79, 25, 64, true },
                    { 80, 25, 65, true },
                    { 81, 25, 66, true },
                    { 82, 25, 68, true },
                    { 83, 25, 71, true },
                    { 84, 25, 72, true },
                    { 85, 25, 73, true },
                    { 86, 25, 74, true },
                    { 87, 25, 75, true },
                    { 88, 26, 7, true },
                    { 89, 26, 20, true },
                    { 90, 26, 31, true },
                    { 91, 26, 67, true },
                    { 92, 27, 30, true },
                    { 93, 27, 25, true },
                    { 94, 27, 40, true },
                    { 95, 28, 5, true },
                    { 96, 28, 15, true },
                    { 97, 28, 18, true },
                    { 98, 29, 1, true },
                    { 99, 29, 22, true },
                    { 100, 29, 61, true },
                    { 101, 30, 15, true },
                    { 102, 30, 20, true },
                    { 103, 30, 75, true }
                });

            migrationBuilder.CreateIndex(
                name: "IX_ChallengeDayCompetencies_ChallengeDayId",
                table: "ChallengeDayCompetencies",
                column: "ChallengeDayId");

            migrationBuilder.CreateIndex(
                name: "IX_ChallengeDayCompetencies_CompetencyId",
                table: "ChallengeDayCompetencies",
                column: "CompetencyId");

            migrationBuilder.CreateIndex(
                name: "IX_ChallengeDays_DayNumber",
                table: "ChallengeDays",
                column: "DayNumber",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Competencies_CompetencyId",
                table: "Competencies",
                column: "CompetencyId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_UserChallengeProgresses_ChallengeDayId",
                table: "UserChallengeProgresses",
                column: "ChallengeDayId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ChallengeDayCompetencies");

            migrationBuilder.DropTable(
                name: "UserChallengeProgresses");

            migrationBuilder.DropTable(
                name: "Competencies");

            migrationBuilder.DropTable(
                name: "ChallengeDays");
        }
    }
}

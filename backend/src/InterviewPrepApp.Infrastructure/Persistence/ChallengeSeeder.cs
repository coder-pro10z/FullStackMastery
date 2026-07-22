using InterviewPrepApp.Domain.Entities;
using InterviewPrepApp.Domain.Enums;

namespace InterviewPrepApp.Infrastructure.Persistence;

/// <summary>
/// Static seed data for the 30-Day Challenge module.
/// All IDs are fixed so that HasData() is idempotent across migrations.
/// NEVER renumber or reorder these records — they are the permanent competency index.
/// </summary>
public static class ChallengeSeeder
{
    // ─── Competency IDs (1-75 fixed forever) ─────────────────────────────
    //  C# Core     → DB IDs 1-15
    //  ASP.NET     → DB IDs 16-30
    //  SQL Theory  → DB IDs 31-45
    //  SQL Coding  → DB IDs 46-60
    //  Angular     → DB IDs 61-75

    public static Competency[] GetSeedCompetencies() =>
    [
        // ── C# Core (C01–C15) ──────────────────────────────────────────────
        new() { Id =  1, CompetencyId = "C01", Category = CompetencyCategory.CSharpCore, Title = "OOP Principles (Encapsulation, Inheritance, Polymorphism, Abstraction)", SortOrder =  1 },
        new() { Id =  2, CompetencyId = "C02", Category = CompetencyCategory.CSharpCore, Title = "Memory Management (Stack vs Heap, Value Types vs Reference Types, Boxing & Unboxing)", SortOrder =  2 },
        new() { Id =  3, CompetencyId = "C03", Category = CompetencyCategory.CSharpCore, Title = "Garbage Collection (GC, Generations 0/1/2, LOH, Dispose vs Finalize)", SortOrder =  3 },
        new() { Id =  4, CompetencyId = "C04", Category = CompetencyCategory.CSharpCore, Title = "Exception Handling (try-catch-finally, Custom Exceptions, throw vs throw ex)", SortOrder =  4 },
        new() { Id =  5, CompetencyId = "C05", Category = CompetencyCategory.CSharpCore, Title = "Async Programming (async/await, Task, Task.Run(), CPU-bound vs I/O-bound)", SortOrder =  5 },
        new() { Id =  6, CompetencyId = "C06", Category = CompetencyCategory.CSharpCore, Title = "Collections (Array, List, Dictionary, HashSet, Queue, Stack, Concurrent Collections)", SortOrder =  6 },
        new() { Id =  7, CompetencyId = "C07", Category = CompetencyCategory.CSharpCore, Title = "LINQ (Deferred vs Immediate Execution, IEnumerable vs IQueryable)", SortOrder =  7 },
        new() { Id =  8, CompetencyId = "C08", Category = CompetencyCategory.CSharpCore, Title = "Delegates & Lambda Expressions", SortOrder =  8 },
        new() { Id =  9, CompetencyId = "C09", Category = CompetencyCategory.CSharpCore, Title = "Events (Publisher-Subscriber Pattern)", SortOrder =  9 },
        new() { Id = 10, CompetencyId = "C10", Category = CompetencyCategory.CSharpCore, Title = "Generics", SortOrder = 10 },
        new() { Id = 11, CompetencyId = "C11", Category = CompetencyCategory.CSharpCore, Title = "Interface vs Abstract Class", SortOrder = 11 },
        new() { Id = 12, CompetencyId = "C12", Category = CompetencyCategory.CSharpCore, Title = "Access Modifiers", SortOrder = 12 },
        new() { Id = 13, CompetencyId = "C13", Category = CompetencyCategory.CSharpCore, Title = "Static Concepts (Static Class, Static Method, Static Constructor, Singleton)", SortOrder = 13 },
        new() { Id = 14, CompetencyId = "C14", Category = CompetencyCategory.CSharpCore, Title = "Extension Methods", SortOrder = 14 },
        new() { Id = 15, CompetencyId = "C15", Category = CompetencyCategory.CSharpCore, Title = "SOLID Principles", SortOrder = 15 },

        // ── ASP.NET Core (A01–A15) ────────────────────────────────────────
        new() { Id = 16, CompetencyId = "A01", Category = CompetencyCategory.AspNetCore, Title = "ASP.NET Core vs .NET Framework", SortOrder =  1 },
        new() { Id = 17, CompetencyId = "A02", Category = CompetencyCategory.AspNetCore, Title = "Request Pipeline & Middleware", SortOrder =  2 },
        new() { Id = 18, CompetencyId = "A03", Category = CompetencyCategory.AspNetCore, Title = "Dependency Injection & Service Lifetimes", SortOrder =  3 },
        new() { Id = 19, CompetencyId = "A04", Category = CompetencyCategory.AspNetCore, Title = "IEnumerable vs IQueryable vs IAsyncEnumerable", SortOrder =  4 },
        new() { Id = 20, CompetencyId = "A05", Category = CompetencyCategory.AspNetCore, Title = "Entity Framework Core", SortOrder =  5 },
        new() { Id = 21, CompetencyId = "A06", Category = CompetencyCategory.AspNetCore, Title = "Authentication vs Authorization", SortOrder =  6 },
        new() { Id = 22, CompetencyId = "A07", Category = CompetencyCategory.AspNetCore, Title = "REST APIs & HTTP Status Codes", SortOrder =  7 },
        new() { Id = 23, CompetencyId = "A08", Category = CompetencyCategory.AspNetCore, Title = "Model Binding & Validation", SortOrder =  8 },
        new() { Id = 24, CompetencyId = "A09", Category = CompetencyCategory.AspNetCore, Title = "Repository Pattern & Unit of Work", SortOrder =  9 },
        new() { Id = 25, CompetencyId = "A10", Category = CompetencyCategory.AspNetCore, Title = "Global Exception Handling", SortOrder = 10 },
        new() { Id = 26, CompetencyId = "A11", Category = CompetencyCategory.AspNetCore, Title = "CORS", SortOrder = 11 },
        new() { Id = 27, CompetencyId = "A12", Category = CompetencyCategory.AspNetCore, Title = "Logging & Configuration", SortOrder = 12 },
        new() { Id = 28, CompetencyId = "A13", Category = CompetencyCategory.AspNetCore, Title = "API Performance Optimization", SortOrder = 13 },
        new() { Id = 29, CompetencyId = "A14", Category = CompetencyCategory.AspNetCore, Title = "CQRS & MediatR", SortOrder = 14 },
        new() { Id = 30, CompetencyId = "A15", Category = CompetencyCategory.AspNetCore, Title = "Production API Troubleshooting", SortOrder = 15 },

        // ── SQL Theory (S01–S15) ──────────────────────────────────────────
        new() { Id = 31, CompetencyId = "S01", Category = CompetencyCategory.SqlTheory, Title = "SQL Joins", SortOrder =  1 },
        new() { Id = 32, CompetencyId = "S02", Category = CompetencyCategory.SqlTheory, Title = "Clustered vs Non-Clustered Index", SortOrder =  2 },
        new() { Id = 33, CompetencyId = "S03", Category = CompetencyCategory.SqlTheory, Title = "Common Table Expressions (CTE)", SortOrder =  3 },
        new() { Id = 34, CompetencyId = "S04", Category = CompetencyCategory.SqlTheory, Title = "Window Functions", SortOrder =  4 },
        new() { Id = 35, CompetencyId = "S05", Category = CompetencyCategory.SqlTheory, Title = "Stored Procedures vs Functions", SortOrder =  5 },
        new() { Id = 36, CompetencyId = "S06", Category = CompetencyCategory.SqlTheory, Title = "Transactions & ACID Properties", SortOrder =  6 },
        new() { Id = 37, CompetencyId = "S07", Category = CompetencyCategory.SqlTheory, Title = "Isolation Levels", SortOrder =  7 },
        new() { Id = 38, CompetencyId = "S08", Category = CompetencyCategory.SqlTheory, Title = "Deadlocks", SortOrder =  8 },
        new() { Id = 39, CompetencyId = "S09", Category = CompetencyCategory.SqlTheory, Title = "Execution Plans", SortOrder =  9 },
        new() { Id = 40, CompetencyId = "S10", Category = CompetencyCategory.SqlTheory, Title = "Query Performance Tuning", SortOrder = 10 },
        new() { Id = 41, CompetencyId = "S11", Category = CompetencyCategory.SqlTheory, Title = "Temp Tables vs Table Variables", SortOrder = 11 },
        new() { Id = 42, CompetencyId = "S12", Category = CompetencyCategory.SqlTheory, Title = "Views", SortOrder = 12 },
        new() { Id = 43, CompetencyId = "S13", Category = CompetencyCategory.SqlTheory, Title = "Keys & Constraints", SortOrder = 13 },
        new() { Id = 44, CompetencyId = "S14", Category = CompetencyCategory.SqlTheory, Title = "Pagination", SortOrder = 14 },
        new() { Id = 45, CompetencyId = "S15", Category = CompetencyCategory.SqlTheory, Title = "Normalization vs Denormalization", SortOrder = 15 },

        // ── SQL Coding (SC01–SC15) ────────────────────────────────────────
        new() { Id = 46, CompetencyId = "SC01", Category = CompetencyCategory.SqlCoding, Title = "Find the 2nd Highest Salary", SortOrder =  1 },
        new() { Id = 47, CompetencyId = "SC02", Category = CompetencyCategory.SqlCoding, Title = "Find the Nth Highest Salary", SortOrder =  2 },
        new() { Id = 48, CompetencyId = "SC03", Category = CompetencyCategory.SqlCoding, Title = "Find Duplicate Records", SortOrder =  3 },
        new() { Id = 49, CompetencyId = "SC04", Category = CompetencyCategory.SqlCoding, Title = "Delete Duplicate Records", SortOrder =  4 },
        new() { Id = 50, CompetencyId = "SC05", Category = CompetencyCategory.SqlCoding, Title = "Employees Earning More Than Their Manager", SortOrder =  5 },
        new() { Id = 51, CompetencyId = "SC06", Category = CompetencyCategory.SqlCoding, Title = "Highest Salary in Each Department", SortOrder =  6 },
        new() { Id = 52, CompetencyId = "SC07", Category = CompetencyCategory.SqlCoding, Title = "Department with Maximum Employees", SortOrder =  7 },
        new() { Id = 53, CompetencyId = "SC08", Category = CompetencyCategory.SqlCoding, Title = "Customers with No Orders", SortOrder =  8 },
        new() { Id = 54, CompetencyId = "SC09", Category = CompetencyCategory.SqlCoding, Title = "Running Total", SortOrder =  9 },
        new() { Id = 55, CompetencyId = "SC10", Category = CompetencyCategory.SqlCoding, Title = "Top 3 Salaries per Department", SortOrder = 10 },
        new() { Id = 56, CompetencyId = "SC11", Category = CompetencyCategory.SqlCoding, Title = "Employees Joined in the Last 30 Days", SortOrder = 11 },
        new() { Id = 57, CompetencyId = "SC12", Category = CompetencyCategory.SqlCoding, Title = "Find Missing IDs", SortOrder = 12 },
        new() { Id = 58, CompetencyId = "SC13", Category = CompetencyCategory.SqlCoding, Title = "Swap Column Values", SortOrder = 13 },
        new() { Id = 59, CompetencyId = "SC14", Category = CompetencyCategory.SqlCoding, Title = "Consecutive Duplicate Values", SortOrder = 14 },
        new() { Id = 60, CompetencyId = "SC15", Category = CompetencyCategory.SqlCoding, Title = "SQL Pagination", SortOrder = 15 },

        // ── Angular (NG01–NG15) ───────────────────────────────────────────
        new() { Id = 61, CompetencyId = "NG01", Category = CompetencyCategory.Angular, Title = "Dependency Injection (DI)", SortOrder =  1 },
        new() { Id = 62, CompetencyId = "NG02", Category = CompetencyCategory.Angular, Title = "Observables vs Promises", SortOrder =  2 },
        new() { Id = 63, CompetencyId = "NG03", Category = CompetencyCategory.Angular, Title = "Component Lifecycle Hooks", SortOrder =  3 },
        new() { Id = 64, CompetencyId = "NG04", Category = CompetencyCategory.Angular, Title = "Change Detection Strategy", SortOrder =  4 },
        new() { Id = 65, CompetencyId = "NG05", Category = CompetencyCategory.Angular, Title = "Reactive Forms", SortOrder =  5 },
        new() { Id = 66, CompetencyId = "NG06", Category = CompetencyCategory.Angular, Title = "Angular Routing & Lazy Loading", SortOrder =  6 },
        new() { Id = 67, CompetencyId = "NG07", Category = CompetencyCategory.Angular, Title = "HTTP Client & Interceptors", SortOrder =  7 },
        new() { Id = 68, CompetencyId = "NG08", Category = CompetencyCategory.Angular, Title = "JWT Authentication & Route Guards", SortOrder =  8 },
        new() { Id = 69, CompetencyId = "NG09", Category = CompetencyCategory.Angular, Title = "Angular Decorators", SortOrder =  9 },
        new() { Id = 70, CompetencyId = "NG10", Category = CompetencyCategory.Angular, Title = "Component Communication", SortOrder = 10 },
        new() { Id = 71, CompetencyId = "NG11", Category = CompetencyCategory.Angular, Title = "Directives & Pipes", SortOrder = 11 },
        new() { Id = 72, CompetencyId = "NG12", Category = CompetencyCategory.Angular, Title = "Standalone Components & Modules", SortOrder = 12 },
        new() { Id = 73, CompetencyId = "NG13", Category = CompetencyCategory.Angular, Title = "State Management (BehaviorSubject / NgRx / Signals)", SortOrder = 13 },
        new() { Id = 74, CompetencyId = "NG14", Category = CompetencyCategory.Angular, Title = "Performance Optimization (trackBy, Lazy Loading, OnPush)", SortOrder = 14 },
        new() { Id = 75, CompetencyId = "NG15", Category = CompetencyCategory.Angular, Title = "Signals vs Observables", SortOrder = 15 },
    ];

    public static ChallengeDay[] GetSeedChallengeDays() =>
    [
        new() { Id =  1, DayNumber =  1, Title = "Memory Management & C# Fundamentals",     MainFocus = "Deep-dive into how .NET manages memory, value/reference types, and boxing. Intro to Collections and access scoping.", SqlCodingNote = null,                                        Notes = "Focus on stack vs heap diagrams. Draw the memory model." },
        new() { Id =  2, DayNumber =  2, Title = "OOP Foundations",                          MainFocus = "Master the four pillars of OOP with real examples. Cover Generics and the Interface vs Abstract Class decision.", SqlCodingNote = "SC01 – Find 2nd Highest Salary",             Notes = "Write one concrete example of each OOP pillar in C#." },
        new() { Id =  3, DayNumber =  3, Title = "Collections + SQL Joins",                  MainFocus = "Full coverage of .NET collection types and their time complexity. Pair with SQL Join deep-dive.", SqlCodingNote = "SC02 – Find Nth Highest Salary",                             Notes = "Draw a Venn diagram for SQL join types." },
        new() { Id =  4, DayNumber =  4, Title = "Methods, Delegates & Lambdas",             MainFocus = "Func/Action/Predicate delegates, lambda expressions, and Extension Methods. Intro to Exception Handling.", SqlCodingNote = "SC03, SC04 – Find & Delete Duplicate Records",        Notes = "Implement a fluent builder using extension methods." },
        new() { Id =  5, DayNumber =  5, Title = "Exception Handling & Garbage Collection",  MainFocus = "GC generations, LOH, Dispose vs Finalize pattern (IDisposable). Full exception handling best practices.", SqlCodingNote = "SC05, SC06, SC07, SC08",                             Notes = "Write a custom exception hierarchy for a domain." },
        new() { Id =  6, DayNumber =  6, Title = "SOLID Principles",                         MainFocus = "Apply all 5 SOLID principles with code examples. Revisit Interface vs Abstract Class decision tree.", SqlCodingNote = "SC09, SC10, SC11, SC12",                             Notes = "Refactor a violation of each SOLID principle." },
        new() { Id =  7, DayNumber =  7, Title = "Generics & Extension Methods",             MainFocus = "Generic type constraints, covariance/contravariance, and advanced extension method patterns.", SqlCodingNote = "SC13, SC14, SC15 + SQL Revision SC01–SC15",              Notes = "Build a generic repository pattern using constraints." },
        new() { Id =  8, DayNumber =  8, Title = "Events & Delegates",                       MainFocus = "Publisher-Subscriber pattern, EventHandler<T>, custom event args, weak event pattern.", SqlCodingNote = "SQL Mock Round #1",                                              Notes = "Wire up a real event system: ProgressChanged event." },
        new() { Id =  9, DayNumber =  9, Title = "LINQ Deep Dive",                           MainFocus = "Deferred vs immediate execution, expression trees, IEnumerable vs IQueryable. Full LINQ operator coverage.", SqlCodingNote = "SQL Mock Round #2",                          Notes = "Profile a LINQ query with vs without AsNoTracking." },
        new() { Id = 10, DayNumber = 10, Title = "Async Programming",                        MainFocus = "async/await internals, Task vs Task<T>, Task.WhenAll/WhenAny, ConfigureAwait, CPU vs I/O bound work.", SqlCodingNote = "SQL Mock Round #3",                              Notes = "Build a parallel async pipeline with cancellation." },
        new() { Id = 11, DayNumber = 11, Title = "ASP.NET Core Pipeline",                    MainFocus = "Middleware order, request pipeline internals, ASP.NET Core vs .NET Framework architecture differences.", SqlCodingNote = "SQL Revision – Window Functions",                Notes = "Draw the ASP.NET Core request pipeline from memory." },
        new() { Id = 12, DayNumber = 12, Title = "Dependency Injection",                     MainFocus = "Scoped vs Transient vs Singleton lifetimes, IServiceCollection, service registration patterns. SOLID revisit.", SqlCodingNote = "SQL Revision – Joins & CTEs",              Notes = "Identify which lifetime to use in 5 different scenarios." },
        new() { Id = 13, DayNumber = 13, Title = "Entity Framework Core",                    MainFocus = "Code-First migrations, DbContext lifecycle, change tracking, IQueryable vs IEnumerable in EF context.", SqlCodingNote = "SQL Revision – Ranking Problems",             Notes = "Profile N+1 query and fix with Include/ThenInclude." },
        new() { Id = 14, DayNumber = 14, Title = "REST APIs",                                MainFocus = "RESTful design principles, HTTP status codes, model binding, [FromBody]/[FromQuery]/[FromRoute], validation.", SqlCodingNote = "SQL Timed Practice",                        Notes = "Design a complete REST API contract for a resource." },
        new() { Id = 15, DayNumber = 15, Title = "Authentication & Authorization",           MainFocus = "JWT token lifecycle, Claims, Roles, Policies. AuthN vs AuthZ boundary. ASP.NET Identity overview.", SqlCodingNote = "SQL Mock Interview",                                Notes = "Trace a JWT request from browser → API → DB." },
        new() { Id = 16, DayNumber = 16, Title = "Repository Pattern",                       MainFocus = "Generic Repository, Unit of Work, EF Core integration. Why and when to use the pattern.", SqlCodingNote = "SQL Revision",                                              Notes = "Implement a testable generic repository with IUnitOfWork." },
        new() { Id = 17, DayNumber = 17, Title = "Global Exception Handling",                MainFocus = "IExceptionHandler, ProblemDetails (RFC 7807), structured logging with ILogger, configuration providers.", SqlCodingNote = "SQL Revision",                              Notes = "Wire up Serilog or structured logging with correlation IDs." },
        new() { Id = 18, DayNumber = 18, Title = "SQL Performance",                          MainFocus = "Clustered vs non-clustered indexes, execution plans, query tuning strategies, covering indexes.", SqlCodingNote = "Apply SC01–SC15 with Index Analysis",               Notes = "Run EXPLAIN on 3 queries and optimize each." },
        new() { Id = 19, DayNumber = 19, Title = "Transactions",                             MainFocus = "ACID properties, isolation levels (Read Uncommitted → Serializable), deadlock detection and prevention.", SqlCodingNote = "Apply SQL Coding with Transactions",             Notes = "Reproduce a deadlock scenario and resolve it." },
        new() { Id = 20, DayNumber = 20, Title = "API Performance",                          MainFocus = "Caching strategies, async I/O, response compression, pagination best practices. Production troubleshooting.", SqlCodingNote = "SQL Performance Mock",                    Notes = "Profile an API endpoint and apply 3 optimizations." },
        new() { Id = 21, DayNumber = 21, Title = "CORS & Angular HTTP",                      MainFocus = "CORS policy configuration, preflight requests. Angular HttpClient, HTTP interceptors, retry strategies.", SqlCodingNote = "SQL Revision",                              Notes = "Build a global error-handling interceptor in Angular." },
        new() { Id = 22, DayNumber = 22, Title = "CQRS & MediatR",                          MainFocus = "Command Query Responsibility Segregation pattern. MediatR pipeline behaviors, notifications.", SqlCodingNote = "SQL Revision",                                          Notes = "Compare CQRS vs standard DI service approach tradeoffs." },
        new() { Id = 23, DayNumber = 23, Title = "Advanced SQL Theory",                      MainFocus = "CTEs, window functions, stored procedures vs functions, views, temp tables, normalization deep-dive.", SqlCodingNote = "Integrate SC01–SC15 with Advanced SQL",       Notes = "Write a complex reporting query using CTEs + Window Functions." },
        new() { Id = 24, DayNumber = 24, Title = "Angular Fundamentals",                     MainFocus = "Angular DI system, RxJS Observables vs Promises, component lifecycle hooks, decorators, component communication.", SqlCodingNote = "SQL Mock Interview",              Notes = "Build a parent→child→grandchild component data flow." },
        new() { Id = 25, DayNumber = 25, Title = "Angular Advanced",                         MainFocus = "OnPush change detection, reactive forms, lazy loading, route guards, custom directives & pipes, NgRx Signals.", SqlCodingNote = "SQL Timed Challenge",             Notes = "Implement a feature with OnPush + async pipe + trackBy." },
        new() { Id = 26, DayNumber = 26, Title = "Enterprise Project",                       MainFocus = "Full-stack integration of all 75 competencies in a single production-grade feature. End-to-end vertical slice.", SqlCodingNote = "SQL Integration in Project",     Notes = "Build one complete vertical slice from DB → API → Angular." },
        new() { Id = 27, DayNumber = 27, Title = "Production Debugging",                     MainFocus = "Root cause analysis, distributed tracing, log correlation, production API troubleshooting playbook.", SqlCodingNote = "Production SQL Scenarios",                   Notes = "Walk through 3 real production bug scenarios and diagnose." },
        new() { Id = 28, DayNumber = 28, Title = "Complete Revision",                        MainFocus = "Full revision of all 75 competencies. Cover every category without reference materials.", SqlCodingNote = "Solve SC01–SC15 Without Notes",                          Notes = "Time-box: 5 mins per competency. No notes allowed." },
        new() { Id = 29, DayNumber = 29, Title = "Mock Interviews",                          MainFocus = "Technical + SQL coding + behavioral + production interview simulation. All 75 competencies in scope.", SqlCodingNote = "Live SQL Coding Interview",                   Notes = "Record yourself answering 10 random competency questions." },
        new() { Id = 30, DayNumber = 30, Title = "Final Assessment",                         MainFocus = "Final mock interview covering all 75 competencies. Identify and revise remaining weak areas.", SqlCodingNote = "Final SQL Assessment",                               Notes = "Score yourself on each of the 75 competencies 1–5." },
    ];

    /// <summary>
    /// Returns all day↔competency bridge records.
    /// IsPrimary = true  → main focus competency for the day
    /// IsPrimary = false → secondary / SQL revision competency
    /// DB IDs for Competency:
    ///   C01=1 C02=2 C03=3 C04=4 C05=5 C06=6 C07=7 C08=8 C09=9 C10=10 C11=11 C12=12 C13=13 C14=14 C15=15
    ///   A01=16 A02=17 A03=18 A04=19 A05=20 A06=21 A07=22 A08=23 A09=24 A10=25 A11=26 A12=27 A13=28 A14=29 A15=30
    ///   S01=31 S02=32 S03=33 S04=34 S05=35 S06=36 S07=37 S08=38 S09=39 S10=40 S11=41 S12=42 S13=43 S14=44 S15=45
    ///   SC01=46 SC02=47 SC03=48 SC04=49 SC05=50 SC06=51 SC07=52 SC08=53 SC09=54 SC10=55 SC11=56 SC12=57 SC13=58 SC14=59 SC15=60
    ///   NG01=61 NG02=62 NG03=63 NG04=64 NG05=65 NG06=66 NG07=67 NG08=68 NG09=69 NG10=70 NG11=71 NG12=72 NG13=73 NG14=74 NG15=75
    /// </summary>
    public static ChallengeDayCompetency[] GetSeedChallengeDayCompetencies() =>
    [
        // Day 1 — C02, C06, C12
        new() { Id =   1, ChallengeDayId =  1, CompetencyId =  2, IsPrimary = true  },  // C02
        new() { Id =   2, ChallengeDayId =  1, CompetencyId =  6, IsPrimary = true  },  // C06
        new() { Id =   3, ChallengeDayId =  1, CompetencyId = 12, IsPrimary = true  },  // C12

        // Day 2 — C01, C10, C11  | SQL: SC01
        new() { Id =   4, ChallengeDayId =  2, CompetencyId =  1, IsPrimary = true  },  // C01
        new() { Id =   5, ChallengeDayId =  2, CompetencyId = 10, IsPrimary = true  },  // C10
        new() { Id =   6, ChallengeDayId =  2, CompetencyId = 11, IsPrimary = true  },  // C11
        new() { Id =   7, ChallengeDayId =  2, CompetencyId = 46, IsPrimary = false },  // SC01

        // Day 3 — C06, S01  | SQL: SC02
        new() { Id =   8, ChallengeDayId =  3, CompetencyId =  6, IsPrimary = true  },  // C06
        new() { Id =   9, ChallengeDayId =  3, CompetencyId = 31, IsPrimary = true  },  // S01
        new() { Id =  10, ChallengeDayId =  3, CompetencyId = 47, IsPrimary = false },  // SC02

        // Day 4 — C08, C14, C04  | SQL: SC03, SC04
        new() { Id =  11, ChallengeDayId =  4, CompetencyId =  8, IsPrimary = true  },  // C08
        new() { Id =  12, ChallengeDayId =  4, CompetencyId = 14, IsPrimary = true  },  // C14
        new() { Id =  13, ChallengeDayId =  4, CompetencyId =  4, IsPrimary = true  },  // C04
        new() { Id =  14, ChallengeDayId =  4, CompetencyId = 48, IsPrimary = false },  // SC03
        new() { Id =  15, ChallengeDayId =  4, CompetencyId = 49, IsPrimary = false },  // SC04

        // Day 5 — C03, C04  | SQL: SC05, SC06, SC07, SC08
        new() { Id =  16, ChallengeDayId =  5, CompetencyId =  3, IsPrimary = true  },  // C03
        new() { Id =  17, ChallengeDayId =  5, CompetencyId =  4, IsPrimary = true  },  // C04
        new() { Id =  18, ChallengeDayId =  5, CompetencyId = 50, IsPrimary = false },  // SC05
        new() { Id =  19, ChallengeDayId =  5, CompetencyId = 51, IsPrimary = false },  // SC06
        new() { Id =  20, ChallengeDayId =  5, CompetencyId = 52, IsPrimary = false },  // SC07
        new() { Id =  21, ChallengeDayId =  5, CompetencyId = 53, IsPrimary = false },  // SC08

        // Day 6 — C11, C15  | SQL: SC09-SC12
        new() { Id =  22, ChallengeDayId =  6, CompetencyId = 11, IsPrimary = true  },  // C11
        new() { Id =  23, ChallengeDayId =  6, CompetencyId = 15, IsPrimary = true  },  // C15
        new() { Id =  24, ChallengeDayId =  6, CompetencyId = 54, IsPrimary = false },  // SC09
        new() { Id =  25, ChallengeDayId =  6, CompetencyId = 55, IsPrimary = false },  // SC10
        new() { Id =  26, ChallengeDayId =  6, CompetencyId = 56, IsPrimary = false },  // SC11
        new() { Id =  27, ChallengeDayId =  6, CompetencyId = 57, IsPrimary = false },  // SC12

        // Day 7 — C10, C14  | SQL: SC13-SC15 + revision
        new() { Id =  28, ChallengeDayId =  7, CompetencyId = 10, IsPrimary = true  },  // C10
        new() { Id =  29, ChallengeDayId =  7, CompetencyId = 14, IsPrimary = true  },  // C14
        new() { Id =  30, ChallengeDayId =  7, CompetencyId = 58, IsPrimary = false },  // SC13
        new() { Id =  31, ChallengeDayId =  7, CompetencyId = 59, IsPrimary = false },  // SC14
        new() { Id =  32, ChallengeDayId =  7, CompetencyId = 60, IsPrimary = false },  // SC15

        // Day 8 — C08, C09  | SQL Mock #1
        new() { Id =  33, ChallengeDayId =  8, CompetencyId =  8, IsPrimary = true  },  // C08
        new() { Id =  34, ChallengeDayId =  8, CompetencyId =  9, IsPrimary = true  },  // C09

        // Day 9 — C07, A04  | SQL Mock #2
        new() { Id =  35, ChallengeDayId =  9, CompetencyId =  7, IsPrimary = true  },  // C07
        new() { Id =  36, ChallengeDayId =  9, CompetencyId = 19, IsPrimary = true  },  // A04

        // Day 10 — C05  | SQL Mock #3
        new() { Id =  37, ChallengeDayId = 10, CompetencyId =  5, IsPrimary = true  },  // C05

        // Day 11 — A01, A02  | SQL: Window Functions
        new() { Id =  38, ChallengeDayId = 11, CompetencyId = 16, IsPrimary = true  },  // A01
        new() { Id =  39, ChallengeDayId = 11, CompetencyId = 17, IsPrimary = true  },  // A02
        new() { Id =  40, ChallengeDayId = 11, CompetencyId = 34, IsPrimary = false },  // S04

        // Day 12 — A03, C15  | SQL: Joins & CTEs
        new() { Id =  41, ChallengeDayId = 12, CompetencyId = 18, IsPrimary = true  },  // A03
        new() { Id =  42, ChallengeDayId = 12, CompetencyId = 15, IsPrimary = true  },  // C15
        new() { Id =  43, ChallengeDayId = 12, CompetencyId = 31, IsPrimary = false },  // S01
        new() { Id =  44, ChallengeDayId = 12, CompetencyId = 33, IsPrimary = false },  // S03

        // Day 13 — A05, A04  | SQL: Ranking
        new() { Id =  45, ChallengeDayId = 13, CompetencyId = 20, IsPrimary = true  },  // A05
        new() { Id =  46, ChallengeDayId = 13, CompetencyId = 19, IsPrimary = true  },  // A04
        new() { Id =  47, ChallengeDayId = 13, CompetencyId = 34, IsPrimary = false },  // S04

        // Day 14 — A07, A08  | SQL Timed Practice
        new() { Id =  48, ChallengeDayId = 14, CompetencyId = 22, IsPrimary = true  },  // A07
        new() { Id =  49, ChallengeDayId = 14, CompetencyId = 23, IsPrimary = true  },  // A08

        // Day 15 — A06  | SQL Mock
        new() { Id =  50, ChallengeDayId = 15, CompetencyId = 21, IsPrimary = true  },  // A06

        // Day 16 — A09, A05  | SQL Revision
        new() { Id =  51, ChallengeDayId = 16, CompetencyId = 24, IsPrimary = true  },  // A09
        new() { Id =  52, ChallengeDayId = 16, CompetencyId = 20, IsPrimary = true  },  // A05

        // Day 17 — A10, A12  | SQL Revision
        new() { Id =  53, ChallengeDayId = 17, CompetencyId = 25, IsPrimary = true  },  // A10
        new() { Id =  54, ChallengeDayId = 17, CompetencyId = 27, IsPrimary = true  },  // A12

        // Day 18 — S02, S09, S10  | Index Analysis
        new() { Id =  55, ChallengeDayId = 18, CompetencyId = 32, IsPrimary = true  },  // S02
        new() { Id =  56, ChallengeDayId = 18, CompetencyId = 39, IsPrimary = true  },  // S09
        new() { Id =  57, ChallengeDayId = 18, CompetencyId = 40, IsPrimary = true  },  // S10

        // Day 19 — S06, S07, S08  | Transactions
        new() { Id =  58, ChallengeDayId = 19, CompetencyId = 36, IsPrimary = true  },  // S06
        new() { Id =  59, ChallengeDayId = 19, CompetencyId = 37, IsPrimary = true  },  // S07
        new() { Id =  60, ChallengeDayId = 19, CompetencyId = 38, IsPrimary = true  },  // S08

        // Day 20 — A13, A15  | SQL Performance Mock
        new() { Id =  61, ChallengeDayId = 20, CompetencyId = 28, IsPrimary = true  },  // A13
        new() { Id =  62, ChallengeDayId = 20, CompetencyId = 30, IsPrimary = true  },  // A15

        // Day 21 — A11, NG07  | SQL Revision
        new() { Id =  63, ChallengeDayId = 21, CompetencyId = 26, IsPrimary = true  },  // A11
        new() { Id =  64, ChallengeDayId = 21, CompetencyId = 67, IsPrimary = true  },  // NG07

        // Day 22 — A14  | SQL Revision
        new() { Id =  65, ChallengeDayId = 22, CompetencyId = 29, IsPrimary = true  },  // A14

        // Day 23 — S03, S04, S05, S11, S12, S13, S14, S15  | Advanced SQL
        new() { Id =  66, ChallengeDayId = 23, CompetencyId = 33, IsPrimary = true  },  // S03
        new() { Id =  67, ChallengeDayId = 23, CompetencyId = 34, IsPrimary = true  },  // S04
        new() { Id =  68, ChallengeDayId = 23, CompetencyId = 35, IsPrimary = true  },  // S05
        new() { Id =  69, ChallengeDayId = 23, CompetencyId = 41, IsPrimary = true  },  // S11
        new() { Id =  70, ChallengeDayId = 23, CompetencyId = 42, IsPrimary = true  },  // S12
        new() { Id =  71, ChallengeDayId = 23, CompetencyId = 43, IsPrimary = true  },  // S13
        new() { Id =  72, ChallengeDayId = 23, CompetencyId = 44, IsPrimary = true  },  // S14
        new() { Id =  73, ChallengeDayId = 23, CompetencyId = 45, IsPrimary = true  },  // S15

        // Day 24 — NG01, NG02, NG03, NG09, NG10  | SQL Mock
        new() { Id =  74, ChallengeDayId = 24, CompetencyId = 61, IsPrimary = true  },  // NG01
        new() { Id =  75, ChallengeDayId = 24, CompetencyId = 62, IsPrimary = true  },  // NG02
        new() { Id =  76, ChallengeDayId = 24, CompetencyId = 63, IsPrimary = true  },  // NG03
        new() { Id =  77, ChallengeDayId = 24, CompetencyId = 69, IsPrimary = true  },  // NG09
        new() { Id =  78, ChallengeDayId = 24, CompetencyId = 70, IsPrimary = true  },  // NG10

        // Day 25 — NG04-NG08, NG11-NG15  | SQL Timed Challenge
        new() { Id =  79, ChallengeDayId = 25, CompetencyId = 64, IsPrimary = true  },  // NG04
        new() { Id =  80, ChallengeDayId = 25, CompetencyId = 65, IsPrimary = true  },  // NG05
        new() { Id =  81, ChallengeDayId = 25, CompetencyId = 66, IsPrimary = true  },  // NG06
        new() { Id =  82, ChallengeDayId = 25, CompetencyId = 68, IsPrimary = true  },  // NG08
        new() { Id =  83, ChallengeDayId = 25, CompetencyId = 71, IsPrimary = true  },  // NG11
        new() { Id =  84, ChallengeDayId = 25, CompetencyId = 72, IsPrimary = true  },  // NG12
        new() { Id =  85, ChallengeDayId = 25, CompetencyId = 73, IsPrimary = true  },  // NG13
        new() { Id =  86, ChallengeDayId = 25, CompetencyId = 74, IsPrimary = true  },  // NG14
        new() { Id =  87, ChallengeDayId = 25, CompetencyId = 75, IsPrimary = true  },  // NG15

        // Days 26-30: All 75 competencies (ALL tag) — no specific bridge rows needed;
        // the frontend marks these as "Full Stack Integration" days. We still tag a few
        // representative competencies to populate the badge row.
        new() { Id =  88, ChallengeDayId = 26, CompetencyId =  7, IsPrimary = true  },  // C07
        new() { Id =  89, ChallengeDayId = 26, CompetencyId = 20, IsPrimary = true  },  // A05
        new() { Id =  90, ChallengeDayId = 26, CompetencyId = 31, IsPrimary = true  },  // S01
        new() { Id =  91, ChallengeDayId = 26, CompetencyId = 67, IsPrimary = true  },  // NG07

        new() { Id =  92, ChallengeDayId = 27, CompetencyId = 30, IsPrimary = true  },  // A15
        new() { Id =  93, ChallengeDayId = 27, CompetencyId = 25, IsPrimary = true  },  // A10
        new() { Id =  94, ChallengeDayId = 27, CompetencyId = 40, IsPrimary = true  },  // S10

        new() { Id =  95, ChallengeDayId = 28, CompetencyId =  5, IsPrimary = true  },  // C05
        new() { Id =  96, ChallengeDayId = 28, CompetencyId = 15, IsPrimary = true  },  // C15
        new() { Id =  97, ChallengeDayId = 28, CompetencyId = 18, IsPrimary = true  },  // A03

        new() { Id =  98, ChallengeDayId = 29, CompetencyId =  1, IsPrimary = true  },  // C01
        new() { Id =  99, ChallengeDayId = 29, CompetencyId = 22, IsPrimary = true  },  // A07
        new() { Id = 100, ChallengeDayId = 29, CompetencyId = 61, IsPrimary = true  },  // NG01

        new() { Id = 101, ChallengeDayId = 30, CompetencyId = 15, IsPrimary = true  },  // C15
        new() { Id = 102, ChallengeDayId = 30, CompetencyId = 20, IsPrimary = true  },  // A05
        new() { Id = 103, ChallengeDayId = 30, CompetencyId = 75, IsPrimary = true  },  // NG15
    ];
}

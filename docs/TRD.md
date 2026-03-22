System Role: You are an Expert Enterprise .NET Software Architect and Backend Developer. Your task is to scaffold a production-ready ASP.NET Core 8 Web API for an "Interview Preparation Platform" (similar to LeetCode/Useastra).

Architectural Rules (STRICT):
* Follow a strict 4-Layer Clean Architecture: `Domain`, `Application`, `Infrastructure`, and `Api`.
* DO NOT use CQRS or MediatR. Use standard Interface-based Services injected via Dependency Injection (Controller -> Service -> Database).
* Use the Result pattern for service returns (no throwing exceptions for business logic).
* Use Entity Framework Core (Code-First) for data access.

1. Technology Stack & Core Configuration:
* Framework: .NET 8 Web API
* Database: Microsoft SQL Server
* ORM: EF Core 8
* External Libs: ClosedXML (for Excel parsing in the Infrastructure layer)
* CORS Policy: You MUST configure CORS in `Program.cs` to explicitly allow `http://localhost:4200` (Angular's default port), allowing any header and any method.
* JWT Auth: Configure JWT Bearer authentication in `Program.cs`. Provide a sample `appsettings.json` with `Jwt:Key`, `Jwt:Issuer`, and `Jwt:Audience`.

2. Solution Structure & Project Dependencies:
Create a solution named `InterviewPrepApp.sln` with the following projects:
* `InterviewPrepApp.Domain`: Contains only POCO Entities and Enums. (No dependencies).
* `InterviewPrepApp.Application`: Contains DTOs, Service Interfaces, and Business Logic Services. (References `Domain`).
* `InterviewPrepApp.Infrastructure`: Contains `ApplicationDbContext`, EF Core Migrations, and External Service implementations. (References `Application` and `Domain`).
* `InterviewPrepApp.Api`: Contains Controllers, Global Exception Middleware, and `Program.cs`. (References `Application` and `Infrastructure`).

3. Database Schema & Domain Entities:
Generate the following C# entities in the `Domain` layer. Ensure proper nullable reference types.
* Difficulty (Enum): Easy = 1, Medium = 2, Hard = 3.
* Category: A self-referencing hierarchical table. Properties: `Id` (int), `Name` (string), `ParentId` (int?, nullable), `Parent` (Category), `SubCategories` (ICollection<Category>), `Questions` (ICollection<Question`).
* Question: Properties: `Id` (int), `Title` (string?, nullable), `QuestionText` (string), `AnswerText` (string?, nullable), `Difficulty` (Difficulty enum), `Role` (string), `CategoryId` (int), `Category` (Category navigation), `UserProgresses` (ICollection<UserProgress>). 
* ApplicationUser: Inherits from `IdentityUser`. Properties: `UserProgresses` (ICollection<UserProgress>). 
* UserProgress: Join table tracking user activity. Properties: `UserId` (string), `QuestionId` (int), `IsSolved` (bool), `IsRevision` (bool). 

4. Infrastructure Layer (EF Core Rules & Seeding):
Generate the `ApplicationDbContext`. You MUST include the following in `OnModelCreating`:
* Configure the composite primary key for `UserProgress` (`UserId`, `QuestionId`).
* Configure the self-referencing `Category` relationship. Crucial: Set `OnDelete(DeleteBehavior.Restrict)` on the `ParentId` foreign key to prevent cascading delete cycles.
* DatabaseSeeder: Write a method to seed the category hierarchy (e.g., Fundamentals -> OOPS -> Abstraction). STRICT RULE: Use a structured dictionary or JSON-like seed approach to assign `ParentId` safely without throwing Foreign Key constraint errors during database startup.
* Ensure ApplicationDbContext inherits from IdentityDbContext<ApplicationUser> (NOT DbContext). You MUST register ASP.NET Core Identity in Program.cs (builder.Services.AddIdentityCore<ApplicationUser>().AddEntityFrameworkStores<ApplicationDbContext>()).

5. Application Layer (Core Logic & Pagination):
Generate the following Interfaces, DTOs, and Services:
* DTOs: `CategoryTreeDto` (no parent references to avoid JSON cycles), `FileValidationResult`, and a `PagedResponse<T>` wrapper class containing `IEnumerable<T> Data`, `int TotalRecords`, `int PageNumber`, and `int PageSize`.
* ICategoryService: Implement `GetTreeAsync()`.
* IExcelExtractor & ExcelExtractionService: Implement using `ClosedXML`. Read an uploaded `.xlsx` file. Look at headers dynamically. If header contains "Title", map to Scenario format (`Title` + `QuestionText`). If it says "Question", map to standard format (`QuestionText` + `AnswerText`).
* Define a simple, custom Result<T> class in the Domain layer (e.g., Domain/Shared/Result.cs) containing three properties: bool IsSuccess, T? Data, and string? ErrorMessage. Include static factory methods for Success(T data) and Failure(string error). DO NOT use third-party libraries for this.

6. API Layer (Controllers & Error Handling):
Generate REST endpoints. Ensure controllers are "thin" and use the `Result<T>` pattern.
* Global Error Handling: Use the new .NET 8 `IExceptionHandler` interface (NOT legacy middleware). It MUST return errors formatted as RFC 7807 `ProblemDetails`.
* CategoriesController: `GET /api/categories/tree`
* QuestionsController: `GET /api/questions/` MUST use `[FromQuery]` for `categoryId`, `role`, and `difficulty` parameters. Return `PagedResponse<QuestionDto>`.
* AdminController: `POST /api/admin/import-questions` (Accepts `IFormFile`, validates, extracts, saves).
* UserProgressController: Must have `[Authorize]` attribute. `GET /summary`, `PUT /toggle-solved/{questionId}`, `PUT /toggle-revision/{questionId}`.
* AuthController: `POST /register`, `POST /login` (Returns a generated JWT).

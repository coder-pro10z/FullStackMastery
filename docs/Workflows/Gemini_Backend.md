Writing a "Mega-Prompt" to feed into an AI coding assistant (like AntiGravity, Cursor, or Gemini Deep Research) is exactly how modern 10x developers scaffold entire architectures in minutes.

To get the best result, the prompt needs to act as a **Technical Requirements Document (TRD)**. It must explicitly define the boundaries (e.g., "Use Clean Architecture but DO NOT use MediatR") so the AI doesn't hallucinate patterns you don't want.

**System Role:** You are an Expert Enterprise .NET Software Architect and Backend Developer. Your task is to scaffold a production-ready ASP.NET Core 8 Web API for an "Interview Preparation Platform" (similar to LeetCode/Useastra).

**Architectural Rules (STRICT):**

* Follow a strict 4-Layer Clean Architecture: `Domain`, `Application`, `Infrastructure`, and `Api`.
* **DO NOT** use CQRS or MediatR. Use standard Interface-based Services injected via Dependency Injection (Controller -> Service -> Database).
* Use the Result pattern for service returns (no throwing exceptions for business logic).
* Use Entity Framework Core (Code-First) for data access.

**1. Technology Stack:**

* **Framework:** .NET 8 Web API
* **Database:** Microsoft SQL Server
* **ORM:** EF Core 8
* **External Libs:** ClosedXML (for Excel parsing in the Infrastructure layer)

**2. Solution Structure & Project Dependencies:**
Create a solution named `InterviewPrepApp.sln` with the following projects:

* `InterviewPrepApp.Domain`: Contains only POCO Entities and Enums. (No dependencies).
* `InterviewPrepApp.Application`: Contains DTOs, Service Interfaces, and Business Logic Services. (References `Domain`).
* `InterviewPrepApp.Infrastructure`: Contains `ApplicationDbContext`, EF Core Migrations, and External Service implementations (ClosedXML). (References `Application` and `Domain`).
* `InterviewPrepApp.Api`: Contains Controllers, Global Exception Middleware, and `Program.cs`. (References `Application` and `Infrastructure`).

**3. Database Schema & Domain Entities:**
Generate the following C# entities in the `Domain` layer. Ensure proper nullable reference types.

* **Difficulty (Enum):** Easy = 1, Medium = 2, Hard = 3.
* **Category:** Must be a self-referencing hierarchical table to support infinite nested menus.
* Properties: `Id` (int), `Name` (string), `ParentId` (int?, nullable), `Parent` (Category), `SubCategories` (ICollection<Category>), `Questions` (ICollection<Question>).


* **Question:** Must support both Scenario-based and direct Q&A formats.
* Properties: `Id` (int), `Title` (string?, nullable), `QuestionText` (string), `AnswerText` (string?, nullable), `Difficulty` (Difficulty enum), `Role` (string), `CategoryId` (int), `Category` (Category navigation), `UserProgresses` (ICollection<UserProgress>).


* **ApplicationUser:** Inherit from `IdentityUser`.
* Properties: `UserProgresses` (ICollection<UserProgress>).


* **UserProgress:** Join table tracking user activity.
* Properties: `UserId` (string), `QuestionId` (int), `IsSolved` (bool), `IsRevision` (bool). Navigation properties for User and Question.



**4. Infrastructure Layer (EF Core Rules):**
Generate the `ApplicationDbContext`. You MUST include the following in `OnModelCreating`:

* Configure the composite primary key for `UserProgress` (`UserId`, `QuestionId`).
* Configure the self-referencing `Category` relationship. Crucial: Set `OnDelete(DeleteBehavior.Restrict)` on the `ParentId` foreign key to prevent cascading delete cycles.
* Write a basic `DatabaseSeeder` method to insert initial nested categories (e.g., Fundamentals -> OOPS -> Abstraction).

**5. Application Layer (Core Logic):**
Generate the following Interfaces, DTOs, and Services:

* **DTOs:** `CategoryTreeDto` (must not contain parent references to avoid JSON cycles) and `FileValidationResult`.
* **ICategoryService:** Implement `GetTreeAsync()` which fetches all categories and builds a nested `List<CategoryTreeDto>` in memory.
* **IExcelExtractor:** Interface for parsing.
* **ExcelExtractionService:** Implement the interface using `ClosedXML`. Read an uploaded `.xlsx` file. Look at the headers dynamically. If the header contains "Title", map to the Scenario format (`Title` + `QuestionText`). If it just says "Question", map to the standard format (`QuestionText` + `AnswerText`).

---

**6. API Layer (Controllers):**
Generate the following REST endpoints using the injected services. Ensure controllers are "thin" (no business logic) and use the `Result<T>` pattern from the Application layer to handle responses.

* **CategoriesController (`/api/categories`):**
* `GET /tree` (Returns 200 OK with the nested JSON).
* `GET /{id}` (Returns details for a single category).


* **QuestionsController (`/api/questions`):**
* `GET /` (Supports query parameters for filtering: `categoryId`, `role`, `difficulty`. Returns a paginated list).
* `GET /{id}` (Returns a single question).


* **AdminController (`/api/admin`):**
* `POST /import-questions` (Accepts `IFormFile`. Runs a validation check on the Excel headers first. If valid, extracts data, maps to `Question` entities, and saves to the DB).


* **UserProgressController (`/api/progress`):** Must have the `[Authorize]` attribute and extract the `UserId` from the JWT claims.
* `GET /summary` (Returns stats for Easy/Medium/Hard completion).
* `PUT /toggle-solved/{questionId}` (Flips the boolean state for the user/question).
* `PUT /toggle-revision/{questionId}` (Flips the bookmark boolean state).


* **AuthController (`/api/auth`):**
* `POST /register` (Creates a new user using ASP.NET Core Identity).
* `POST /login` (Validates credentials and returns a JWT).



**Output Instructions:**
Please output the exact folder structure for the 4-layer Clean Architecture, followed by the complete C# code for:

1. The Domain Entities.
2. The `ApplicationDbContext` (including the OnModelCreating logic and Database Seeder).
3. The `CategoryService` and `ExcelExtractionService`.
4. All five API Controllers (`Categories`, `Questions`, `Admin`, `UserProgress`, `Auth`).
Write production-ready, highly commented code.

---

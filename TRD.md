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
* Category: A self-referencing hierarchical table. Properties: `Id` (int), `Name` (string), `ParentId` (int?, nullable), `Parent` (Category), `SubCategories` (ICollection<Category>), `Questions` (ICollection<Question>).
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

Output Instructions:
Output the exact folder structure, followed by the complete C# code for the Domain Entities, DbContext (with seeding), Services, Controllers, and the .NET 8 `IExceptionHandler`. Write production-ready, highly commented code.
1. The Domain Entities.
2. The `ApplicationDbContext` (including the OnModelCreating logic and Database Seeder).
3. The `CategoryService` and `ExcelExtractionService`.
4. All five API Controllers (`Categories`, `Questions`, `Admin`, `UserProgress`, `Auth`).


---

A strict Technical Requirements Document (TRD).

It enforces a highly modular, component-driven architecture. By forcing the AI to build reusable "dumb" components first, you prevent it from writing massive, unmaintainable 2,000-line HTML files.

---
System Role: You are an Expert Angular Software Architect and Frontend UI/UX Developer. Your task is to scaffold a production-ready, highly modular Angular application for an "Interview Preparation Platform".

UI/UX Guidelines:
* Modern, sleek, Dark Mode aesthetic (bg-color: `#121212`, dark gray surface panels, white/gray text).
* Use Tailwind CSS for all styling.
* Use Angular 17+ Standalone Components. No NgModules.

🚨 STRICT ARCHITECTURAL NOTE: REUSABLE COMPONENTS FIRST 🚨
You MUST extract UI elements into highly reusable, "dumb" presentation components. Use `@Input()` and `@Output()` to pass data and events.

1. Core Layout & Explicit Routing Definitions:
Generate `app.routes.ts` with the following strict paths:
* `path: ''` -> redirects to `'dashboard'`.
* `path: 'login'` -> loads `LoginComponent`.
* `path: 'dashboard'` -> loads `AppLayoutComponent` containing `DashboardComponent`. MUST be protected by `canActivate: [authGuard]`.
* `path: 'admin'` -> loads `AdminLayoutComponent` containing `AdminDashboardComponent`. MUST be protected by `canActivate: [authGuard]`.
* `path: '**'` -> redirects to `'login'`.

2. Reusable Atomic Components (shared/components/):
* SidebarComponent: Infinitely nested categories using recursion or an accordion.
* ProgressCardComponent: Shows a title, ratio, and Tailwind progress bar.
* QuestionBadgeComponent: Colored pill/tag for Role and Difficulty.
* ActionToggleComponent: Icon button for "Solved" and "Revision" toggles.
* FilterBarComponent: Search Input, Difficulty Dropdown, Role Dropdown.

3. Main Screens & Views (features/):
* DashboardComponent (User Facing): Combines `ProgressCardComponent`s, `FilterBarComponent`, and `QuestionTableComponent` (which handles pagination data and includes a collapsible row to view `AnswerText`/`QuestionText`).
* AdminDashboardComponent: A drag-and-drop/file input zone for the `.xlsx` Question Bank, a "Trigger Initial Database Seed" button, and Toast/Alert boxes handling RFC 7807 ProblemDetails from the backend.

4. State Management, Services & Security (core/):
Use modern `inject()` syntax and `HttpClient`.
* AuthGuard (`auth.guard.ts`): Checks for JWT token in localStorage; redirects to login if missing.
* AuthInterceptor (`auth.interceptor.ts`): Automatically attaches the Bearer JWT to outgoing requests.
* API Services: `CategoryService`, `QuestionService` (handling `PagedResponse<T>`), `ProgressService`, `AdminService` (using `FormData` for files), and `AuthService`.
* Create an environment.ts file to store the backend apiUrl (e.g., http://localhost:5000). All Angular API Services MUST inject this environment variable rather than hardcoding the URL strings.

5. TypeScript Interfaces (core/models/):
Ensure perfect type safety matching the backend payload:

```typescript
export enum Difficulty { Easy = 1, Medium = 2, Hard = 3 }

export interface CategoryTreeDto { id: number; name: string; subCategories: CategoryTreeDto[]; }

export interface QuestionDto { id: number; title?: string; questionText: string; answerText?: string; difficulty: Difficulty; role: string; categoryId: number; isSolved: boolean; isRevision: boolean; }

export interface ProgressSummaryDto { totalQuestions: number; totalSolved: number; easyTotal: number; easySolved: number; mediumTotal: number; mediumSolved: number; hardTotal: number; hardSolved: number; }

export interface FileValidationResult { isValid: boolean; errors: string[]; detectedFormat?: string; expectedRowCount: number; }

export interface PagedResponse<T> { data: T[]; totalRecords: number; pageNumber: number; pageSize: number; }

Complete Angular Project Structure:
You MUST scaffold the application using this exact structure:

src/app/
├── core/
│   ├── guards/auth.guard.ts
│   ├── interceptors/auth.interceptor.ts
│   ├── models/ (Place the 6 interfaces here)
│   └── services/ (admin, auth, category, progress, question services)
├── shared/
│   └── components/ (action-toggle, filter-bar, progress-card, question-badge)
├── features/
│   ├── admin/admin-dashboard/
│   ├── auth/login/ and auth/register/
│   └── dashboard/dashboard-page/ and dashboard/components/question-table/
├── layouts/
│   ├── app-layout/ (Contains sidebar)
│   └── admin-layout/
├── app.component.ts
├── app.config.ts (Provides HttpClient and Interceptors)
└── app.routes.ts


**Implementation Rules for the Structure:**

* **`core/`**: Should contain ONLY services, models, guards, and interceptors. No UI components go here.
* **`shared/`**: Components here MUST NOT inject API services. They should only rely on `@Input()` to receive data and `@Output()` to emit click events up to their parent.
* **`features/`**: These are your "Smart" components. They inject the services from `core/`, fetch the data, and pass it down into the `shared/` components.
* **`layouts/`**: The `SidebarComponent` lives here because it acts as the persistent navigation shell across multiple feature pages.


Output Instructions:

Output the optimal folder structure.

Provide the TypeScript and Tailwind HTML for SidebarComponent, QuestionTableComponent, and DashboardComponent.

Provide the code for AdminService showing FormData file uploads.

Provide the code for auth.guard.ts and auth.interceptor.ts.
Ensure all code is strongly typed and highly commented.
---

# Command Reference — Interview Preparation Platform

> All CLI commands executed by the agent during design, development, build, and testing phases.
> Redundant arguments are marked with `*` and explained separately at the end.

---

## 1. .NET Backend — Project Scaffolding

| # | Command | Purpose |
|---|---------|---------|
| 1 | `dotnet new sln -n InterviewPrepApp` | Created the root solution file. |
| 2 | `dotnet new classlib -n InterviewPrepApp.Domain` | Created the Domain layer *¹ (entities, enums). |
| 3 | `dotnet new classlib -n InterviewPrepApp.Application` | Created the Application layer *¹ (interfaces, DTOs). |
| 4 | `dotnet new classlib -n InterviewPrepApp.Infrastructure` | Created the Infrastructure layer *¹ (EF Core, services). |
| 5 | `dotnet new webapi -n InterviewPrepApp.Api` | Created the Web API layer (controllers, startup). |
| 6 | `dotnet sln add src/InterviewPrepApp.Domain` | Added Domain project to the solution *². |
| 7 | `dotnet sln add src/InterviewPrepApp.Application` | Added Application project to the solution *². |
| 8 | `dotnet sln add src/InterviewPrepApp.Infrastructure` | Added Infrastructure project to the solution *². |
| 9 | `dotnet sln add src/InterviewPrepApp.Api` | Added API project to the solution *². |

---

## 2. .NET Backend — NuGet Package Installation

| # | Command | Purpose |
|---|---------|---------|
| 10 | `dotnet add package Microsoft.AspNetCore.Identity.EntityFrameworkCore` *³ | ASP.NET Core Identity with EF Core support. |
| 11 | `dotnet add package Microsoft.EntityFrameworkCore.SqlServer` *³ | SQL Server database provider for EF Core. |
| 12 | `dotnet add package Microsoft.EntityFrameworkCore.Tools` *³ | EF Core CLI tools (migrations, scaffolding). |
| 13 | `dotnet add package Microsoft.EntityFrameworkCore.Design` *³ | Design-time EF Core services (used by `dotnet ef`). |
| 14 | `dotnet add package Microsoft.AspNetCore.Authentication.JwtBearer` *³ | JWT Bearer token authentication middleware. |
| 15 | `dotnet add package Swashbuckle.AspNetCore` *³ | Swagger/OpenAPI UI generation for the API. |
| 16 | `dotnet add package ClosedXML` *³ | Excel file reading (legacy question import). |
| 17 | `dotnet tool install --global dotnet-ef` | Installed the global EF Core CLI tool. |

---

## 3. .NET Backend — Project References

| # | Command | Purpose |
|---|---------|---------|
| 18 | `dotnet add InterviewPrepApp.Application reference InterviewPrepApp.Domain` | Application → Domain dependency. |
| 19 | `dotnet add InterviewPrepApp.Infrastructure reference InterviewPrepApp.Application` | Infrastructure → Application dependency. |
| 20 | `dotnet add InterviewPrepApp.Infrastructure reference InterviewPrepApp.Domain` | Infrastructure → Domain dependency. |
| 21 | `dotnet add InterviewPrepApp.Api reference InterviewPrepApp.Application` | API → Application dependency. |
| 22 | `dotnet add InterviewPrepApp.Api reference InterviewPrepApp.Infrastructure` | API → Infrastructure dependency. |

---

## 4. .NET Backend — Database Migrations

| # | Command | Purpose |
|---|---------|---------|
| 23 | `dotnet ef migrations add InitialCreate` *⁴ | Generated the initial migration with Identity + Category + Question + UserProgress tables. |
| 24 | `dotnet ef database update` *⁴ | Applied `InitialCreate` migration to SQL Server. |
| 25 | `dotnet ef migrations add AddAdminTables` *⁴ | Generated migration for `AuditLogs`, `QuestionVersions`, Category `Slug`, Question soft-delete fields, and global query filters. |
| 26 | `dotnet ef database update` *⁴ | Applied `AddAdminTables` migration to SQL Server. |

---

## 5. .NET Backend — Build & Run

| # | Command | Purpose |
|---|---------|---------|
| 27 | `dotnet build` | Compiled all 4 solution projects to verify no C# errors. |
| 28 | `dotnet run --project InterviewPrepApp.Api` | Started the .NET API dev server at `http://localhost:5000`. |

---

## 6. Angular Frontend — Project Scaffolding

| # | Command | Purpose |
|---|---------|---------|
| 29 | `npx -y @angular/cli@latest new frontend --routing --style=css --ssr=false --skip-tests` | Scaffolded the Angular 17+ project with routing, CSS, and no SSR. |
| 30 | `npm install` *⁵ | Installed all `node_modules` dependencies from `package.json`. |

---

## 7. Angular Frontend — Tailwind CSS Setup

| # | Command | Purpose |
|---|---------|---------|
| 31 | `npm install -D tailwindcss postcss autoprefixer` *⁵ | Installed Tailwind CSS v3 and its PostCSS toolchain as dev dependencies. |
| 32 | `npx tailwindcss init` *⁵ | Generated the `tailwind.config.js` file for custom dark theme tokens. |

---

## 8. Angular Frontend — Component Generation

All commands below were run from the `frontend/` directory using `npx ng g c` *⁶.

| # | Command | Purpose |
|---|---------|---------|
| 33 | `npx ng g c layouts/app-layout` *⁶ | Main app shell (sidebar + navbar + content area). |
| 34 | `npx ng g c layouts/admin-layout` *⁶ | Admin workspace shell (top nav + workspace). |
| 35 | `npx ng g c shared/components/sidebar` *⁶ | Collapsible sidebar with recursive category tree. |
| 36 | `npx ng g c shared/components/progress-card` *⁶ | Stats cards with animated progress bars. |
| 37 | `npx ng g c shared/components/question-badge` *⁶ | Difficulty/role pill badges. |
| 38 | `npx ng g c shared/components/action-toggle` *⁶ | Solved/revision toggle buttons. |
| 39 | `npx ng g c shared/components/filter-bar` *⁶ | Search + dropdown filter bar. |
| 40 | `npx ng g c shared/components/sub-category-nav` *⁶ | Horizontal scrollable sub-category pills. |
| 41 | `npx ng g c features/auth/login` *⁶ | Login page (dark SaaS theme). |
| 42 | `npx ng g c features/auth/register` *⁶ | Registration page. |
| 43 | `npx ng g c features/dashboard/dashboard-page` *⁶ | Main user dashboard page. |
| 44 | `npx ng g c features/dashboard/components/question-table` *⁶ | Question cards with accordion answers. |
| 45 | `npx ng g c features/admin/admin-dashboard` *⁶ | Full admin panel (4-tab workspace). |

---

## 9. Angular Frontend — Service Generation

| # | Command | Purpose |
|---|---------|---------|
| 46 | `npx ng g s core/services/auth` *⁵ | Authentication service (login, register, JWT storage). |
| 47 | `npx ng g s core/services/api` *⁵ | Main API service (questions, categories, progress). |
| 48 | `npx ng g s core/services/admin-api` *⁵ | Admin API service (dashboard, CRUD, import, categories). |

---

## 10. Angular Frontend — Guard Generation

| # | Command | Purpose |
|---|---------|---------|
| 49 | `npx ng g guard core/guards/auth --functional` *⁵ | Route guard: redirects unauthenticated users to `/login`. |
| 50 | `npx ng g guard core/guards/redirect-if-logged-in --functional` *⁵ | Route guard: redirects authenticated users away from `/login`. |

---

## 11. Angular Frontend — Build & Run

| # | Command | Purpose |
|---|---------|---------|
| 51 | `npm run build` *⁵ | Production build — verifies all TypeScript and HTML templates compile cleanly. |
| 52 | `npm start` *⁵ | Started the Angular dev server at `http://localhost:4200` for live testing. |

---

## Argument Glossary

| Symbol | Full Argument / Context | Explanation |
|--------|------------------------|-------------|
| *¹ | `-n <ProjectName>` | The `-n` flag specifies the output project name for `dotnet new`. |
| *² | `dotnet sln add src/<Project>` | Registers a `.csproj` into the `.sln` file so `dotnet build` compiles all projects together. |
| *³ | `dotnet add package <PackageName>` | Installs a NuGet package into the current project's `.csproj`. Run from within the target project directory (e.g., `InterviewPrepApp.Api/`). |
| *⁴ | `--project InterviewPrepApp.Infrastructure --startup-project InterviewPrepApp.Api` | EF Core migrations require two flags: `--project` points to the project containing the `DbContext`, and `--startup-project` points to the executable entry point with `appsettings.json` and the connection string. |
| *⁵ | All `npm` / `npx` commands | Run from the `frontend/` working directory (`c:\Users\Praveen\Desktop\Interview_PrepApp\frontend`). |
| *⁶ | `npx ng g c <path> --skip-tests` | Angular CLI shorthand: `g` = generate, `c` = component. The `--skip-tests` flag prevents creating `.spec.ts` unit test files. All components are standalone by default in Angular 17+. |

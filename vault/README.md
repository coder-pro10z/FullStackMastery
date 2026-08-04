# FullStackMastery Architecture Knowledge Graph Builder

## ROLE
You are a Senior Software Architect, Solution Architect, and Technical Documentation Engineer.
Your responsibility is to transform the entire codebase into an interconnected Architecture Knowledge Graph inside Obsidian.
The vault must become the Single Source of Truth for the entire application.
Every architectural decision, feature, controller, service, Angular component, database table, document, and relationship should exist as a connected node.

Never document files in isolation. Always connect them into the architecture graph.

---

## PROJECT CONTEXT
* **Project Name**: FullStackMastery (Interview Prep Platform)
* **Backend**: .NET 8, ASP.NET Core Web API, Clean Architecture (Domain -> Application -> Infrastructure -> Api), EF Core 8, SQL Server & PostgreSQL switch support. Note: CQRS/MediatR is EXPLICITLY NOT USED.
* **Frontend**: Angular 17+, Standalone Components (No NgModules), RxJS, Signals, custom dark-themed CSS styling (Tailwind is not used).
* **Workflows**: Multi-stage Excel extraction/import pipeline with dry-run interceptors and logs.

---

## OBJECTIVE
Convert the entire project into a metadata-driven Obsidian vault.
Every important artifact becomes a Markdown note with structured metadata linking to related notes.
The graph should allow seamless navigation from:
Feature Hub -> Frontend Page -> Component -> Service -> Controller -> Service Interface -> Service Implementation -> Entity -> Database Table.

---

## FOLDER HIERARCHY
* **Backend**:
  * `InterviewPrepApp.Domain` (Entities, Enums, Shared Result)
  * `InterviewPrepApp.Application` (Interfaces, DTOs, Mappings, Validators)
  * `InterviewPrepApp.Infrastructure` (DbContext, Migrations, Services, Persistence)
  * `InterviewPrepApp.Api` (Controllers, Middleware, Infrastructure)
* **Frontend**:
  * `frontend/src/app/core` (Services, Guards, Interceptors, Models)
  * `frontend/src/app/shared` (Shared standalone components like filter-bar, badges, heatmaps)
  * `frontend/src/app/features` (Auth, Admin, Dashboard, Quiz, Import, Job Description, etc.)
  * `frontend/src/app/layouts` (App layouts)

---

## FEATURE HUBS
Structure documentation around Feature Hubs:
- **Feature Auth**: JWT auth, interceptors, login/register pages.
- **Feature Admin**: Dashboard statistics, category tree modifications.
- **Feature Question Bank**: Hierarchical categories, page views, search and filters.
- **Feature Quiz**: Self-assessed quizzes, quiz attempts, seeding.
- **Feature Import Pipeline**: Excel parser, Dry Run validate, intelligent UPSERT log.
- **Feature Thirty-Day Challenge**: Daily tasks, competency matrices.
- **Feature Job Description**: Organization workspaces, Contacts, Resume vaults.
- **Feature Interviews**: Round trackers, company mappings.
- **Feature Learning Lab**: Competencies, lesson configurations.
- **Feature Cheat Sheet**: CheatSheet resources, category resources.

---

## YAML TEMPLATE
Each note must start with this YAML header:
```yaml
---
id: ""
type: "controller | service-interface | service-impl | angular-component | angular-service | domain-entity | db-table | feature-hub | adr"
domain: "Backend | Frontend | Database | Docs"
layer: "Api | Application | Infrastructure | Domain | Shared"
module: ""
feature:
  - "[[Feature X]]"
technology: ""
framework: ""
language: ""
project: ""
namespace: ""
api_endpoint: ""
database_table: ""
depends_on:
  - "[[NodeName]]"
used_by:
  - "[[NodeName]]"
implements:
  - "[[NodeName]]"
calls:
  - "[[NodeName]]"
related_to:
  - "[[NodeName]]"
status: "implemented | pending"
tags:
  - domain/layer
---
```

---

## LINKING PROTOCOL
Use standard Obsidian Wikilinks `[[NodeName]]` for relationships in the metadata block and inline content. Ensure references are typed correctly:
- Controllers depend on Application Interfaces.
- Application Interfaces are implemented by Infrastructure Services.
- Infrastructure Services depend on DbContext and call Domain Entities.
- Angular Pages call Angular Services, which hit API endpoints exposed by Controllers.

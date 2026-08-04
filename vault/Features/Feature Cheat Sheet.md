---
id: "Feature Cheat Sheet"
type: "feature-hub"
domain: "Shared"
layer: "Shared"
module: "CheatSheet"
feature:
  - "[[Feature Cheat Sheet]]"
technology: ".NET 8 | Angular 17"
framework: "ASP.NET Core | Standalone Angular"
language: "C# | TypeScript"
project: "InterviewPrepApp"
namespace: "InterviewPrepApp.Api.Controllers"
api_endpoint: "GET /api/resources, POST /api/admin/resources"
database_table: "CheatSheetResources"
depends_on: []
used_by: []
implements: []
calls: []
related_to: []
status: "implemented"
tags:
  - feature/cheat-sheet
  - domain/materials
---

# Feature: Cheat Sheet Hub

## Overview
The Cheat Sheet feature provides quick reference materials, cheat sheets, syntax summaries, and downloadable files mapping to specific technology domains.

## Business Purpose
Gives candidates immediate access to cheat sheets (like SQL cheats, command-line cheats, and Angular lifecycle charts) to assist in quick review sessions.

---

## 🔗 Architecture Graph Relations

```mermaid
graph TD
    CheatSheetHub[Feature Cheat Sheet] --> CheatSheetConsole[cheat-sheet.component]
    CheatSheetConsole --> ResourcesService[resources.service]
    ResourcesService --> ResourcesController[ResourcesController]
    ResourcesService --> AdminResourcesController[AdminResourcesController]
    AdminResourcesController --> Db[ApplicationDbContext]
    Db --> CheatSheetResource[CheatSheetResource Entity]
    CheatSheetResource --> CheatSheetResourcesTable[CheatSheetResources Table]
```

### Frontend Components
* **Pages & Components**:
  * `[[cheat-sheet.component]]` — Grid list displaying active resources, search bars, and download triggers.
* **Services**:
  * *Standard HTTP Client calls mapping backend endpoints.*

### Backend Components
* **Controllers**:
  * `[[ResourcesController]]` — Public endpoints serving category reference listings.
  * `[[AdminResourcesController]]` — Administrative actions supporting additions and removals of resource links.
* **Entities**:
  * `[[CheatSheetResource]]` — Defines cheatsheet metadata (Title, LinkUrl, Type, CategoryId).

### Database Tables
* `[[CheatSheetResourcesTable]]` — Primary store for cheatsheet listings.

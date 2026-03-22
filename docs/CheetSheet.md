# CheatSheet Hub Review And Project-Aligned Feature Spec

This document translates the CheatSheet Hub request into a design that fits the current Interview Prep App architecture.

## Feature Goal

Add a centralized resource library where users can browse supporting material by category:

- PDF files
- Markdown notes
- external links

The feature should work as a category-linked companion to the existing question bank, not as a replacement for it.

## Review Of The Original Request

The requested feature is valid, but several parts need adjustment to match this repository.

### 1. Backend architecture fit

The backend already follows service-based Clean Architecture without MediatR. The new feature should follow the same pattern:

- domain entity
- application DTOs and interfaces
- infrastructure EF Core service
- API controllers

This part of the request is aligned.

### 2. Admin endpoint shape should follow the current split-admin API style

The current admin API is split into focused controllers under `Api/Controllers/Admin/`, for example:

- `api/admin/questions`
- `api/admin/import`

So the new endpoints should be implemented as:

- `GET /api/resources?categoryId=`
- `POST /api/admin/resources`
- `DELETE /api/admin/resources/{id}`

That part is fine, but it should be implemented through a dedicated `AdminResourcesController`, not folded into an unrelated admin controller.

### 3. "Upload resource" needs explicit storage rules

The request says "Upload resource", but the current app does not yet have a file storage subsystem for arbitrary PDF assets.

That means the feature needs one of these decisions:

- MVP A: store only metadata and URLs, where PDFs are referenced by URL
- MVP B: support server-side file upload and save files under a controlled local folder or cloud storage provider

For this repository, MVP A is the safer first step unless file storage is explicitly required now.

### 4. Sidebar integration should fit the current route structure

The app currently uses:

- `/` for the main dashboard
- `/admin` for the admin workspace

So `/cheatsheets` can be added under the authenticated `AppLayoutComponent`, but the existing `SidebarComponent` only renders category links for the question dashboard. It will need a small extension for fixed navigation links, not just category items.

### 5. "Related Resources" in question rows should be lightweight

The question table is already dense. The right implementation is:

- show a compact related-resources trigger or count
- lazy-load resource items only when needed

Do not eagerly fetch resource lists for every question row in the main questions query.

## Recommended MVP

Implement CheatSheet Hub in two phases.

### Phase 1. Metadata-based resource hub

Support resources as metadata records:

- title
- category
- resource type
- URL or markdown content

Types:

- `Pdf`
- `Markdown`
- `ExternalLink`

Storage rules:

- `Pdf` uses a URL field in MVP
- `ExternalLink` uses a URL field
- `Markdown` stores note content in the database

This avoids introducing file storage complexity immediately.

### Phase 2. Optional real file upload

If needed later, add server-side upload support for PDFs with a storage abstraction such as:

- local disk for development
- cloud blob storage for production

That should be a separate slice from the initial resource catalog feature.

## Backend Design

### Domain entity

Add a new entity:

```csharp
public class CheatSheetResource
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public CheatSheetResourceType Type { get; set; }
    public string? Url { get; set; }
    public string? MarkdownContent { get; set; }
    public int CategoryId { get; set; }
    public Category Category { get; set; } = null!;
    public int DisplayOrder { get; set; }
    public bool IsDeleted { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
}
```

Add enum:

```csharp
public enum CheatSheetResourceType
{
    Pdf = 1,
    Markdown = 2,
    ExternalLink = 3
}
```

### Why this shape fits the project

- keeps resources category-linked like questions
- supports soft delete like the current content model
- avoids exposing entities directly
- allows markdown notes without separate file handling

### DbContext changes

Add:

- `DbSet<CheatSheetResource> CheatSheetResources`

Configure:

- required title
- enum conversion for type
- FK to `Category`
- index on `CategoryId`
- optional compound index on `(CategoryId, Type)`

### DTOs

Add:

- `CheatSheetResourceDto`
- `CreateCheatSheetDto`

Suggested DTOs:

```csharp
public class CheatSheetResourceDto
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public string? Url { get; set; }
    public string? MarkdownContent { get; set; }
    public int CategoryId { get; set; }
    public string CategoryName { get; set; } = string.Empty;
}

public class CreateCheatSheetDto
{
    public string Title { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public string? Url { get; set; }
    public string? MarkdownContent { get; set; }
    public int CategoryId { get; set; }
    public int DisplayOrder { get; set; }
}
```

### Service interface

Create:

```csharp
public interface ICheatSheetService
{
    Task<Result<IReadOnlyList<CheatSheetResourceDto>>> GetByCategoryAsync(int categoryId, CancellationToken ct = default);
    Task<Result<CheatSheetResourceDto>> CreateAsync(CreateCheatSheetDto dto, CancellationToken ct = default);
    Task<Result<bool>> DeleteAsync(int id, CancellationToken ct = default);
}
```

### Service behavior

The EF Core service should:

- validate that category exists
- validate input by type
- return DTOs only
- filter out deleted records
- order by `DisplayOrder`, then `Title`

Validation rules:

- `Pdf` and `ExternalLink` require `Url`
- `Markdown` requires `MarkdownContent`
- only one content source should be required per resource type

### Controller layout

Create:

- `ResourcesController`
- `AdminResourcesController`

Endpoints:

- `GET /api/resources?categoryId=`
- `POST /api/admin/resources`
- `DELETE /api/admin/resources/{id}`

Controller behavior:

- thin controllers
- delegate to service
- translate `Result<T>` into `Ok`, `Created`, `BadRequest`, `NotFound`, and `NoContent`

## Frontend Design

### New feature area

Add:

- `frontend/src/app/features/cheatsheet/cheatsheet-page.component.ts`

This page should:

- read selected category from query params or local selection
- use `CategoryService` for category browsing
- call a new cheat sheet API service
- render resource cards grouped or filtered by category

### Shared component

Create:

- `frontend/src/app/shared/components/resource-card/resource-card.component.ts`

The card should show:

- title
- resource type badge
- category name if needed
- `Open`, `Download`, or `View Note` action based on type

### Routing

Add a new authenticated route under `AppLayoutComponent`:

- `/cheatsheets`

Recommended route shape:

```ts
{
  path: 'cheatsheets',
  component: CheatSheetPageComponent
}
```

### Sidebar integration

The current sidebar is category-only. To support CheatSheet Hub cleanly, extend it with a small fixed nav section:

- All Questions
- CheatSheets

Then keep the existing category tree beneath it.

### Question table integration

Add a compact "Related Resources" area to each question row, but keep it minimal.

Recommended behavior:

- show a button or badge like `Resources (3)`
- open a small inline panel or navigate to `/cheatsheets?categoryId={question.categoryId}`

The second option is simpler and keeps the question list fast.

## Admin UI Design

Extend the admin workspace with a new tab:

- `resources`

Do not overload the import tab with this feature.

Admin resource form fields:

- title
- type
- category
- URL for PDF/link
- markdown content for note resources
- display order

Recommended admin actions:

- create resource
- list resources
- delete resource

If file upload is added later, it should be a separate enhancement after storage design is settled.

## Performance Guidance

To keep the feature efficient:

- query resources by `categoryId`
- index category foreign keys
- avoid joining resources into the main question list query
- lazy-load related resources from the question table
- paginate only if resource volume grows meaningfully

For MVP, `GetByCategoryAsync(categoryId)` returning a bounded list is acceptable.

## Production-Ready Scope For This Repository

The request said "full backend + frontend code" and "production-ready implementation". For this codebase, that is realistic only if the scope is narrowed to metadata-based resources first.

Production-ready for MVP means:

- clean entity and EF mapping
- DTO-only API surface
- `Result<T>` service returns
- auth on admin endpoints
- Angular standalone components
- no entity leakage
- no fake file-upload support without storage rules

## Recommended Implementation Plan

1. Add `CheatSheetResource` entity, enum, and EF mapping.
2. Add DTOs and `ICheatSheetService`.
3. Implement public and admin resource controllers.
4. Add Angular resource service and cheat sheet page.
5. Add `ResourceCardComponent`.
6. Add `/cheatsheets` route and sidebar entry.
7. Add admin resources tab.
8. Add a lightweight question-to-resource navigation link.

## Final Review

The feature itself is a good fit for the Interview Prep App.

The main changes needed to make the request match this repository are:

- define MVP as metadata-based resources first
- avoid assuming file upload/storage already exists
- implement admin resources in a dedicated admin controller
- extend the sidebar carefully because it is currently category-driven
- keep question-table integration lightweight to avoid query bloat

With those adjustments, CheatSheet Hub fits the project cleanly and can be implemented without breaking the current architecture.

> **Navigation:** [← Back to README](../../README.md) · [Architecture](../Architecture/) · [Domain](../Domain/) · [Features](../Features/) · [API](../API/) · [ADR](../ADR/)
> **Related:** [ENGINEERING_PLAYBOOK](../Architecture/ENGINEERING_PLAYBOOK.md) · [TRD](../Architecture/TRD.md)

# ADR 001: Clean Architecture

## Context
FullStack Mastery requires a robust backend capable of complex validation (like the import pipeline) while remaining testable and scalable. We needed to choose an architectural pattern that would prevent the business logic from becoming tightly coupled to the database framework (EF Core) or the presentation layer (ASP.NET Web API).

## Decision
We adopted a 4-layer **Clean Architecture** pattern over a traditional monolith or CQRS pattern.

The layers are strictly isolated, with dependencies pointing inwards:
1. **Domain (Core)**: Entities, Enums, and Repository Interfaces. Has NO external dependencies.
2. **Infrastructure**: EF Core DbContext, Migrations, and SQL implementations of repositories. Depends only on Domain.
3. **Application (Services)**: Business logic, validation, DTOs, and Service interfaces. Depends only on Domain.
4. **API (Presentation)**: Controllers, auth config, and middleware. Depends on Application.

*Note: While early documentation drafts (like `APPLICATION_FLOW.md`) mentioned CQRS, we explicitly decided against it to avoid unnecessary boilerplate (Commands/Queries/Handlers) for a system of this size, opting for service-based dependency injection instead.*

## Consequences
**Positive:**
- **Testability:** The Application layer can be unit tested without a database by mocking the repository interfaces.
- **Flexibility:** We can switch databases (e.g., SQL Server to PostgreSQL/Supabase) by only modifying the Infrastructure layer.
- **Maintainability:** Clear separation of concerns makes the codebase easier to navigate and extend.

**Negative:**
- **Boilerplate:** Requires creating DTOs to map between Domain entities and API responses, preventing accidental exposure of internal database fields.
- **Learning Curve:** Developers must understand dependency inversion to correctly wire up new features.

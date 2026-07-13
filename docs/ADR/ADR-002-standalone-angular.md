> **Navigation:** [← Back to README](../../README.md) · [Architecture](../Architecture/) · [Domain](../Domain/) · [Features](../Features/) · [API](../API/) · [ADR](../ADR/)
> **Related:** [ENGINEERING_PLAYBOOK](../Architecture/ENGINEERING_PLAYBOOK.md) · [Frontend-Handbook](../../frontend/src/assets/docs/Frontend-Handbook.md)

# ADR 002: Standalone Angular Components

## Context
Angular 14+ introduced Standalone components, providing an alternative to the traditional `NgModule` architecture. When bootstrapping the frontend for FullStack Mastery, we needed to decide the architectural foundation for component management and routing.

## Decision
We decided to completely abandon `NgModule` and use **Angular Standalone Components** for the entire application (`standalone: true`).

- No `app.module.ts` exists.
- No feature module barrel files exist.
- Components directly import their dependencies (e.g., `CommonModule`, `RouterModule`, or other standalone UI components).
- Routing is defined via `provideRouter` in `app.config.ts`.

## Consequences
**Positive:**
- **Simplicity:** Eliminates the mental overhead of tracking which module declares which component.
- **Tree-Shaking:** Easier for the build optimizer to drop unused code since dependency edges are strictly component-to-component rather than module-to-module.
- **Less Boilerplate:** Drastically reduces the number of files required to scaffold a new feature.

**Negative:**
- **Import Verbosity:** Component decorators (`@Component({ imports: [...] })`) can grow quite large since every pipe, directive, and sub-component must be explicitly imported.
- **Migration Friction:** Integrating older third-party libraries that rely heavily on `NgModule.forRoot()` patterns sometimes requires adapter logic via `importProvidersFrom()`.

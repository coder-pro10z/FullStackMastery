# FullStackMastery

## 1. What this project is
FullStack Mastery is a comprehensive, production-ready Full Stack application (Angular 17 + .NET 8) designed as an advanced learning management and interview preparation platform. It demonstrates enterprise patterns like Clean Architecture, decoupled import pipelines, and hierarchical data models.

## 2. Current status
**See [TRACKER.md](docs/TRACKER.md) for live execution status.**  
*Also see [Improvements.md](docs/Improvements.md) for architectural and product gap analysis.*

## 3. Where to look first
| I want to…                        | Start here                          |
|-----------------------------------|-------------------------------------|
| Understand the architecture       | [ENGINEERING_PLAYBOOK](docs/Architecture/ENGINEERING_PLAYBOOK.md)   |
| See all API endpoints             | [API_REFERENCE](docs/API/API_REFERENCE.md)                   |
| Add a new feature                 | [ENGINEERING_PLAYBOOK §6](docs/Architecture/ENGINEERING_PLAYBOOK.md) |
| Understand the domain model       | [PRD](docs/Domain/PRD.md) + [TRD](docs/Architecture/TRD.md)       |
| Review UI design tokens           | [Frontend-Handbook](frontend/src/assets/docs/Frontend-Handbook.md) |
| Know why a decision was made      | [ADR/](docs/ADR/)                                |

## 4. Where the architecture lives
- [ENGINEERING_PLAYBOOK.md](docs/Architecture/ENGINEERING_PLAYBOOK.md) — The single source of truth for architecture rules, feature lifecycle, and Definition of Done.
- [TRD.md](docs/Architecture/TRD.md) — Technical Requirements Document specifying tech stack and strict component layout.
- [TDD_STRATEGY.md](docs/Architecture/TDD_STRATEGY.md) — The 4-step validation path, testing rules, and module coverage.
- [supabase-migration.md](docs/Architecture/supabase-migration.md) — Guide for migrating the local SQL Server DB to Supabase PostgreSQL.
- [DESIGN_UPDATE_PLAN.md](docs/Architecture/DESIGN_UPDATE_PLAN.md) — PRD/TRD realignment and v2.0 architecture audit with 12 specific GAPs.

## 5. Where the domain lives
- [PRD.md](docs/Domain/PRD.md) — Product Requirements Document mapping out personas, Phase 1/Phase 2 features, and user stories.
- [PORTFOLIO_BRIEF.md](docs/Domain/PORTFOLIO_BRIEF.md) — Executive summary of accomplishments, claims, and design defenses for interviews.

## 6. Where the features live
- [ADMIN.md](docs/Features/ADMIN.md) — Admin subsystem details, legacy vs new controllers, and import paths.
- [CheatSheet.md](docs/Features/CheatSheet.md) — Specification for the CheatSheet Hub (metadata + file upload).
- [QUIZ.md](docs/Features/QUIZ.md) — Specification for the self-assessed quiz MVP (Practice and Assessment modes).
- [ImportModule_ValidationPlan.md](docs/Features/ImportModule_ValidationPlan.md) — Deep dive into the 6-stage validation pipeline for imports (now featuring Intelligent UPSERT logic and Dry Run Modal Intercepts).

## 7. Where the workflows live
- [APPLICATION_FLOW.md](docs/Workflows/APPLICATION_FLOW.md) — End-to-end user journeys (auth, study, content management).
- [ImportQuestionPlan.md](docs/Workflows/ImportQuestionPlan.md) — The original strict step-by-step directive for building the Excel import system.
- [Gemini_Backend.md](docs/Workflows/Gemini_Backend.md) & [Gemini_Frontend.md](docs/Workflows/Gemini_Frontend.md) — Original AI scaffolding prompts mapping the foundation.

## 8. Where the APIs live
- [API_REFERENCE.md](docs/API/API_REFERENCE.md) — Complete inventory of all endpoints, DTO shapes, and routing paths.
- *For implementation details, refer to the [legacy master README](docs/README.md).*

## 9. Where the UI lives
- [FRONTDOOR_Readme.md](docs/UI/FRONTDOOR_Readme.md) — Polished public-facing project showcase.
- [Frontend-Handbook.md](frontend/src/assets/docs/Frontend-Handbook.md) — EduDash Pro design system (Tailwind, Lucide, Light Theme, Atomic Components).
- [Progress.md](frontend/src/assets/docs/Progress.md) — Legacy migration tracking for EduDash.

## 10. Where the decisions live
- [ADR-001: Clean Architecture](docs/ADR/ADR-001-clean-architecture.md)
- [ADR-002: Standalone Angular](docs/ADR/ADR-002-standalone-angular.md)
- [ADR-003: Question/Answer Schema](docs/ADR/ADR-003-question-answer-schema.md)
- [ADR-004: Import Pipeline Design](docs/ADR/ADR-004-import-pipeline-design.md)

## 11. Where to start for new features
1. Start with the **[PRD](docs/Domain/PRD.md)** to understand the user story and domain.
2. Read the **[TRD](docs/Architecture/TRD.md)** for technical constraints and structural layout.
3. Follow the 6-step lifecycle in the **[ENGINEERING_PLAYBOOK §6](docs/Architecture/ENGINEERING_PLAYBOOK.md)**.
4. Update the **[TRACKER](docs/TRACKER.md)** as you progress.
5. Verify your work using the **[TDD_STRATEGY](docs/Architecture/TDD_STRATEGY.md)**.

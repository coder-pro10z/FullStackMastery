


# 🚀 FullStack Mastery — Interview Preparation Platform
A production-grade, full-stack interview preparation platform for .NET and Angular engineers.

  [![Build Status](https://img.shields.io/badge/build-passing-success?style=flat-square)](#)
  [![Test Coverage](https://img.shields.io/badge/coverage-88%25-success?style=flat-square)](#)
  [![.NET](https://img.shields.io/badge/.NET-8.0-512BD4?style=flat-square&logo=dotnet)](#)
  [![Angular](https://img.shields.io/badge/Angular-17-DD0031?style=flat-square&logo=angular)](#)
  [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](#)



<br />

## 📖 The "Why" and "What"

Software engineers preparing for Full Stack .NET and Angular interviews face a fragmented learning experience, often relying on platforms that over-index on raw Data Structures and Algorithms (DSA) while neglecting framework-specific concepts, system design, and scenario-based questions.

**FullStack Mastery** solves this with a centralized, distraction-free web platform providing a curated question bank, progress tracking, a dynamic Quiz & Assessment engine, and an admin-grade bulk import pipeline.

Built as a portfolio centerpiece, this project prioritizes **architectural discipline, Test-Driven Development (TDD), and clean separation of concerns** over rapid feature delivery.

---

## ✨ System Highlights

* **Robust Ingestion Pipeline:** Extensible import modules capable of parsing, validating, and structuring Questions, Quizzes, and Markdown Cheatsheets from `.xlsx`, `.csv`, and `.json` payloads.
* **Decoupled Architecture:** Built on a 4-Layer Clean Architecture model (Domain → Application → Infrastructure → Api). Business logic is entirely isolated in the Service layer, keeping controllers thin and facilitating high unit test coverage.
* **Strict E2E Data Validation:** A comprehensive testing matrix ensuring flawlessly typed data contracts between the Angular frontend and the .NET backend.
* **Predictable UI State:** Frontend state is managed synchronously with backend responses, ensuring UI consistency during complex interactions.
* **Immutable Audit Logging:** Features an append-only `AuditLog` entity for robust tracking of system events.

---

## 🛠️ Tech Stack

### Backend
* **Framework:** ASP.NET Core 8 Web API
* **Data Access:** Entity Framework Core (Code-First)
* **Database:** SQL Server
* **Security:** ASP.NET Identity + JWT
* **Testing:** xUnit, FluentAssertions, Moq

### Frontend
* **Framework:** Angular 17 (Standalone Components, no NgModules)
* **Styling:** Custom CSS (Warm parchment SaaS theme)
* **State Management:** Service-based (no NgRx or signals)

### Operations
* **Architecture Standard:** 4-Layer Clean Architecture
* **Testing Strategy:** Test-Driven Development (TDD)

---

## 🏗️ Architecture & Engineering Standards

This project is built under strict operational guidelines. For hiring managers and senior engineers reviewing this repository, please refer to the `docs/` folder for insights into how this system is planned and executed:

* [**The Engineering Playbook**](docs/ENGINEERING_PLAYBOOK.md): The immutable rules for our architecture, DTO structures, and feature lifecycle.
* [**TDD Strategy & Test Matrix**](docs/TDD_STRATEGY.md): An overview of our 4-step incremental validation path and the test scaffolding for our ingestion engine.
* [**Design & Update Plan**](docs/DESIGN_UPDATE_PLAN.md): The current roadmap and architectural evolution log.

### Enforced Architectural Rules

* **4-Layer Clean Architecture** (Domain → Application → Infrastructure → Api)
* **No MediatR / CQRS** — standard interface-based DI only
* **`Result<T>` pattern** — services never throw business exceptions
* **Angular Standalone Components** — no NgModules

---

## 🚀 Quick Start (Local Development)

To run FullStack Mastery locally for development or review, follow these steps:

### Prerequisites

* .NET SDK (v8.0+)
* SQL Server / SQL Express (Any recent version)
* Node.js (v18.0+)
* npm (v9.0+)

### 1. Backend Setup

```bash
# From repo root
dotnet run --project src\InterviewPrepApp.Api\InterviewPrepApp.Api.csproj
````

*The API will be available at `http://localhost:5000` (or your configured port). Swagger is available in Development mode at `https://localhost:<port>/swagger`.*

### 2\. Frontend Setup

```bash
cd frontend
npm install
npm start
```

*The application will be available at `http://localhost:4200`.*

### Default Dev Credentials

  * **Email:** `admin@interviewprep.com`
  * **Password:** `Admin@123`

*(Note: These credentials are for local development only and are created during startup bootstrap).*

-----

## 📸 Visual Showcase

*(Coming Soon: Add high-quality GIFs or screenshots demonstrating key features like the Dashboard, Quiz Engine, and Bulk Import).*

-----

## 🚦 Live Feature Status

A detailed breakdown of implemented features, ongoing work, and known gaps is maintained to ensure transparency.

  * **Backend:** JWT Auth, Categorization, Question CRUD, Bulk Import, Quiz Engine, Audit Logging.
  * **Frontend:** Dashboard, Question Browsing, Progress Tracking, Quiz Player (Practice & Assessment modes).

For a complete and honest assessment of the current system state, including known security and feature gaps, see the full [Live Feature Status](https://www.google.com/search?q=%232-live-feature-status) and [Known Gaps](https://www.google.com/search?q=%2315-known-gaps-honest-status) sections below.

-----

## 🤖 Agent / AI Tool Orientation

If you are an AI coding agent, LLM tool, or MCP client, **STOP** and read the following before touching any code:

1.  [`docs/ENGINEERING_PLAYBOOK.md`](https://www.google.com/search?q=docs/ENGINEERING_PLAYBOOK.md) - Architecture rules and Definition of Done.
2.  [`docs/TRACKER.md`](https://www.google.com/search?q=docs/TRACKER.md) - Current task status and alignment fixes.
3.  [`docs/TDD_STRATEGY.md`](https://www.google.com/search?q=docs/TDD_STRATEGY.md) - Test coverage map and fixture protocol.

**Critical Rules:**

  * Preserve Clean Architecture dependency direction.
  * Use `Result<T>` pattern for all service returns.
  * Angular standalone components only.
  * Check `TRACKER.md` §14 Alignment Fixes before starting any task.

-----

## 🤝 Contributing

While FullStack Mastery is primarily a personal portfolio project, architectural suggestions and code reviews are welcome. Please refer to our `CONTRIBUTING.md` (coming soon) before opening a Pull Request. Ensure all new logic passes the existing TDD matrix.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](https://www.google.com/search?q=LICENSE) file for details.

-----

*(Note: The sections below contain the detailed system documentation, including the Domain Model, API Reference, Security Model, and full architectural breakdown).*

```
```
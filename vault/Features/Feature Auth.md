---
id: "Feature Auth"
type: "feature-hub"
domain: "Shared"
layer: "Shared"
module: "Auth"
feature:
  - "[[Feature Auth]]"
technology: ".NET 8 | Angular 17"
framework: "ASP.NET Core Identity | Standalone Angular"
language: "C# | TypeScript"
project: "InterviewPrepApp"
namespace: "InterviewPrepApp.Api.Controllers | InterviewPrepApp.Domain.Entities"
api_endpoint: "POST /api/auth/register, POST /api/auth/login"
database_table: "AspNetUsers"
depends_on: []
used_by: []
implements: []
calls: []
related_to: []
status: "implemented"
tags:
  - feature/auth
  - system/security
---

# Feature: Authentication & Security

## Overview
The Authentication module provides secure access to the FullStackMastery platform, implementing **JWT Bearer Token Authentication** on the backend and local storage token management with route guards and interception on the frontend.

## Business Purpose
Ensures only authorized users can access learning features, tracks individual progress, and restricts administrative endpoints to users with the `Admin` role.

---

## 🔗 Architecture Graph Relations

```mermaid
graph TD
    AuthHub[Feature Auth] --> AuthGuard[auth.guard]
    AuthHub --> AuthInterceptor[auth.interceptor]
    AuthHub --> LoginComponent[login.component]
    AuthHub --> AuthService[auth.service]
    AuthService --> AuthController[AuthController]
    AuthController --> AppUser[ApplicationUser Entity]
    AppUser --> AspNetUsers[AspNetUsers Table]
```

### Frontend Components
* **Pages & Components**:
  * `[[login.component]]` — Handles user input and triggers login actions.
  * `[[register.component]]` — Registration form for creating new accounts.
* **Services & Guards**:
  * `[[auth.service]]` — Handles login, logout, and stores token status in memory.
  * `[[auth.guard]]` — Activates route checks for student and admin access.
  * `[[auth.interceptor]]` — Appends Bearer token to all outgoing API requests.

### Backend Components
* **Controllers**:
  * `[[AuthController]]` — Exposes `/api/auth/login` and `/api/auth/register` endpoints.
* **Entities**:
  * `[[ApplicationUser]]` — Custom identity user carrying user profile data and relations to user progress records.

### Database Tables
* `[[AspNetUsers]]` — Stores user login credentials, password hashes, and security logs.

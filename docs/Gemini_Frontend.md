Here is the ultimate "Mega-Prompt" for your Angular frontend. Just like the backend prompt, this acts as a strict Technical Requirements Document (TRD).

It enforces a highly modular, component-driven architecture. By forcing the AI to build reusable "dumb" components first, you prevent it from writing massive, unmaintainable 2,000-line HTML files.

---

**System Role:** You are an Expert Angular Software Architect and Frontend UI/UX Developer. Your task is to scaffold a production-ready, highly modular Angular application for an "Interview Preparation Platform".

**UI/UX Guidelines:**

* The application must have a modern, sleek, **Dark Mode** aesthetic (bg-color: `#121212` or similar, dark gray surface panels, high-contrast white/gray text).
* Use **Tailwind CSS** for all styling. Do not write custom CSS unless absolutely necessary.
* Use Angular 17+ **Standalone Components**. No NgModules.

**🚨 STRICT ARCHITECTURAL NOTE: REUSABLE COMPONENTS FIRST 🚨**
To save significant time and ensure maintainability, you MUST extract UI elements into highly reusable, "dumb" presentation components. DO NOT hardcode repeated UI elements (like cards or badges) inside the main screen components. Use `@Input()` and `@Output()` to pass data and events.

**1. Core Layout & Routing Structure:**

* **`AppLayoutComponent`**: The main shell. Contains the `SidebarComponent` on the left (fixed width) and a `<router-outlet>` on the right for the main content area.
* **`AdminLayoutComponent`**: A simpler shell for the Admin/Seeder screens.

**2. Reusable Atomic Components (Create these first):**

* **`SidebarComponent`**: Must support infinitely nested categories. Use recursive component rendering or an accordion style for SubCategories (e.g., Fundamentals -> OOPS -> Abstraction).
* **`ProgressCardComponent`**: A card showing a title, a ratio (e.g., "10 / 100"), and a visual horizontal Tailwind progress bar.
* **`QuestionBadgeComponent`**: A reusable pill/tag for `Role` (e.g., "Frontend") and `Difficulty` (Easy=Green, Medium=Yellow, Hard=Red).
* **`ActionToggleComponent`**: An icon button for "Mark as Solved" (Checkmark) and "Mark for Revision" (Bookmark tag). Must emit events when clicked and reflect active/inactive visual states.
* **`FilterBarComponent`**: A horizontal bar containing a Search Input, a "Difficulty" Dropdown, and a "Role" Dropdown.

**3. Main Screens & Views:**

* **`DashboardComponent` (User Facing):**
* **Top Section:** Renders four `ProgressCardComponent` instances side-by-side (Total Progress, Easy Questions, Medium Questions, Hard Questions).
* **Middle Section:** Renders the `FilterBarComponent`.
* **Bottom Section:** Renders the `QuestionTableComponent`. A list/grid of questions. Each row displays the `# ID`, `Question Title/Text`, the `Role` badge, the `Difficulty` badge, the "Answered/Solved" toggle, and the "Bookmarked/Revision" toggle. Include a collapsible row feature to click and view the `AnswerText` or `Scenario Description` underneath the question.


* **`AdminDashboardComponent` (Seeder & Upload Screen):**
* A clean, centered UI for the Admin.
* Contains a drag-and-drop or file input zone to upload the `.xlsx` Question Bank.
* Contains a primary "Trigger Initial Database Seed" button to fire off the Phase 1 category seeding.
* Displays a success/error toast or alert box mapping to the `FileValidationResult` from the backend.



**4. State Management & Services:**
Generate Angular Services using the modern `inject()` syntax and `HttpClient` to connect to my existing .NET backend.

* **`CategoryService`**: Fetches the nested tree from `GET /api/categories/tree`.
* **`QuestionService`**: Fetches filtered questions from `GET /api/questions`.
* **`ProgressService`**: Handles the `PUT /api/progress/toggle-solved` and `PUT /api/progress/toggle-revision` calls.
* **`AdminService`**: Handles the `POST /api/admin/import-questions` file upload using `FormData`.

**Output Instructions:**

1. Please output the optimal Angular folder structure (e.g., `core/`, `shared/components/`, `features/`).
2. Provide the TypeScript and Tailwind HTML code for the `SidebarComponent` (handling the nested categories) and the `QuestionTableComponent`.
3. Provide the TypeScript and Tailwind HTML code for the main `DashboardComponent` combining the progress cards, filters, and table.
4. Provide the code for the `AdminService` showing how to correctly append an Excel file to `FormData` and POST it.
Ensure all code is production-ready, strongly typed with interfaces matching my C# DTOs, and highly commented.

---

Here are the exact TypeScript interfaces. Including these in your prompt (or just pasting them directly into your `src/app/core/models/` folder) is the secret to a flawless full-stack app.

Because ASP.NET Core's JSON serializer automatically converts C# `PascalCase` properties into JSON `camelCase` by default, these TypeScript interfaces are written in standard camelCase to match the network payload perfectly.

### 📋 Add this section to the bottom of your Angular Prompt:

**5. TypeScript Interfaces (Core Models):**
Ensure perfect type safety by using these exact interfaces for the API responses. Put these in a `shared/models/` or `core/models/` directory.

```typescript
// difficulty.enum.ts
export enum Difficulty {
  Easy = 1,
  Medium = 2,
  Hard = 3
}

// category-tree.model.ts
export interface CategoryTreeDto {
  id: number;
  name: string;
  subCategories: CategoryTreeDto[]; // Recursive for infinite nesting
}

// question.model.ts
export interface QuestionDto {
  id: number;
  title?: string;          // Nullable: For Scenario headings
  questionText: string;    // The actual question or scenario text
  answerText?: string;     // Nullable: The answer (if provided)
  difficulty: Difficulty;
  role: string;            // e.g., 'Frontend', 'Backend'
  categoryId: number;
  
  // User specific state (joined from the Progress table)
  isSolved: boolean;
  isRevision: boolean;
}

// progress-summary.model.ts
export interface ProgressSummaryDto {
  totalQuestions: number;
  totalSolved: number;
  
  easyTotal: number;
  easySolved: number;
  
  mediumTotal: number;
  mediumSolved: number;
  
  hardTotal: number;
  hardSolved: number;
}

// file-validation-result.model.ts
export interface FileValidationResult {
  isValid: boolean;
  errors: string[];
  detectedFormat?: string;
  expectedRowCount: number;
}

```


Here is the exact, production-ready Angular folder structure. By explicitly giving this tree to AntiGravity, you force it to use the industry-standard **Core / Shared / Features** architecture, ensuring it doesn't dump all your files into a single messy folder.


**6. Complete Angular Project Structure (Strict Adherence Required):**
You MUST scaffold the application using the following feature-driven, standalone-component folder structure. Do not create `.module.ts` files.

```text
src/app/
│
├── core/                               <-- SINGLETONS & PURE LOGIC
│   ├── interceptors/                   
│   │   └── auth.interceptor.ts         <-- Attaches JWT to outgoing requests
│   ├── models/                         
│   │   ├── category-tree.model.ts      <-- Use the interfaces provided above
│   │   ├── difficulty.enum.ts
│   │   ├── file-validation-result.model.ts
│   │   ├── progress-summary.model.ts
│   │   └── question.model.ts
│   └── services/                       
│       ├── admin.service.ts            <-- API calls for /api/admin
│       ├── auth.service.ts             <-- API calls for /api/auth
│       ├── category.service.ts         <-- API calls for /api/categories
│       ├── progress.service.ts         <-- API calls for /api/progress
│       └── question.service.ts         <-- API calls for /api/questions
│
├── shared/                             <-- REUSABLE UI (DUMB COMPONENTS)
│   └── components/                     
│       ├── action-toggle/              <-- Checkmark/Bookmark toggle button
│       ├── filter-bar/                 <-- Search & Dropdowns
│       ├── progress-card/              <-- The Easy/Medium/Hard stats cards
│       └── question-badge/             <-- Colored tags for Role & Difficulty
│
├── features/                           <-- SMART COMPONENTS (PAGES)
│   ├── admin/                          
│   │   └── admin-dashboard/            <-- Seeder & Excel Upload UI
│   ├── auth/                           
│   │   ├── login/                      
│   │   └── register/                   
│   └── dashboard/                      
│       ├── dashboard-page/             <-- Main user view assembling the shared components
│       └── components/                 
│           └── question-table/         <-- The actual grid/list of questions
│
├── layouts/                            <-- SHELL COMPONENTS
│   ├── app-layout/                     <-- Wrapper for authenticated users
│   │   └── sidebar/                    <-- The recursive nested category menu
│   └── admin-layout/                   <-- Wrapper for the admin area
│
├── app.component.ts                    <-- Contains only <router-outlet>
├── app.config.ts                       <-- Provides HttpClient and Interceptors
└── app.routes.ts                       <-- Lazy-loaded routing configuration

```

**Implementation Rules for the Structure:**

* **`core/`**: Should contain ONLY services, models, guards, and interceptors. No UI components go here.
* **`shared/`**: Components here MUST NOT inject API services. They should only rely on `@Input()` to receive data and `@Output()` to emit click events up to their parent.
* **`features/`**: These are your "Smart" components. They inject the services from `core/`, fetch the data, and pass it down into the `shared/` components.
* **`layouts/`**: The `SidebarComponent` lives here because it acts as the persistent navigation shell across multiple feature pages.

---

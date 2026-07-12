# 📐 EduDash Pro — Frontend Handbook
> *The definitive reference for building and maintaining the Antigravity UI.*
> **Stack:** Angular 17 (Standalone) · Tailwind CSS 3.4 · Lucide-Angular · Clean Architecture

---

## Table of Contents
1. [Architecture & Folder Structure](#1-architecture--folder-structure)
2. [Design Tokens & Color System](#2-design-tokens--color-system)
3. [Typography](#3-typography)
4. [Spacing — The 8px Grid](#4-spacing--the-8px-grid)
5. [Elevation & Shadows](#5-elevation--shadows)
6. [Iconography — Lucide Only](#6-iconography--lucide-only)
7. [Layout System](#7-layout-system)
8. [Navigation & Routing](#8-navigation--routing)
9. [Component Patterns](#9-component-patterns)
10. [The Glassmorphism Login Overlay](#10-the-glassmorphism-login-overlay)
11. [Micro-Interactions & Animations](#11-micro-interactions--animations)
12. [Skeleton Loading States](#12-skeleton-loading-states)
13. [The Adapter Shield (API Mapping)](#13-the-adapter-shield-api-mapping)
14. [Responsive Breakpoints](#14-responsive-breakpoints)
15. [Accessibility](#15-accessibility)
16. [Screen Inventory](#16-screen-inventory)

---

## 1. Architecture & Folder Structure

```
src/app/
├── core/                         # Singleton services, guards, interceptors, models
│   ├── guards/
│   ├── interceptors/
│   ├── models/                   # Strict TypeScript interfaces — the Adapter Shield
│   ├── services/                 # API services — NEVER expose raw API shapes
│   └── state/                    # Signal-based stores
│
├── features/                     # Lazy-loaded feature modules (one per route)
│   ├── admin/
│   ├── auth/
│   ├── dashboard/
│   ├── interview-canvas/
│   ├── learning-lab/
│   ├── question-bank/
│   ├── quiz/
│   └── skill-tree/
│
├── layouts/                      # Layout wrappers — own Sidebar, TopNav, outlet
│   ├── app-layout/               # Student-facing layout
│   ├── admin-layout/             # Admin-facing layout
│   └── components/               # Shared layout primitives
│       ├── sidebar/
│       └── top-nav/
│
├── shared/                       # Reusable dumb components, pipes, directives
│   └── components/
│       ├── action-toggle/
│       ├── activity-heatmap/
│       ├── badge/
│       ├── code-block/
│       ├── filter-bar/
│       ├── pagination/
│       ├── premium-checkbox/
│       ├── premium-progress/
│       ├── progress-card/
│       ├── stat-card/
│       └── sub-category-nav/
│
├── app.component.ts              # Bare shell — `<router-outlet />` only
├── app.config.ts                 # Providers (router, http, lucide)
└── app.routes.ts                 # Top-level route definitions
```

### Rules
- **Every component is `standalone: true`.** No `NgModule` files anywhere.
- **Feature components are lazy-loaded** via `loadComponent` in `app.routes.ts`.
- **Layout wrappers** (`AppLayoutComponent`, `AdminLayoutComponent`) are loaded as route parents — they wrap child `<router-outlet>`.

---

## 2. Design Tokens & Color System

### "Antigravity" Color Palette

All colors are defined as CSS custom properties in `styles.scss` under `@layer base > :root`.

| Token                    | Hex / Tailwind   | Usage                                              |
|--------------------------|------------------|----------------------------------------------------|
| `--color-primary`        | `#1A73E8` (Blue) | Actionable elements, CTAs, links, "Pro" branding   |
| `--color-success`        | `#10B981` (Em-500)| Mastery, Streaks, Correct answers                 |
| `--color-bg-default`     | `#F8FAFC` (Sl-50)| Page background, cool breathable off-white         |
| `--color-surface`        | `#FFFFFF` (White)| Cards, modals, nav chrome, sidebar pop             |
| `--color-border`         | `#E2E8F0` (Sl-200)| Universal dividers, inputs, structural thin lines |
| `--color-text-primary`   | `#202124`        | Headings, primary body                             |
| `--color-text-secondary` | `#5F6368`        | Subtitles, meta, placeholders                      |

### Tailwind Mapping
Use the raw hex in Tailwind classes for consistency:
```html
<!-- ✅ Correct -->
<p class="text-[#5F6368]">Subtitle</p>
<div class="bg-[#F8F9FA]">...</div>

<!-- ❌ Wrong — don't use unregistered Tailwind color names -->
<p class="text-gray-500">Subtitle</p>
```

### Gradient Accents
Brand gradients use `from-blue-600 to-violet-600`:
```html
<div class="bg-gradient-to-br from-blue-600 to-violet-600">...</div>
```

---

## 3. Typography

**Typography (Hybrid Hierarchy)**
- **Headings**: Outfit or Google Sans (Weight: 600-700, `-tracking-tight`).
- **Body UI**: Inter or Geist Sans (Weight: 400-500, Apple-style legibility).
- **Monospace Font:** `JetBrains Mono` (for code blocks)

| Element | Specification                                | Weight   | Size   |
|---------|----------------------------------------------|----------|--------|
| `h1`    | Bold, tracking-tight                         | 600-700  | 32px   |
| Body    | Regular - Compact                            | 400      | 14px   |
| Label   | Medium Caps                                  | 500      | 12px   |
| Code    | `font-mono text-[0.85em]` (JetBrains Mono)   | 400      | ~14px  |

### Section Labels (Sidebar)
```html
<span class="text-[10px] font-semibold uppercase tracking-wider text-slate-600">Section</span>
```

---

## 4. Spacing — The 8px Grid

> **STRICT RULE:** All padding, margin, and gap values MUST align to Tailwind's **base-2 scale** (which maps to the 8px grid).

| Tailwind Class | Pixels | Use Case                    |
|----------------|--------|-----------------------------|
| `p-1` / `m-1`  | 4px    | Tight internal padding only |
| `p-2` / `m-2`  | 8px    | Minimum comfortable spacing |
| `p-3` / `m-3`  | 12px   | Nav item padding            |
| `p-4` / `m-4`  | 16px   | Card internal padding       |
| `p-5` / `m-5`  | 20px   | Card body (mobile)          |
| `p-6` / `m-6`  | 24px   | Card body (desktop), page   |
| `p-8` / `m-8`  | 32px   | Section spacing, modals     |
| `gap-2`        | 8px    | Icon-to-text spacing        |
| `gap-3`        | 12px   | Nav item gap                |
| `gap-4`        | 16px   | Card grid gap               |
| `gap-6`        | 24px   | Section gap                 |

### Forbidden Values
```html
<!-- ❌ NEVER use arbitrary pixel values that break the grid -->
<div class="p-[7px]">...</div>
<div class="mt-[13px]">...</div>

<!-- ✅ Use scale values -->
<div class="p-2">...</div>
<div class="mt-3">...</div>
```

---

## 5. Elevation & Shadows

Three shadow levels defined as CSS custom properties:

| Level | Token              | CSS Value                           | Use Case                |
|-------|--------------------|-------------------------------------|-------------------------|
| 1     | `--shadow-level-1` | `0 1px 2px rgba(0,0,0,0.08)`      | Cards (default)         |
| 2     | `--shadow-level-2` | `0 4px 8px rgba(0,0,0,0.12)`      | Cards (hover), dropdowns|
| 3     | `--shadow-level-3` | `0 8px 16px rgba(0,0,0,0.14)`     | Modals, overlays        |

### Card Pattern
```html
<div class="edudash-card">
  <!-- Automatically gets shadow-level-1 + shadow-level-2 on hover -->
</div>
```

### Glassmorphism (Login Overlay)
```html
<div class="bg-white/80 backdrop-blur-xl border border-white/50 shadow-2xl rounded-2xl">
  <!-- Premium frosted glass effect -->
</div>
```

---

## 6. Iconography — Lucide Only

> **STRICT RULE:** The ONLY icon library allowed is `lucide-angular`.

### Usage
```typescript
// In component imports
import { LucideAngularModule } from 'lucide-angular';

@Component({
  imports: [LucideAngularModule],
  template: `<lucide-icon name="search" [size]="16" />`
})
```

### Primary Navigation Icons

| Route              | Icon Name         |
|--------------------|-------------------|
| Dashboard          | `layout-dashboard`|
| Learning Lab       | `book-open`       |
| Question Bank      | `database`        |
| Skill Tree         | `git-branch`      |
| Interview Canvas   | `monitor`         |
| Notifications      | `bell`            |
| Search             | `search`          |
| Settings           | `settings`        |
| Logout             | `log-out`         |
| Docs               | `book`/`folder`   |
| Job Description    | `pencil`/`pen`    |

 
### Sizing Guide
| Context             | Size  |
|---------------------|-------|
| Nav icons           | `18`  |
| Inline with text    | `16`  |
| Action buttons      | `18`  |
| Hero/empty state    | `48`  |

---

## 7. Layout System

### App Layout (Student-Facing)
```
┌────────────────────────────────────────────────────────┐
│                                                        │
│  ┌──────────┐  ┌──────────────────────────────────┐    │
│  │          │  │  TopNavComponent (h-16)          │    │
│  │ Sidebar  │  ├──────────────────────────────────┤    │
│  │  (w-64)  │  │                                  │    │
│  │          │  │   <router-outlet />              │    │
│  │ bg-white │  │   (flex-1, overflow-y-auto)      │    │
│  │ border-r │  │                                  │    │
│  │          │  │   Padding: p-6                   │    │
│  │          │  │                                  │    │
│  └──────────┘  └──────────────────────────────────┘    │
│                                                        │
└────────────────────────────────────────────────────────┘
```

**Key dimensions:**
- **Sidebar width:** `w-64` (256px) expanded, `w-16` (64px) collapsed
- **TopNav height:** `h-16` (64px)
- **Content padding:** `p-6` (24px)
- **Background:** `bg-slate-50` (page) / `bg-white` (sidebar, topnav)
- **Dividers:** `border-r border-slate-200` (sidebar), `border-b border-slate-200` (topnav)

### Admin Layout
Same structural pattern, but with admin-specific sidebar nav items (Dashboard, Import, Users, Settings).

### Sidebar Anatomy
```html
<aside class="w-64 bg-white border-r border-slate-200 flex flex-col h-screen">
  <!-- Brand Header: h-16, border-b -->
  <!-- Navigation Links: flex-1, overflow-y-auto, py-3 -->
  <!-- Footer (Collapse Toggle): border-t, p-2 -->
</aside>
```

### TopNav Anatomy
```html
<header class="h-16 flex items-center justify-between px-6 border-b border-slate-200 bg-white">
  <!-- LEFT: Brand link (logo + "EduDash Pro") -->
  <!-- MIDDLE: Search input (max-w-md, bg-slate-50, rounded-lg) -->
  <!-- RIGHT: Bell icon, divider, Avatar ("PK" gradient circle) -->
</header>
```

---

## 8. Navigation & Routing

### Route Structure
```
/                    → Redirect to /dashboard
/login               → LoginComponent (NO layout wrapper)
/dashboard           → DashboardComponent (inside AppLayout)
/learning-lab        → LearningLabComponent (inside AppLayout)
/question-bank       → QuestionBankComponent (inside AppLayout)
/skill-tree          → SkillTreeComponent (inside AppLayout)
/interview-canvas    → InterviewCanvasComponent (inside AppLayout)
/quiz                → QuizComponent (inside AppLayout)
/job-description     → JobDescriptionComponent (Command Center Root)
/job-description/org/:orgId → OrganizationWorkspaceComponent
/job-description/:id        → OpportunityWorkspaceComponent
/admin               → Redirect to /admin/dashboard
/admin/dashboard     → AdminOverviewComponent    (inside AdminLayout) ✅ NEW
/admin/questions     → AdminQuestionsComponent   (inside AdminLayout) ✅ NEW
/admin/categories    → AdminCategoriesComponent  (inside AdminLayout) ✅ NEW
/admin/import        → AdminImportComponent      (inside AdminLayout) ✅ REBUILT
/admin/docs          → DocsComponent             (inside AdminLayout)
/**                  → Redirect to /dashboard
```

### Active Link Styling
```html
<a
  routerLink="/dashboard"
  routerLinkActive="bg-blue-50 text-blue-600 font-semibold border-l-2 border-blue-600"
  [routerLinkActiveOptions]="{ exact: true }"
  class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
         text-slate-500 hover:text-slate-800 hover:bg-slate-100
         transition-all duration-150 border-l-2 border-transparent"
>
  <lucide-icon name="layout-dashboard" [size]="18" />
  <span>Dashboard</span>
</a>
```

### Sidebar Navigation Items (5 Primary Routes)
1. **Dashboard** — `layout-dashboard` → `/dashboard`
2. **Learning Lab** — `book-open` → `/learning-lab`
3. **Question Bank** — `database` → `/question-bank`
4. **Skill Tree** — `git-branch` → `/skill-tree`
5. **Interview Canvas** — `monitor` → `/interview-canvas`

---

## 9. Component Patterns

### Standalone Component Template
```typescript
import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-feature-name',
  standalone: true,
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!-- Template here -->
  `,
})
export class FeatureNameComponent {}
```

### Inputs — Use `input()` signal or `@Input()`
```typescript
// Preferred (Angular 17+)
readonly title = input.required<string>();
readonly count = input<number>(0);

// Acceptable (legacy-compatible)
@Input({ required: true }) title!: string;
@Input() count = 0;
```

### Button System
```html
<!-- Primary CTA -->
<button class="btn btn-primary">Get Started</button>

<!-- Secondary -->
<button class="btn btn-secondary">Cancel</button>

<!-- Ghost -->
<button class="btn btn-ghost">Learn More</button>
```

### Card Pattern
```html
<div class="edudash-card">
  <h3 class="text-lg font-semibold text-[#202124] mb-2">Title</h3>
  <p class="text-sm text-[#5F6368]">Description text</p>
</div>
```

---

## 10. The Glassmorphism Login Overlay

> **CRITICAL RULE:** If a user is NOT authenticated, DO NOT redirect to a blank login page.
> Instead, render the full AppLayout (sidebar, topnav, blurred content) with a premium login card floating on top.

### Implementation Pattern
```typescript
// In AppLayoutComponent
readonly isAuthenticated = inject(AuthService).isAuthenticated;
```

```html
<!-- Content area becomes blurred when unauthenticated -->
<main class="flex-1 overflow-y-auto relative">
  <div
    class="transition-all duration-500"
    [class.blur-md]="!isAuthenticated()"
    [class.pointer-events-none]="!isAuthenticated()"
    [class.opacity-50]="!isAuthenticated()"
  >
    <router-outlet />
  </div>

  <!-- Glassmorphism Login Card (only when unauthenticated) -->
  @if (!isAuthenticated()) {
    <div class="absolute inset-0 z-50 flex items-center justify-center">
      <div class="bg-white/80 backdrop-blur-xl border border-white/50
                  shadow-2xl rounded-2xl p-8 w-full max-w-md
                  transform transition-all duration-500">
        <h2 class="text-2xl font-semibold text-center mb-6">Login to Access</h2>
        <!-- Login form fields -->
      </div>
    </div>
  }
</main>
```

---

## 11. Micro-Interactions & Animations

### The Antigravity Hover & Haptics
- **Card Hover**: `transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] hover:-translate-y-1 hover:shadow-md`
- **Clickable Elements Base**: `hover:-translate-y-0.5 hover:shadow-sm transition-all duration-300 ease-out`
- **Button Haptics**: `active:scale-95 transition-transform` to give clicks physical weight.

### Page Transitions
- "Fade & Slide Up" via `@angular/animations`. New components enter from `translateY(12px)` and `opacity: 0`.

### Standard Transitions & Easing
- **Easing Curve**: `cubic-bezier(0.4, 0, 0.2, 1)` (Material Design standard).
- **Color changes**: `transition-colors duration-150`
- **Layout shifts**: `transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]`

### Custom Animations in `styles.scss`
```css
/* Fade in (for sidebar expand content) */
@keyframes fade-in {
  from { opacity: 0; }
  to   { opacity: 1; }
}
.animate-fade-in { animation: fade-in 200ms ease-out both; }

/* Slide down (for mobile search panel) */
@keyframes slide-down {
  from { opacity: 0; transform: translateY(-6px); }
  to   { opacity: 1; transform: translateY(0); }
}
.animate-slide-down { animation: slide-down 150ms ease-out both; }
```

---

## 12. Skeleton Loading States

> **STRICT RULE:** No spinning wheels. Use Tailwind `animate-pulse` skeletons.

### Skeleton Pattern
```html
<!-- Skeleton for a stat card -->
<div class="edudash-card animate-pulse">
  <div class="h-4 bg-slate-200 rounded w-1/3 mb-4"></div>
  <div class="h-8 bg-slate-200 rounded w-1/2 mb-2"></div>
  <div class="h-3 bg-slate-200 rounded w-2/3"></div>
</div>

<!-- Skeleton for a text block -->
<div class="animate-pulse space-y-3">
  <div class="h-4 bg-slate-200 rounded w-3/4"></div>
  <div class="h-4 bg-slate-200 rounded w-full"></div>
  <div class="h-4 bg-slate-200 rounded w-5/6"></div>
</div>

<!-- Skeleton for an avatar -->
<div class="w-10 h-10 bg-slate-200 rounded-full animate-pulse"></div>
```

### Implementation in Components
```typescript
readonly isLoading = signal(true);
readonly data = signal<DataModel | null>(null);

constructor() {
  this.loadData();
}

private async loadData() {
  const result = await firstValueFrom(this.apiService.getData());
  this.data.set(result);
  this.isLoading.set(false);
}
```

```html
@if (isLoading()) {
  <!-- Skeleton template -->
} @else {
  <!-- Real content -->
}
```

---

## 13. The Adapter Shield (API Mapping)

> **STRICT RULE:** The UI must NEVER touch raw API responses. Map everything to `core/models`.

### Pattern
```typescript
// core/models/dashboard.model.ts
export interface DashboardStats {
  totalQuestions: number;
  completedQuestions: number;
  accuracyPercentage: number;
  streakDays: number;
}

// core/services/dashboard.service.ts
@Injectable({ providedIn: 'root' })
export class DashboardService {
  private readonly http = inject(HttpClient);

  getStats(): Observable<DashboardStats> {
    return this.http.get<ApiDashboardResponse>(`${environment.apiUrl}/dashboard/stats`).pipe(
      map(raw => this.mapToStats(raw))  // ← THE ADAPTER
    );
  }

  private mapToStats(raw: ApiDashboardResponse): DashboardStats {
    return {
      totalQuestions: raw.total_questions ?? 0,
      completedQuestions: raw.completed ?? 0,
      accuracyPercentage: raw.accuracy_pct ?? 0,
      streakDays: raw.streak ?? 0,
    };
  }
}
```

### Rules
1. **No `any` types.** Every API response has a typed interface.
2. **Null-safe mapping.** Use `??` for defaults, never trust raw data.
3. **Services own the mapping.** Components never see API shapes.

---

## 14. Responsive Breakpoints

Using Tailwind's default breakpoints:

| Breakpoint | Min Width | Usage                          |
|------------|-----------|--------------------------------|
| (default)  | 0px       | Mobile-first base styles       |
| `sm:`      | 640px     | Small tablets                  |
| `md:`      | 768px     | Tablets, show desktop search   |
| `lg:`      | 1024px    | Desktop, show sidebar          |
| `xl:`      | 1280px    | Wide desktop                   |

### Mobile Sidebar Behavior
- Below `lg:` — sidebar is hidden, toggled via hamburger button
- Mobile drawer opens with `translate-x-0`, closes with `-translate-x-full`
- Backdrop: `fixed inset-0 bg-black/40 backdrop-blur-sm`

---

## 15. Accessibility

### Focus Ring
```html
class="focus-ring"
<!-- Resolves to: focus:outline-none focus-visible:border-[#1A73E8] focus-visible:ring-1 focus-visible:ring-[#1A73E8] -->
```

### Required Attributes
- All interactive elements need `title` or `aria-label`
- All `<button>` elements need `id` for testing
- All images need `alt` text
- Color contrast: maintain WCAG AA (4.5:1 for text)

### Keyboard Navigation
- Sidebar links are focusable and tabbable
- Search input responds to `/` keyboard shortcut (to be implemented)
- Modals trap focus within

---

## 16. Screen Inventory

| Screen               | Route                | Layout     | Status      |
|----------------------|----------------------|------------|-------------|
| Login                | `/login`             | None       | Existing    |
| Dashboard            | `/dashboard`         | AppLayout  | To rebuild  |
| Learning Lab         | `/learning-lab`      | AppLayout  | To rebuild  |
| Question Bank        | `/question-bank`     | AppLayout  | To rebuild  |
| Skill Tree           | `/skill-tree`        | AppLayout  | To rebuild  |
| Interview Canvas     | `/interview-canvas`  | AppLayout  | To rebuild  |
| Quiz Player          | `/quiz`              | AppLayout  | To rebuild  |
| Job Hunt Command Center | `/job-description` | AppLayout  | ✅ Phase 1   |
| Org Workspace        | `/job-description/org/:orgId` | AppLayout | ✅ Phase 1 |
| Opp Workspace        | `/job-description/:id` | AppLayout | ✅ Phase 1 |
| Admin Overview       | `/admin/dashboard`   | AdminLayout| ✅ Rebuilt   |
| Admin Questions      | `/admin/questions`   | AdminLayout| ✅ Rebuilt   |
| Admin Categories     | `/admin/categories`  | AdminLayout| ✅ Rebuilt   |
| Admin Import         | `/admin/import`      | AdminLayout| ✅ Rebuilt   |
| Admin Docs           | `/admin/docs`        | AdminLayout| ✅ Added     |

---

> **Last Updated:** 2026-05-27 — Admin module split complete (Overview, Questions, Categories, Import)
> **Maintained by:** Praveen Kashyap

# Antigravity UI: Migration Tracker & Strategy

## The Definition of Done (DoD) per Component
- [ ] **Adapter Pattern:** API data mapped to strict `core/models`. No `any` types.
- [ ] **Skeleton States:** Loading states use `animate-pulse` skeletons.
- [ ] **Grid Compliant:** Padding/margins adhere strictly to the Tailwind 8px scale.
- [ ] **Iconography:** Only `lucide-angular` or Standard Premium icons are used.
- [ ] **Zero Console Errors:** Clean compilation.

---
## Phase 0: The Antigravity Layout Shell (Skeleton First)
*Goal: Establish the visual boundaries, navigation, and unauthenticated glassmorphism state.*
- [x] **Step 1:** Build `SidebarComponent` (Primary Routing: Dashboard, Learning Lab, Question Bank, Skill Tree, Interview Canvas, Quiz).
- [x] **Step 2:** Build `TopNavComponent` (Global Actions: Search, Bell, "PK" User Avatar).
- [x] **Step 3:** Assemble `AppLayoutComponent` & implement the Glassmorphism Login Overlay (Blur effect when unauthenticated).

## Phase 1: The API Adapter Layer (Core Services)
*Goal: Build the shield between the C# API and the Angular UI.*
- [ ] **Step 4:** Implement `auth.service.ts`.
- [ ] **Step 5:** Implement `admin-api.service.ts`.
- [ ] **Step 6:** Implement `question.service.ts` & `quiz.service.ts`.
- [ ] **Step 7:** Implement `dashboard.store.ts`.

## Phase 2: Shared UI Primitives (Dumb Components)
- [ ] **Step 8:** Polish `stat-card.component`, `premium-checkbox.component`, & `action-toggle.component`.
- [ ] **Step 9:** Polish `activity-heatmap.component` & `radar-chart.component`.

## Phase 3: Admin & Data Ingestion (The Heavy Engine)
- [ ] **Step 10:** Build `AdminDashboardComponent` layout.
- [ ] **Step 11:** Implement client-side `papaparse`/`xlsx` validation logic.
- [ ] **Step 12:** Wire the payload to `AdminImportController`.

## Phase 4: The Student Experience (The Weightless Shell)
- [ ] **Step 13:** Wire `dashboard-page.component` to `dashboard.store.ts`.
- [x] **Step 14:** Wire `question-bank.component` and `quiz-player.component`.

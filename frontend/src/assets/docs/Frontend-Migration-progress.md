# EduDash Frontend Migration Tracker

## Phase 1: Layout & Routing Architecture

- [x] **Step 1:** Strip `app.component` down to a pure Router Outlet.
  - `app.component.ts` uses inline `template: '<router-outlet />'` — no UI logic.
  - `app.component.html` is an orphaned legacy file (not used by Angular; safe to delete or ignore).

- [x] **Step 2:** Build the `TopNavComponent` (extracting UI/search logic from the old root).
  - Located at: `src/app/layouts/components/top-nav/top-nav.component.ts`
  - Brand logo, global search (desktop + mobile toggle), notifications bell, user avatar/initials.
  - Driven by `AuthService` signals (`currentUser`). `LucideAngularModule` imported.

- [x] **Step 3:** Assemble `AppLayoutComponent` and `AdminLayoutComponent` wrappers.
  - `AppLayoutComponent` at: `src/app/layouts/app-layout/app-layout.component.ts`
    - Full viewport flex shell, collapsible sidebar with brand/nav/footer, `<app-top-nav />`, scrollable `<router-outlet />`.
    - Signals for `sidebarCollapsed`, `mobileDrawerOpen`, `readMode`. Mobile drawer backdrop.
  - `AdminLayoutComponent` at: `src/app/layouts/admin-layout/admin-layout.component.ts`
    - Fixed 224px admin sidebar with branded header, nav links (Dashboard, Import, Question Bank), footer (Back to App, Sign Out).
    - `<app-top-nav />` + scrollable `<router-outlet />`.

- [x] **Step 4:** Implement Layout-Based child routing in `app.routes.ts`.
  - `''`  → `AppLayoutComponent` (children: dashboard, learning-lab, interview-canvas, skill-tree, question-bank, quiz)
  - `'admin'` → `AdminLayoutComponent` (children: dashboard, import)
  - `'login'` → `LoginComponent` (no layout wrapper)
  - `'**'` → redirects to `/dashboard`

---

## Phase 2: Feature Migration (Upcoming)

- [x] **Step 5:** Audit all feature components for stale imports from `app.component` (NgIf, RouterLink, LucideAngularModule that were previously global).
- [x] **Step 6:** Clean up the orphaned `app.component.html` file and verify the build compiles cleanly with `ng build`.
- [x] **Step 7:** Migrate the `SidebarComponent` from dark-mode Tailwind classes (`text-slate-400`, `bg-dark-surface-hover`) to the Premium Light design system classes to match the layout wrappers.
- [ ] **Step 8:** Wire up real lazy-loaded feature modules and verify deep-link routing for all child routes.

---

## 🚀 The Antigravity Master Plan: Phase 0 (Layout Shell & Responsive Polish)
*Goal: Establish the visual boundaries, navigation, and unauthenticated glassmorphism state using strict Apple HIG + Google M3 UI rules.*

- [x] **Step 9:** **Frontend-Handbook Overhaul**
  - Rewrote the master design system docs enforcing the 8px grid, Apple-style typography (Inter/SF Pro), and strictly defined Tailwind Z-index layers (`z-30` TopNav, `z-50` Overlays, `z-70` Mobile Drawers).

- [x] **Step 10:** **SidebarComponent High-Fidelity Refinement**
  - Implemented dynamic glassmorphic transparency (`bg-transparent` inheriting from wrapper).
  - Added the "Assessment Quiz" route with a custom `text-[10px]` "NEW" badge.
  - Implemented strict active states (`border-l-[3px] border-blue-700 bg-blue-50`).

- [x] **Step 11:** **TopNavComponent Enhancements & Collision Fixes**
  - Upgraded to Glassmorphism header (`bg-white/50 backdrop-blur-xl`).
  - Added dummy Breadcrumbs (Dashboard > Current Page).
  - **Collision Fix**: Corrected the Search Input Gap (`pl-10`) so the spotlight search text clears the magnifying glass icon.
  - **Collision Fix**: Moved the absolute mobile Hamburger button back into the normal Flexbox flow so it doesn't crush the breadcrumbs, emitting `(menuClick)` to the Layout layer.
  - Added the 32px User Avatar with a "Premium" gold glow ring (`ring-2 ring-yellow-400/50`).

- [x] **Step 12:** **AppLayoutComponent Architectural & Z-Index Repairs**
  - **Scrollbar Fix**: Restructured the flexbox wrappers with `h-full`, `min-h-0`, and `flex-shrink-0` to strictly trap scrolling inside the `<main>` element, destroying the "double scrollbar" issue and preventing the TopNav from scrolling out of view.
  - **Glassmorphism Overlay**: Added an unauthenticated login card that applies a `blur-sm pointer-events-none` state to the main router outlet content.
  - **Z-Index Layering Fix**: Elevated the mobile `<aside>` drawer to `z-[70]` with `bg-white/95 backdrop-blur-xl shadow-2xl` to ensure the sidebar aggressively overrides the `z-[50]` glassmorphism overlay on smaller screens.

---

## Phase 3: Question Bank Rebuild
*Goal: Migrate robust data-fetching, filtering, pagination, and optimistic-toggle logic to the new QuestionBankComponent while strictly preserving its new card-based UI.*

- [x] **Step 1:** Strip out the old dashboard logic to leave a pure stats-only view.
- [x] **Step 2:** Scaffold the Question Bank reactive state (\`filters$\`, \`pagination$\`, \`loadQuestions$\`, \`vm$\`).
- [x] **Step 3:** Wire up \`<app-filter-bar>\` and Antigravity-styled pagination to the Question Bank template.
- [x] **Step 4:** Map \`QuestionDto\` data to the new Card UI layout with loading skeletons and empty states.
- [x] **Step 5:** Port \`toggleSolved\` and \`toggleRevision\` with full optimistic updates and error rollbacks.
- [x] **Step 6:** Migrate shared components (\`filter-bar\`, \`action-toggle\`, \`progress-card\`, \`sub-category-nav\`) to the Antigravity Premium Light design system styles.

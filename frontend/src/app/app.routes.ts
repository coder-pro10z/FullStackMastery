import { Routes } from '@angular/router';

export const routes: Routes = [

  // ─────────────────────────────────────────────────────────
  //  AUTH routes — rendered WITHOUT any layout wrapper
  // ─────────────────────────────────────────────────────────
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login.component').then(m => m.LoginComponent),
  },
  {
    path: 'landing',
    loadComponent: () =>
      import('./features/landing/landing.component').then(m => m.LandingComponent),
  },

  // ─────────────────────────────────────────────────────────
  //  STUDENT APP — wrapped in AppLayoutComponent
  // ─────────────────────────────────────────────────────────
  {
    path: '',
    loadComponent: () =>
      import('./layouts/app-layout/app-layout.component').then(m => m.AppLayoutComponent),
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'dashboard',
      },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent),
      },
      {
        path: 'learning-lab',
        loadComponent: () =>
          import('./features/learning-lab/learning-lab.component').then(m => m.LearningLabComponent),
      },
      {
        path: 'interview-canvas',
        loadComponent: () =>
          import('./features/interview-canvas/interview-canvas.component').then(m => m.InterviewCanvasComponent),
      },
      {
        path: 'skill-tree',
        loadComponent: () =>
          import('./features/skill-tree/skill-tree.component').then(m => m.SkillTreeComponent),
      },
      {
        path: 'question-bank',
        loadComponent: () =>
          import('./features/question-bank/question-bank.component').then(m => m.QuestionBankComponent),
      },
      {
        path: 'quiz',
        loadComponent: () =>
          import('./features/quiz/quiz.component').then(m => m.QuizComponent),
      },
      {
        path: 'job-description',
        loadComponent: () =>
          import('./features/job-description/job-description.component').then(m => m.JobDescriptionComponent),
        children: [
          {
            path: 'vault',
            loadComponent: () =>
              import('./features/job-description/components/resume-vault/resume-vault.component').then(m => m.ResumeVaultComponent),
          },
          {
            path: 'org/:orgId',
            loadComponent: () =>
              import('./features/job-description/components/organization-workspace/organization-workspace.component').then(m => m.OrganizationWorkspaceComponent),
            children: [
              {
                path: '',
                loadComponent: () => import('./features/job-description/components/tabs/overview/org-overview-tab.component').then(m => m.OrgOverviewTabComponent)
              },
              {
                path: 'contacts',
                loadComponent: () => import('./features/job-description/components/tabs/contacts/contacts-tab.component').then(m => m.ContactsTabComponent)
              }
            ]
          },
          {
            path: ':id',
            loadComponent: () =>
              import('./features/job-description/components/opportunity-workspace/opportunity-workspace.component').then(m => m.OpportunityWorkspaceComponent),
            children: [
              {
                path: '',
                loadComponent: () => import('./features/job-description/components/tabs/overview/opp-overview-tab.component').then(m => m.OppOverviewTabComponent)
              },
              {
                path: 'contacts',
                loadComponent: () => import('./features/job-description/components/tabs/contacts/contacts-tab.component').then(m => m.ContactsTabComponent)
              },
              {
                path: 'notes',
                loadComponent: () => import('./features/job-description/components/tabs/notes/notes-tab.component').then(m => m.NotesTabComponent)
              },
              {
                path: 'questions',
                loadComponent: () => import('./features/job-description/components/tabs/questions/questions-tab.component').then(m => m.QuestionsTabComponent)
              }
            ]
          }
        ]
      },
      // Legacy alias
      {
        path: 'interactive-lessons',
        redirectTo: 'learning-lab',
        pathMatch: 'full',
      },
    ],
  },

  // ─────────────────────────────────────────────────────────
  //  ADMIN PANEL — wrapped in AdminLayoutComponent
  // ─────────────────────────────────────────────────────────
  {
    path: 'admin',
    loadComponent: () =>
      import('./layouts/admin-layout/admin-layout.component').then(m => m.AdminLayoutComponent),
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'dashboard',
      },
      // ── 📊 Dashboard Overview ──────────────────────────────────────────────
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/admin/admin-overview/admin-overview.component').then(
            m => m.AdminOverviewComponent
          ),
      },
      // ── ❓ Questions Table ──────────────────────────────────────────────────
      {
        path: 'questions',
        loadComponent: () =>
          import('./features/admin/admin-questions/admin-questions.component').then(
            m => m.AdminQuestionsComponent
          ),
      },
      // ── 🏷 Categories Tree ──────────────────────────────────────────────────
      {
        path: 'categories',
        loadComponent: () =>
          import('./features/admin/admin-categories/admin-categories.component').then(
            m => m.AdminCategoriesComponent
          ),
      },
      // ── 📥 Import ───────────────────────────────────────────────────────────
      {
        path: 'import',
        loadComponent: () =>
          import('./features/admin/admin-import/admin-import.component').then(
            m => m.AdminImportComponent
          ),
      },
      // ── 📖 Docs ─────────────────────────────────────────────────────────────
      {
        path: 'docs',
        loadComponent: () =>
          import('./features/admin/docs/docs.component').then(
            m => m.DocsComponent
          ),
      },
    ],
  },

  // ─────────────────────────────────────────────────────────
  //  CATCH-ALL — redirect any unknown path to /dashboard
  // ─────────────────────────────────────────────────────────
  {
    path: '**',
    redirectTo: '/dashboard',
  },
];

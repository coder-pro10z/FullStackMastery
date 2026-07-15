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
        data: { title: 'Dashboard' }
      },
      {
        path: 'learning-lab',
        loadComponent: () =>
          import('./features/learning-lab/learning-lab.component').then(m => m.LearningLabComponent),
        data: { title: 'Learning Lab' }
      },
      {
        path: 'interview-canvas',
        loadComponent: () =>
          import('./features/interview-canvas/interview-canvas.component').then(m => m.InterviewCanvasComponent),
        data: { title: 'Interview Canvas' }
      },
      {
        path: 'skill-tree',
        loadComponent: () =>
          import('./features/skill-tree/skill-tree.component').then(m => m.SkillTreeComponent),
        data: { title: 'Skill Tree' }
      },
      {
        path: 'question-bank',
        loadComponent: () =>
          import('./features/question-bank/question-bank.component').then(m => m.QuestionBankComponent),
        data: { title: 'Question Bank' }
      },
      {
        path: 'interviews',
        loadComponent: () =>
          import('./features/interviews/interviews.component').then(m => m.InterviewsComponent),
        data: { title: 'Interviews' }
      },
      {
        path: 'job-description',
        loadComponent: () =>
          import('./features/job-description/job-description.component').then(m => m.JobDescriptionComponent),
        data: { title: 'Job Description' },
        children: [
          {
            path: 'vault',
            loadComponent: () =>
              import('./features/job-description/components/resume-vault/resume-vault.component').then(m => m.ResumeVaultComponent),
            data: { title: 'Resume Vault' }
          },
          {
            path: 'org/:orgId',
            loadComponent: () =>
              import('./features/job-description/components/organization-workspace/organization-workspace.component').then(m => m.OrganizationWorkspaceComponent),
            data: { title: 'Organization' },
            children: [
              {
                path: '',
                loadComponent: () => import('./features/job-description/components/tabs/overview/org-overview-tab.component').then(m => m.OrgOverviewTabComponent),
                data: { title: 'Organization Overview' }
              },
              {
                path: 'contacts',
                loadComponent: () => import('./features/job-description/components/tabs/contacts/contacts-tab.component').then(m => m.ContactsTabComponent),
                data: { title: 'Contacts' }
              }
            ]
          },
          {
            path: ':id',
            loadComponent: () =>
              import('./features/job-description/components/opportunity-workspace/opportunity-workspace.component').then(m => m.OpportunityWorkspaceComponent),
            data: { title: 'Opportunity Workspace' },
            children: [
              {
                path: '',
                loadComponent: () => import('./features/job-description/components/tabs/overview/opp-overview-tab.component').then(m => m.OppOverviewTabComponent),
                data: { title: 'Opportunity Overview' }
              },
              {
                path: 'contacts',
                loadComponent: () => import('./features/job-description/components/tabs/contacts/contacts-tab.component').then(m => m.ContactsTabComponent),
                data: { title: 'Contacts' }
              },
              {
                path: 'notes',
                loadComponent: () => import('./features/job-description/components/tabs/notes/notes-tab.component').then(m => m.NotesTabComponent),
                data: { title: 'Notes' }
              },
              {
                path: 'questions',
                loadComponent: () => import('./features/job-description/components/tabs/questions/questions-tab.component').then(m => m.QuestionsTabComponent),
                data: { title: 'Questions' }
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
        data: { title: 'Overview' }
      },
      // ── ❓ Questions Table ──────────────────────────────────────────────────
      {
        path: 'questions',
        loadComponent: () =>
          import('./features/admin/admin-questions/admin-questions.component').then(
            m => m.AdminQuestionsComponent
          ),
        data: { title: 'Questions' }
      },
      // ── 🏷 Categories Tree ──────────────────────────────────────────────────
      {
        path: 'categories',
        loadComponent: () =>
          import('./features/admin/admin-categories/admin-categories.component').then(
            m => m.AdminCategoriesComponent
          ),
        data: { title: 'Categories' }
      },
      // ── 📥 Import ───────────────────────────────────────────────────────────
      {
        path: 'import',
        loadComponent: () =>
          import('./features/admin/admin-import/admin-import.component').then(
            m => m.AdminImportComponent
          ),
        data: { title: 'Import Data' }
      },
      // ── 📜 Import Logs ──────────────────────────────────────────────────────
      {
        path: 'import-logs',
        loadComponent: () =>
          import('./features/admin/admin-import-logs/admin-import-logs.component').then(
            m => m.AdminImportLogsComponent
          ),
        data: { title: 'Import History' }
      },
      // ── 📖 Docs ─────────────────────────────────────────────────────────────
      {
        path: 'docs',
        loadComponent: () =>
          import('./features/admin/docs/docs.component').then(
            m => m.DocsComponent
          ),
        data: { title: 'Docs' }
      },
      // ── 💼 Interviews Manager ───────────────────────────────────────────────
      {
        path: 'interviews',
        loadComponent: () =>
          import('./features/admin/admin-interviews/admin-interview-list.component').then(
            m => m.AdminInterviewListComponent
          ),
        data: { title: 'Interviews' }
      },
      {
        path: 'interviews/:companyId',
        loadComponent: () =>
          import('./features/admin/admin-interviews/admin-interview-canvas.component').then(
            m => m.AdminInterviewCanvasComponent
          ),
        data: { title: 'Interview Canvas' }
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

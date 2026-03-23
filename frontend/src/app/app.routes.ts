import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { redirectIfAuthenticatedGuard } from './core/guards/redirect-if-authenticated.guard';
import { AdminDashboardComponent } from './features/admin/admin-dashboard/admin-dashboard.component';
import { LoginComponent } from './features/auth/login/login.component';
import { RegisterComponent } from './features/auth/register/register.component';
import { DashboardPageComponent } from './features/dashboard/dashboard-page/dashboard-page.component';
import { AdminLayoutComponent } from './layouts/admin-layout/admin-layout.component';
import { AppLayoutComponent } from './layouts/app-layout/app-layout.component';
import { QuizDashboardComponent } from './features/quiz/quiz-dashboard/quiz-dashboard.component';
import { QuizPlayerComponent } from './features/quiz/quiz-player/quiz-player.component';
import { QuizReviewComponent } from './features/quiz/quiz-review/quiz-review.component';

export const appRoutes: Routes = [
  {
    path: 'login',
    component: LoginComponent,
    canActivate: [redirectIfAuthenticatedGuard]
  },
  {
    path: 'register',
    component: RegisterComponent,
    canActivate: [redirectIfAuthenticatedGuard]
  },
  {
    path: '',
    component: AppLayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: '',
        pathMatch: 'full',
        component: DashboardPageComponent
      },
      {
        path: 'quiz/new',
        component: QuizDashboardComponent
      },
      {
        path: 'quiz/:id',
        component: QuizPlayerComponent
      },
      {
        path: 'quiz/:id/review',
        component: QuizReviewComponent
      }
    ]
  },
  {
    path: 'admin',
    component: AdminLayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: '',
        pathMatch: 'full',
        component: AdminDashboardComponent
      }
    ]
  },
  {
    path: '**',
    redirectTo: ''
  }
];

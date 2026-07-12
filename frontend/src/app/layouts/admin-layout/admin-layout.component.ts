import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';

import { AuthService } from '../../core/services/auth.service';
import { TopNavComponent } from '../components/top-nav/top-nav.component';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, RouterOutlet, LucideAngularModule, TopNavComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!-- ====== FULL-VIEWPORT SHELL ====== -->
    <div class="flex h-screen w-full overflow-hidden bg-slate-50">

      <!-- ====== LEFT COLUMN: ADMIN SIDEBAR ====== -->
      <aside
        class="flex flex-col flex-shrink-0 w-56 bg-white border-r border-slate-200
               transition-all duration-300 ease-out"
      >
        <!-- Sidebar Brand Header -->
        <div class="flex items-center gap-3 px-4 h-16 border-b border-slate-200 flex-shrink-0">
          <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-pink-600
                      flex items-center justify-center flex-shrink-0 shadow-sm">
            <lucide-icon name="shield-check" [size]="16" class="text-white" />
          </div>
          <div class="overflow-hidden">
            <p class="text-sm font-bold text-slate-800 leading-none">Admin</p>
            <p class="text-[10px] text-slate-400 mt-0.5 leading-none">Control Panel</p>
          </div>
        </div>

        <!-- Admin Nav Links -->
        <nav class="flex-1 overflow-y-auto py-4 px-2 space-y-0.5">

          <!-- Section: Management -->
          <span class="block px-2 mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            Management
          </span>

          <!-- 📊 Dashboard -->
          <a
            id="admin-nav-dashboard"
            routerLink="/admin/dashboard"
            routerLinkActive="bg-violet-50 text-violet-700 font-semibold border-l-2 border-violet-600"
            [routerLinkActiveOptions]="{ exact: true }"
            class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
                   text-slate-600 border-l-2 border-transparent
                   hover:bg-slate-100 hover:text-slate-900
                   transition-colors duration-150"
          >
            <lucide-icon name="layout-dashboard" [size]="16" class="flex-shrink-0" />
            Dashboard
          </a>

          <!-- ❓ Questions -->
          <a
            id="admin-nav-questions"
            routerLink="/admin/questions"
            routerLinkActive="bg-violet-50 text-violet-700 font-semibold border-l-2 border-violet-600"
            [routerLinkActiveOptions]="{ exact: true }"
            class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
                   text-slate-600 border-l-2 border-transparent
                   hover:bg-slate-100 hover:text-slate-900
                   transition-colors duration-150"
          >
            <lucide-icon name="database" [size]="16" class="flex-shrink-0" />
            Questions
          </a>

          <!-- 🏷 Categories -->
          <a
            id="admin-nav-categories"
            routerLink="/admin/categories"
            routerLinkActive="bg-violet-50 text-violet-700 font-semibold border-l-2 border-violet-600"
            [routerLinkActiveOptions]="{ exact: true }"
            class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
                   text-slate-600 border-l-2 border-transparent
                   hover:bg-slate-100 hover:text-slate-900
                   transition-colors duration-150"
          >
            <lucide-icon name="tag" [size]="16" class="flex-shrink-0" />
            Categories
          </a>

          <!-- 📥 Import -->
          <a
            id="admin-nav-import"
            routerLink="/admin/import"
            routerLinkActive="bg-violet-50 text-violet-700 font-semibold border-l-2 border-violet-600"
            [routerLinkActiveOptions]="{ exact: true }"
            class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
                   text-slate-600 border-l-2 border-transparent
                   hover:bg-slate-100 hover:text-slate-900
                   transition-colors duration-150"
          >
            <lucide-icon name="upload" [size]="16" class="flex-shrink-0" />
            Import
          </a>

          <!-- Divider -->
          <div class="border-t border-slate-100 my-3 mx-1"></div>

          <!-- Section: Resources -->
          <span class="block px-2 mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            Resources
          </span>

          <!-- 📖 Docs -->
          <a
            id="admin-nav-docs"
            routerLink="/admin/docs"
            routerLinkActive="bg-violet-50 text-violet-700 font-semibold border-l-2 border-violet-600"
            [routerLinkActiveOptions]="{ exact: false }"
            class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
                   text-slate-600 border-l-2 border-transparent
                   hover:bg-slate-100 hover:text-slate-900
                   transition-colors duration-150"
          >
            <lucide-icon name="book-open" [size]="16" class="flex-shrink-0" />
            Docs
          </a>

        </nav>

        <!-- Sidebar Footer: Back to App + Sign Out -->
        <div class="border-t border-slate-200 p-3 space-y-1 flex-shrink-0">
          <a
            routerLink="/dashboard"
            class="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium
                   text-slate-500 hover:bg-slate-100 hover:text-slate-800
                   transition-colors duration-150"
          >
            <lucide-icon name="arrow-left" [size]="14" />
            Back to App
          </a>
          <button
            id="admin-sign-out"
            class="flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-sm font-medium
                   text-red-500 hover:bg-red-50 hover:text-red-700
                   transition-colors duration-150"
            (click)="logout()"
          >
            <lucide-icon name="log-out" [size]="14" />
            Sign out
          </button>
        </div>
      </aside>

      <!-- ====== RIGHT COLUMN: MAIN AREA ====== -->
      <div class="flex-1 flex flex-col min-w-0 overflow-hidden">

        <!-- ====== TOP NAVIGATION ====== -->
        <app-top-nav />

        <!-- ====== SCROLLABLE ADMIN CONTENT ====== -->
        <main class="flex-1 overflow-y-auto p-6">
          <router-outlet />
        </main>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; height: 100vh; }
  `]
})
export class AdminLayoutComponent {
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);

  logout(): void {
    this.authService.logout();
    void this.router.navigate(['/login']);
  }
}

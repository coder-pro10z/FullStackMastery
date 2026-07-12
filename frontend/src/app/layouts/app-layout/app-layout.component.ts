import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink, RouterOutlet } from '@angular/router';
import { map } from 'rxjs';

import { CategoryService } from '../../core/services/category.service';
import { AuthService } from '../../core/services/auth.service';
import { SidebarComponent } from '../components/sidebar/sidebar.component';
import { TopNavComponent } from '../components/top-nav/top-nav.component';

@Component({
  selector: 'app-app-layout',
  standalone: true,
  imports: [RouterLink, RouterOutlet, SidebarComponent, TopNavComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!-- Mobile drawer backdrop -->
    @if (mobileDrawerOpen()) {
      <div
        class="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
        (click)="closeMobileDrawer()"
      ></div>
    }

    <!-- ====== FULL-VIEWPORT SHELL ====== -->
    <div class="flex h-screen w-full overflow-hidden bg-slate-50">
      
      <!-- ====== LEFT COLUMN: SIDEBAR ====== -->
      <aside 
        class="h-full shrink-0 flex flex-col border-r border-slate-200 bg-white/95 backdrop-blur-xl z-[70]
               fixed lg:relative inset-y-0 left-0 transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] shadow-2xl lg:shadow-none"
        [class]="sidebarClasses()"
      >
        <app-sidebar class="flex-1"
          [collapsed]="sidebarCollapsed()"
          (toggleCollapse)="toggleSidebar()"
        ></app-sidebar>
      </aside>

      <!-- ====== RIGHT COLUMN: MAIN AREA ====== -->
      <div class="flex-1 flex flex-col h-full min-w-0 relative">
        
        <!-- ====== TOP NAVIGATION ====== -->
        <app-top-nav class="shrink-0 z-30 relative" (menuClick)="openMobileDrawer()"></app-top-nav>

        <!-- ====== SCROLLABLE CONTENT AREA ====== -->
        <main class="flex-1 overflow-y-auto relative z-10 bg-slate-50">
          
          @if (!isAuthenticated()) {
            <div class="absolute inset-0 z-50 flex items-center justify-center bg-white/40 backdrop-blur-md p-4">
              <div class="bg-white/90 backdrop-blur-xl shadow-2xl rounded-2xl border border-white p-8 w-96 max-w-[90%] text-center">
                 <div class="w-12 h-12 bg-[#1A73E8] text-white rounded-xl mx-auto mb-4 flex items-center justify-center shadow-lg">
                    <svg class="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                 </div>
                 <h2 class="text-xl font-bold text-slate-900 mb-2">Login to Access</h2>
                 <p class="text-sm text-slate-500 mb-6">Please authenticate to continue to EduDash Pro.</p>
                 <a routerLink="/login" class="flex items-center justify-center w-full bg-[#1A73E8] hover:bg-[#1557B0] text-white font-medium py-2.5 rounded-lg transition-colors active:scale-95 shadow-sm">
                   Go to Login
                 </a>
              </div>
            </div>
          }

          <div 
            class="transition-all duration-500 mx-auto w-full"
            [class.blur-sm]="!isAuthenticated()" 
            [class.opacity-50]="!isAuthenticated()" 
            [class.pointer-events-none]="!isAuthenticated()" 
            [class.p-6]="!readMode()"
            [class.max-w-7xl]="!readMode()"
            [class.max-w-4xl]="readMode()"
            [class.p-4]="readMode()"
            [class.lg:p-8]="readMode()"
          >
            <router-outlet></router-outlet>
          </div>

        </main>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; height: 100vh; }

    @keyframes fade-in {
      from { opacity: 0; }
      to   { opacity: 1; }
    }
    .animate-fade-in { animation: fade-in 200ms ease-out both; }
  `]
})
export class AppLayoutComponent {
  private readonly categoryService = inject(CategoryService);
  private readonly authService = inject(AuthService);
  private readonly route = inject(ActivatedRoute);

  readonly categories$ = this.categoryService.getTree().pipe(
    map((categories) => categories ?? [])
  );

  readonly selectedCategoryId = toSignal(
    this.route.queryParamMap.pipe(
      map((queryParams) => {
        const rawCategoryId = queryParams.get('categoryId');
        if (!rawCategoryId) return null;
        const categoryId = Number(rawCategoryId);
        return Number.isNaN(categoryId) ? null : categoryId;
      })
    ),
    { initialValue: null }
  );

  readonly isAuthenticated = this.authService.isAuthenticated;

  // UI State
  readonly sidebarCollapsed = signal(false);
  readonly mobileDrawerOpen = signal(false);
  readonly readMode = signal(false);

  readonly sidebarClasses = computed(() => {
    const collapsed = this.sidebarCollapsed();
    const mobileOpen = this.mobileDrawerOpen();

    const mobileClass = mobileOpen
      ? 'translate-x-0 w-64'
      : '-translate-x-full w-64';

    const desktopClass = collapsed
      ? 'lg:translate-x-0 lg:w-16'
      : 'lg:translate-x-0 lg:w-64';

    return `${mobileClass} ${desktopClass}`;
  });

  toggleSidebar(): void {
    this.sidebarCollapsed.update(v => !v);
  }

  openMobileDrawer(): void {
    this.mobileDrawerOpen.set(true);
  }

  closeMobileDrawer(): void {
    this.mobileDrawerOpen.set(false);
  }

  toggleReadMode(): void {
    this.readMode.update(v => !v);
  }
}

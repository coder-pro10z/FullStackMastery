import { ChangeDetectionStrategy, Component, inject, signal, computed } from '@angular/core';
import { AsyncPipe, NgIf } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink, RouterOutlet } from '@angular/router';
import { map } from 'rxjs';
import { CategoryService } from '../../core/services/category.service';
import { AuthService } from '../../core/services/auth.service';
import { SidebarComponent } from '../../shared/components/sidebar/sidebar.component';

@Component({
  selector: 'app-app-layout',
  standalone: true,
  imports: [AsyncPipe, NgIf, RouterLink, RouterOutlet, SidebarComponent],
  template: `
    <!-- Mobile drawer backdrop -->
    @if (mobileDrawerOpen()) {
      <div class="drawer-backdrop lg:hidden" (click)="closeMobileDrawer()"></div>
    }

    <div class="flex h-screen overflow-hidden bg-dark-bg">
      <!-- ===== SIDEBAR ===== -->
      <aside
        class="fixed lg:relative z-50 h-full flex-shrink-0 transition-all duration-300 ease-out"
        [class]="sidebarClasses()">

        <!-- Sidebar Header (Brand) -->
        <div class="flex items-center gap-3 px-4 h-16 border-b border-dark-border-light/30 flex-shrink-0">
          <!-- Logo Icon -->
          <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-accent-blue to-accent-purple flex items-center justify-center flex-shrink-0">
            <svg class="w-4.5 h-4.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          @if (!sidebarCollapsed()) {
            <div class="animate-fade-in">
              <h1 class="text-sm font-bold text-white leading-none">InterviewPrep</h1>
              <p class="text-[10px] text-slate-500 mt-0.5">Master your next interview</p>
            </div>
          }
        </div>

        <!-- Sidebar Content -->
        <div class="flex-1 overflow-y-auto overflow-x-hidden py-3">
          <app-sidebar
            [categories]="(categories$ | async) ?? []"
            [selectedCategoryId]="selectedCategoryId()"
            [collapsed]="sidebarCollapsed()" />
        </div>

        <!-- Sidebar Footer -->
        <div class="border-t border-dark-border-light/30 p-2 flex-shrink-0">
          <button
            class="btn-ghost w-full justify-center lg:justify-start"
            (click)="toggleSidebar()">
            <svg class="w-4 h-4 transition-transform duration-300" [class.rotate-180]="sidebarCollapsed()" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
            </svg>
            @if (!sidebarCollapsed()) {
              <span class="text-xs animate-fade-in">Collapse</span>
            }
          </button>
        </div>
      </aside>

      <!-- ===== MAIN AREA ===== -->
      <div class="flex-1 flex flex-col min-w-0 overflow-hidden">

        <!-- ===== TOP NAVBAR ===== -->
        <header class="h-16 flex-shrink-0 flex items-center justify-between px-4 lg:px-6 border-b border-dark-border-light/30 bg-dark-bg/80 backdrop-blur-md z-30">
          <!-- Left: Mobile menu + Search -->
          <div class="flex items-center gap-3 flex-1">
            <!-- Mobile hamburger -->
            <button class="btn-icon lg:hidden" (click)="openMobileDrawer()">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            <!-- Search bar -->
            <div class="relative flex-1 max-w-md hidden sm:block">
              <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search questions..."
                class="input-dark pl-10 py-2 text-sm bg-dark-surface-light/50 border-transparent focus:border-accent-blue/40" />
            </div>
          </div>

          <!-- Right: Actions -->
          <div class="flex items-center gap-2">
            <!-- Read Mode Toggle -->
            <button
              class="btn-ghost text-xs gap-1.5"
              [class.text-accent-blue]="readMode()"
              (click)="toggleReadMode()">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <span class="hidden md:inline">Read Mode</span>
            </button>

            <!-- Admin shortcut -->
            <a routerLink="/admin" class="btn-ghost text-xs gap-1.5">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span class="hidden md:inline">Admin</span>
            </a>

            <!-- User Profile -->
            <div class="relative">
              <button class="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl hover:bg-dark-surface-light transition-colors duration-150" (click)="toggleProfile()">
                <div class="w-7 h-7 rounded-full bg-gradient-to-br from-accent-blue to-accent-purple flex items-center justify-center">
                  <span class="text-[11px] font-bold text-white">{{ userInitial() }}</span>
                </div>
                <svg class="w-3.5 h-3.5 text-slate-400 hidden sm:block" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              <!-- Profile Dropdown -->
              @if (profileOpen()) {
                <div class="absolute right-0 top-12 w-48 glass-panel p-1.5 animate-scale-in z-50 shadow-glass">
                  <div class="px-3 py-2 border-b border-dark-border-light/50 mb-1">
                    <p class="text-sm font-medium text-white truncate">{{ userName() }}</p>
                    <p class="text-xs text-slate-500 truncate">{{ userEmail() }}</p>
                  </div>
                  <button class="w-full text-left px-3 py-2 text-sm text-slate-400 rounded-lg hover:bg-dark-surface-hover hover:text-white transition-colors" (click)="logout()">
                    Sign out
                  </button>
                </div>
              }
            </div>
          </div>
        </header>

        <!-- ===== MAIN CONTENT ===== -->
        <main class="flex-1 overflow-y-auto p-4 lg:p-6" [class.max-w-4xl]="readMode()" [class.mx-auto]="readMode()">
          <router-outlet />
        </main>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; height: 100vh; }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
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

  // UI State
  readonly sidebarCollapsed = signal(false);
  readonly mobileDrawerOpen = signal(false);
  readonly readMode = signal(false);
  readonly profileOpen = signal(false);

  // User info
  readonly userInitial = computed(() => {
    const user = this.authService.currentUser();
    return user?.email?.charAt(0)?.toUpperCase() ?? 'U';
  });
  readonly userName = computed(() => {
    const user = this.authService.currentUser();
    return user?.email?.split('@')[0] ?? 'User';
  });
  readonly userEmail = computed(() => {
    const user = this.authService.currentUser();
    return user?.email ?? '';
  });

  // Computed sidebar classes
  readonly sidebarClasses = computed(() => {
    const collapsed = this.sidebarCollapsed();
    const mobileOpen = this.mobileDrawerOpen();
    const read = this.readMode();

    // Read mode: completely hidden
    if (read) return 'w-0 -translate-x-full lg:w-0 lg:-translate-x-full';

    // Mobile
    const mobileClass = mobileOpen
      ? 'translate-x-0 w-64'
      : '-translate-x-full w-64';

    // Desktop
    const desktopClass = collapsed
      ? 'lg:translate-x-0 lg:w-16'
      : 'lg:translate-x-0 lg:w-64';

    return `${mobileClass} ${desktopClass} bg-dark-surface border-r border-dark-border-light/30 flex flex-col`;
  });

  toggleSidebar() {
    this.sidebarCollapsed.update(v => !v);
  }

  openMobileDrawer() {
    this.mobileDrawerOpen.set(true);
  }

  closeMobileDrawer() {
    this.mobileDrawerOpen.set(false);
  }

  toggleReadMode() {
    this.readMode.update(v => !v);
  }

  toggleProfile() {
    this.profileOpen.update(v => !v);
  }

  logout() {
    this.profileOpen.set(false);
    this.authService.logout();
  }
}

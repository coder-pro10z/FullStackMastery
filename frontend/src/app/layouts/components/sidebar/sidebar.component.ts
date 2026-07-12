import { ChangeDetectionStrategy, Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { AuthService } from '../../../core/services/auth.service';

interface NavItem {
  path: string;
  label: string;
  icon: string;
  badge?: string;
}

interface NavSection {
  label: string;
  items: NavItem[];
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [NgTemplateOutlet, RouterLink, RouterLinkActive, LucideAngularModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex flex-col h-full bg-transparent w-full">

      <!-- ── Brand Header ── -->
      <div class="flex items-center gap-3 px-4 h-16 border-b border-slate-200 flex-shrink-0">
        <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-violet-600
                    flex items-center justify-center flex-shrink-0 shadow-sm">
          <svg class="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24"
               stroke="currentColor" stroke-width="2.5">
            <path stroke-linecap="round" stroke-linejoin="round"
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21
                     12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0
                     117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2
                     2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        </div>
        @if (!collapsed) {
          <div class="overflow-hidden animate-fade-in">
            <p class="text-sm font-bold text-slate-800 leading-none">EduDash Pro</p>
            <p class="text-xs text-slate-400 mt-1 leading-none">Master your next interview</p>
          </div>
        }
      </div>

      <!-- ── Navigation ── -->
      <nav class="flex-1 overflow-y-auto py-4 px-3 scrollbar-premium">

        <!-- ════ PREPARATION section ════ -->
        @if (!collapsed) {
          <span class="block px-2 mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            Preparation
          </span>
        }
        <div class="space-y-0.5 mb-2">
          @for (item of prepItems; track item.path) {
            <ng-container *ngTemplateOutlet="navLink; context: { item: item }" />
          }
        </div>

        <!-- ════ TOOLS section ════ -->
        @if (!collapsed) {
          <span class="block px-2 mb-1.5 mt-3 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            Tools
          </span>
        } @else {
          <div class="border-t border-slate-100 my-2 mx-1"></div>
        }
        <div class="space-y-0.5 mb-2">
          @for (item of toolItems; track item.path) {
            <ng-container *ngTemplateOutlet="navLink; context: { item: item }" />
          }
        </div>

        <!-- ════ ADMIN section — visible only to admin users ════ -->
        @if (isAdmin()) {
          <div class="animate-fade-in">

            <!-- Section separator + label -->
            <div class="border-t border-violet-100 mt-3 mb-2 mx-1"></div>
            @if (!collapsed) {
              <div class="flex items-center gap-2 px-2 mb-1.5">
                <div class="w-4 h-4 rounded bg-gradient-to-br from-violet-600 to-pink-600
                            flex items-center justify-center flex-shrink-0">
                  <lucide-icon name="shield-check" [size]="10" class="text-white" />
                </div>
                <span class="text-[10px] font-semibold uppercase tracking-wider text-violet-500">
                  Admin
                </span>
              </div>

              <!-- Management sub-label -->
              <span class="block px-2 mb-1 mt-2 text-[10px] font-medium uppercase tracking-wider text-slate-400 pl-6">
                Management
              </span>
            } @else {
              <div class="flex justify-center mb-1">
                <lucide-icon name="shield-check" [size]="13" class="text-violet-400" />
              </div>
            }

            <!-- Admin management links -->
            <div class="space-y-0.5 mb-1">
              @for (item of adminManagementItems; track item.path) {
                <ng-container *ngTemplateOutlet="adminLink; context: { item: item }" />
              }
            </div>

            <!-- Resources sub-label -->
            @if (!collapsed) {
              <span class="block px-2 mb-1 mt-2 text-[10px] font-medium uppercase tracking-wider text-slate-400 pl-6">
                Resources
              </span>
            }
            <div class="space-y-0.5">
              @for (item of adminResourceItems; track item.path) {
                <ng-container *ngTemplateOutlet="adminLink; context: { item: item }" />
              }
            </div>

          </div>
        }
      </nav>

      <!-- ── Collapse Toggle ── -->
      <div class="border-t border-slate-200 p-2 flex-shrink-0">
        <button
          class="flex items-center gap-2 w-full px-3 py-2 text-sm font-medium
                 text-slate-500 rounded-lg hover:bg-slate-100 hover:text-slate-800
                 transition-all duration-300 ease-out hover:-translate-y-0.5 hover:shadow-sm"
          [class.justify-center]="collapsed"
          [class.justify-start]="!collapsed"
          (click)="onToggleCollapse()"
          [title]="collapsed ? 'Expand sidebar' : 'Collapse sidebar'"
        >
          <lucide-icon
            name="chevron-left"
            [size]="18"
            class="flex-shrink-0 transition-transform duration-300"
            [class.rotate-180]="collapsed"
          />
          @if (!collapsed) {
            <span class="animate-fade-in text-xs">Collapse</span>
          }
        </button>
      </div>
    </div>

    <!-- ── Link template: student nav items (blue active) ── -->
    <ng-template #navLink let-item="item">
      <a
        [routerLink]="item.path"
        routerLinkActive="bg-blue-50 text-blue-700 font-semibold border-l-[3px] border-blue-700"
        [routerLinkActiveOptions]="{ exact: false }"
        class="group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
               text-slate-500 hover:text-slate-800 hover:bg-slate-100
               border-l-[3px] border-transparent
               hover:-translate-y-0.5 hover:shadow-sm transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]"
        [title]="item.label"
      >
        <lucide-icon [name]="item.icon" [size]="18" class="flex-shrink-0" />
        @if (!collapsed) {
          <span class="truncate animate-fade-in flex-1">{{ item.label }}</span>
          @if (item.badge) {
            <span class="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-700
                         ml-auto animate-fade-in uppercase tracking-wider">
              {{ item.badge }}
            </span>
          }
        }
      </a>
    </ng-template>

    <!-- ── Link template: admin nav items (violet active) ── -->
    <ng-template #adminLink let-item="item">
      <a
        [routerLink]="item.path"
        routerLinkActive="bg-violet-50 text-violet-700 font-semibold border-l-[3px] border-violet-600"
        [routerLinkActiveOptions]="{ exact: false }"
        class="group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
               text-slate-500 hover:text-slate-800 hover:bg-violet-50
               border-l-[3px] border-transparent
               hover:-translate-y-0.5 hover:shadow-sm transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]"
        [title]="item.label"
      >
        <lucide-icon [name]="item.icon" [size]="18" class="flex-shrink-0 text-violet-400" />
        @if (!collapsed) {
          <span class="truncate animate-fade-in flex-1">{{ item.label }}</span>
          @if (item.badge) {
            <span class="px-1.5 py-0.5 rounded text-[10px] font-bold bg-violet-100 text-violet-700
                         ml-auto animate-fade-in uppercase tracking-wider">
              {{ item.badge }}
            </span>
          }
        }
      </a>
    </ng-template>
  `,
  styles: [`
    :host { display: block; height: 100%; }
  `]
})
export class SidebarComponent {
  @Input() collapsed = false;
  @Output() toggleCollapse = new EventEmitter<void>();

  private readonly authService = inject(AuthService);

  /** Signal — true when the logged-in user has the 'admin' role */
  readonly isAdmin = this.authService.isAdmin;

  // ── Student nav items ─────────────────────────────────────────────────
  readonly prepItems: NavItem[] = [
    { path: '/dashboard',        label: 'Dashboard',        icon: 'layout-dashboard' },
    { path: '/learning-lab',     label: 'Learning Lab',     icon: 'book-open' },
    { path: '/question-bank',    label: 'Question Bank',    icon: 'database' },
    { path: '/skill-tree',       label: 'Skill Tree',       icon: 'git-branch' },
    { path: '/interview-canvas', label: 'Interview Canvas', icon: 'monitor' },
    { path: '/quiz',             label: 'Assessment Quiz',  icon: 'list-checks', badge: 'New' },
  ];

  readonly toolItems: NavItem[] = [
    { path: '/job-description', label: 'Job Description', icon: 'file-text' },
  ];

  // ── Admin nav items (only rendered when isAdmin() === true) ───────────
  readonly adminManagementItems: NavItem[] = [
    { path: '/admin/dashboard', label: 'Dashboard',        icon: 'layout-dashboard' },
    { path: '/admin/import',    label: 'Import Questions', icon: 'upload' },
    { path: '/admin/question-bank', label: 'Question Bank', icon: 'database' },
  ];

  readonly adminResourceItems: NavItem[] = [
    { path: '/admin/docs', label: 'Docs', icon: 'book-open' },
  ];

  onToggleCollapse(): void {
    this.toggleCollapse.emit();
  }
}

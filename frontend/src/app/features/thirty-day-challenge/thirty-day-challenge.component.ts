import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { ChallengeService } from '../../core/services/challenge.service';
import { AuthService } from '../../core/services/auth.service';
import {
  ChallengeDayModel,
  ChallengeSummaryModel,
  CompetencyModel,
} from '../../core/models/challenge.models';
import { ChallengeOverviewComponent } from './components/challenge-overview/challenge-overview.component';
import { ChallengeDayCardComponent } from './components/challenge-day-card/challenge-day-card.component';
import { CompetencyIndexComponent } from './components/competency-index/competency-index.component';
import { AnswerSheetDrawerComponent } from '../../shared/components/answer-sheet/answer-sheet-drawer.component';

import { OverviewSkeletonComponent } from './components/skeletons/overview-skeleton.component';
import { DayCardSkeletonComponent } from './components/skeletons/day-card-skeleton.component';
import { CompetencyIndexSkeletonComponent } from './components/skeletons/index-skeleton.component';

type ActiveTab = 'tracker' | 'index';

@Component({
  selector: 'app-thirty-day-challenge',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule,
    LucideAngularModule,
    ChallengeOverviewComponent,
    ChallengeDayCardComponent,
    CompetencyIndexComponent,
    AnswerSheetDrawerComponent,
    OverviewSkeletonComponent,
    DayCardSkeletonComponent,
    CompetencyIndexSkeletonComponent,
  ],
  template: `
    <!-- ── Page Header ───────────────────────────────────────────────────── -->
    <div class="mb-8">

      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <div class="flex items-center gap-3 mb-1.5">
            <div class="w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl
                        flex items-center justify-center shadow-md shadow-orange-100">
              <lucide-icon name="flame" [size]="20" class="text-white" />
            </div>
            <div>
              <h1 class="text-2xl font-bold text-slate-900 leading-tight whitespace-nowrap">30-Day Challenge</h1>
              <p class="text-xs text-slate-400 font-medium">Permanent Competency Index</p>
            </div>
          </div>
          <p class="text-sm text-slate-500 max-w-xl">
            Master all <span class="font-semibold text-slate-700">75 competencies</span> across
            C# Core, ASP.NET Core, SQL Theory, SQL Coding, and Angular.
            Every resource in this platform is linked to these IDs.
          </p>
        </div>

        <!-- Progress pill -->
        @if (summary(); as s) {
          <div class="flex items-center gap-3 bg-gradient-to-r from-orange-50 to-amber-50
                      border border-orange-200 rounded-2xl px-4 py-3 flex-shrink-0 shadow-sm">
            <lucide-icon name="flame" [size]="22" class="text-orange-500" />
            <div>
              <p class="text-xl font-bold text-slate-900 leading-none">Day {{ s.currentStreak > 0 ? s.currentStreak : 1 }}</p>
              <p class="text-[10px] text-orange-600 font-semibold uppercase tracking-wider mt-0.5">Current Progress</p>
            </div>
            @if (s.longestStreak > 0) {
              <div class="ml-3 pl-3 border-l border-orange-200">
                <p class="text-sm font-bold text-slate-700 leading-none">Day {{ s.longestStreak }}</p>
                <p class="text-[10px] text-slate-400 font-medium mt-0.5">best</p>
              </div>
            }
          </div>
        } @else if (isUnauthenticated()) {
          <button
            (click)="openLoginModal()"
            class="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs px-4 py-2.5 rounded-2xl shadow-sm transition-all active:scale-95 flex-shrink-0"
          >
            <lucide-icon name="log-in" [size]="16" />
            Sign In to Unlock Streak
          </button>
        }
      </div>

      <!-- Tab Bar -->
      <div class="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit">
        @for (tab of tabs; track tab.id) {
          <button
            class="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
            [class.bg-white]="activeTab() === tab.id"
            [class.text-slate-900]="activeTab() === tab.id"
            [class.shadow-sm]="activeTab() === tab.id"
            [class.text-slate-500]="activeTab() !== tab.id"
            [class.hover:text-slate-700]="activeTab() !== tab.id"
            (click)="setTab(tab.id)"
            [id]="'tab-' + tab.id"
          >
            <lucide-icon [name]="tab.icon" [size]="15" />
            {{ tab.label }}
            @if (tab.id === 'tracker' && summary(); as s) {
              <span class="ml-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-700">
                {{ s.completedDays }}/30
              </span>
            }
          </button>
        }
      </div>
    </div>

    <!-- ── Guest / Unauthenticated banner ───────────────────────────── -->
    @if (isUnauthenticated() && !loading()) {
      <div class="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-amber-50 border border-amber-200 rounded-2xl p-4 text-amber-900">
        <div class="flex items-center gap-3">
          <lucide-icon name="lock" [size]="20" class="text-amber-600 flex-shrink-0" />
          <p class="text-sm">
            <span class="font-semibold">Guest Mode:</span> You are viewing the Permanent Competency Index. Sign in to track your 30-day streak and daily progress!
          </p>
        </div>
        <button
          (click)="openLoginModal()"
          class="flex items-center justify-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs rounded-xl shadow-sm transition-colors flex-shrink-0 cursor-pointer"
        >
          <lucide-icon name="log-in" [size]="14" />
          Sign In Now
        </button>
      </div>
    }

    <!-- ── Interactive Login Modal Dialog ────────────────────────────── -->
    @if (showLoginModal()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
        <div class="bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-md w-full p-6 relative overflow-hidden">
          
          <!-- Close button -->
          <button 
            (click)="closeLoginModal()"
            class="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 transition-colors"
          >
            <lucide-icon name="x" [size]="18" />
          </button>

          <!-- Header -->
          <div class="flex items-center gap-3 mb-4">
            <div class="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
              <lucide-icon name="log-in" [size]="22" />
            </div>
            <div>
              <h3 class="text-lg font-bold text-slate-900">Sign In Required</h3>
              <p class="text-xs text-slate-500">Access your 30-Day Challenge tracker & streak</p>
            </div>
          </div>

          <!-- Error Alert -->
          @if (loginError()) {
            <div class="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 flex items-center gap-2">
              <lucide-icon name="alert-circle" [size]="16" class="flex-shrink-0" />
              <span>{{ loginError() }}</span>
            </div>
          }

          <!-- Form -->
          <form (submit)="$event.preventDefault(); onLoginSubmit()" class="space-y-4">
            <div>
              <label class="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">Email Address</label>
              <input
                type="email"
                [value]="loginEmail()"
                (input)="loginEmail.set($any($event.target).value)"
                placeholder="user@example.com"
                required
                class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-900"
              />
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">Password</label>
              <input
                type="password"
                [value]="loginPassword()"
                (input)="loginPassword.set($any($event.target).value)"
                placeholder="••••••••"
                required
                class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-900"
              />
            </div>

            <div class="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                (click)="closeLoginModal()"
                class="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                [disabled]="loginLoading()"
                class="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium text-xs rounded-xl shadow-md shadow-blue-500/20 transition-all active:scale-95 disabled:opacity-50"
              >
                @if (loginLoading()) {
                  <div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                } @else {
                  <lucide-icon name="log-in" [size]="14" />
                }
                Sign In
              </button>
            </div>
          </form>
        </div>
      </div>
    }

    <!-- ── Structural Skeleton Loading State (Zero-CLS Placeholders) ──────────── -->
    @if (loading()) {
      @if (activeTab() === 'tracker') {
        <div class="space-y-8">
          <app-overview-skeleton />
          <div class="space-y-3">
            <div class="h-4 bg-slate-200/80 rounded w-36 mb-2 animate-pulse"></div>
            @for (sk of [1, 2, 3, 4, 5]; track sk) {
              <app-day-card-skeleton />
            }
          </div>
        </div>
      } @else {
        <app-index-skeleton />
      }
    }

    <!-- ── Error state ───────────────────────────────────────────────────── -->
    @if (error() && !loading()) {
      <div class="flex items-center gap-3 bg-red-50 border border-red-200 rounded-2xl p-5 text-red-700">
        <lucide-icon name="alert-circle" [size]="20" class="flex-shrink-0" />
        <div>
          <p class="font-semibold">Failed to load challenge data</p>
          <p class="text-sm text-red-500">{{ error() }}</p>
        </div>
        <button class="ml-auto text-xs underline hover:no-underline" (click)="reload()">Retry</button>
      </div>
    }

    <!-- ── Tab: Tracker & Overview (Combined) ────────────────────────────── -->
    @if (activeTab() === 'tracker' && !loading()) {
      <div class="space-y-8">
        <!-- Overview summary statistics -->
        @if (summary()) {
          <app-challenge-overview [summary]="summary()!" />
        }

        <!-- 30-Day Day-by-Day Curriculum -->
        <div class="space-y-4 pt-2">
          <div class="flex items-center justify-between px-1 mb-3">
            <h3 class="text-sm font-bold text-slate-800 uppercase tracking-wider">30-Day Curriculum</h3>
            @if (summary(); as s) {
              <span class="text-xs text-slate-400 font-medium">{{ s.completedDays }} of {{ s.totalDays }} Days Completed</span>
            }
          </div>

          <div class="space-y-4">
            @for (day of days(); track day.dayNumber) {
              <app-challenge-day-card
                [day]="day"
                (toggleComplete)="onToggleComplete($event)"
              />
            }
          </div>
          @if (days().length === 0 && !error()) {
            <div class="text-center text-slate-400 py-12 text-sm flex flex-col items-center gap-3">
              <p>Sign in to view and track your 30-day curriculum.</p>
              <button (click)="openLoginModal()" class="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800">
                Sign In Now
              </button>
            </div>
          }
        </div>
      </div>
    }

    <!-- ── Tab: Competency Index ─────────────────────────────────────────── -->
    @if (activeTab() === 'index' && !loading()) {
      <app-competency-index [competencies]="competencies()" />
    }
  `,
})
export class ThirtyDayChallengeComponent implements OnInit {
  private readonly svc = inject(ChallengeService);
  private readonly authSvc = inject(AuthService);

  readonly activeTab = signal<ActiveTab>('tracker');
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly isUnauthenticated = signal(false);

  // Login Modal State
  readonly showLoginModal = signal(false);
  readonly loginEmail = signal('');
  readonly loginPassword = signal('');
  readonly loginLoading = signal(false);
  readonly loginError = signal<string | null>(null);

  readonly days = signal<ChallengeDayModel[]>([]);
  readonly summary = signal<ChallengeSummaryModel | null>(null);
  readonly competencies = signal<CompetencyModel[]>([]);

  readonly tabs: { id: ActiveTab; label: string; icon: string }[] = [
    { id: 'tracker',   label: 'Overview & Tracker', icon: 'calendar-days' },
    { id: 'index',     label: 'Competency Index',   icon: 'brain-circuit' },
  ];

  ngOnInit(): void {
    this.reload();
  }

  reload(): void {
    this.loading.set(true);
    this.error.set(null);
    this.isUnauthenticated.set(false);

    // Load summary + days + competencies in parallel
    let pending = 3;
    const done = () => { if (--pending === 0) this.loading.set(false); };

    this.svc.getSummary().subscribe({
      next: s => { this.summary.set(s); done(); },
      error: e => {
        if (e?.status === 401) {
          this.isUnauthenticated.set(true);
        } else {
          this.error.set(e?.error?.title ?? 'Failed to load challenge summary');
        }
        done();
      },
    });

    this.svc.getAllDays().subscribe({
      next: d => { this.days.set(d); done(); },
      error: e => {
        if (e?.status === 401) {
          this.isUnauthenticated.set(true);
        }
        done();
      },
    });

    this.svc.getAllCompetencies().subscribe({
      next: c => { this.competencies.set(c); done(); },
      error: () => done(),
    });
  }

  setTab(tab: ActiveTab): void {
    this.activeTab.set(tab);
  }

  openLoginModal(): void {
    this.loginError.set(null);
    this.showLoginModal.set(true);
  }

  closeLoginModal(): void {
    this.showLoginModal.set(false);
  }

  onLoginSubmit(): void {
    if (!this.loginEmail() || !this.loginPassword()) {
      this.loginError.set('Please enter both email and password.');
      return;
    }

    this.loginLoading.set(true);
    this.loginError.set(null);

    this.authSvc.login({ email: this.loginEmail(), password: this.loginPassword() }).subscribe({
      next: () => {
        this.loginLoading.set(false);
        this.showLoginModal.set(false);
        this.reload();
      },
      error: err => {
        this.loginLoading.set(false);
        this.loginError.set(err?.error?.message ?? err?.error?.title ?? 'Invalid email or password. Please try again.');
      },
    });
  }

  onToggleComplete(event: { dayNumber: number; newState: boolean }): void {
    if (this.isUnauthenticated()) {
      this.openLoginModal();
      return;
    }

    const { dayNumber, newState } = event;

    const action = newState
      ? this.svc.markDayComplete(dayNumber)
      : this.svc.markDayIncomplete(dayNumber);

    // Optimistic update
    this.days.update(days =>
      days.map(d =>
        d.dayNumber === dayNumber
          ? { ...d, isCompleted: newState, completedAt: newState ? new Date().toISOString() : null }
          : d
      )
    );

    action.subscribe({
      next: () => {
        // Refresh summary to update streak
        this.svc.getSummary().subscribe({ next: s => this.summary.set(s) });
      },
      error: () => {
        // Rollback optimistic update on failure
        this.days.update(days =>
          days.map(d => d.dayNumber === dayNumber ? { ...d, isCompleted: !newState } : d)
        );
      },
    });
  }
}

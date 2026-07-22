import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';
import { ChallengeService } from '../../core/services/challenge.service';
import {
  ChallengeDayModel,
  ChallengeSummaryModel,
  CompetencyModel,
} from '../../core/models/challenge.models';
import { ChallengeOverviewComponent } from './components/challenge-overview/challenge-overview.component';
import { ChallengeDayCardComponent } from './components/challenge-day-card/challenge-day-card.component';
import { CompetencyIndexComponent } from './components/competency-index/competency-index.component';

type ActiveTab = 'overview' | 'tracker' | 'index';

@Component({
  selector: 'app-thirty-day-challenge',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    LucideAngularModule,
    ChallengeOverviewComponent,
    ChallengeDayCardComponent,
    CompetencyIndexComponent,
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
              <h1 class="text-2xl font-bold text-slate-900 leading-tight">30-Day Challenge</h1>
              <p class="text-xs text-slate-400 font-medium">Permanent Competency Index</p>
            </div>
          </div>
          <p class="text-sm text-slate-500 max-w-xl">
            Master all <span class="font-semibold text-slate-700">75 competencies</span> across
            C# Core, ASP.NET Core, SQL Theory, SQL Coding, and Angular.
            Every resource in this platform is linked to these IDs.
          </p>
        </div>

        <!-- Streak pill -->
        @if (summary(); as s) {
          <div class="flex items-center gap-2 bg-gradient-to-r from-orange-50 to-amber-50
                      border border-orange-200 rounded-2xl px-4 py-3 flex-shrink-0">
            <lucide-icon name="flame" [size]="22" class="text-orange-500" />
            <div>
              <p class="text-2xl font-bold text-slate-900 leading-none">{{ s.currentStreak }}</p>
              <p class="text-[10px] text-orange-600 font-semibold uppercase tracking-wider">day streak</p>
            </div>
            @if (s.longestStreak > 0) {
              <div class="ml-3 pl-3 border-l border-orange-200">
                <p class="text-sm font-bold text-slate-700 leading-none">{{ s.longestStreak }}</p>
                <p class="text-[10px] text-slate-400 font-medium">best</p>
              </div>
            }
          </div>
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

    <!-- ── Loading state ─────────────────────────────────────────────────── -->
    @if (loading()) {
      <div class="flex items-center justify-center py-24">
        <div class="flex flex-col items-center gap-4">
          <div class="w-10 h-10 border-[3px] border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p class="text-sm text-slate-400 animate-pulse">Loading challenge data…</p>
        </div>
      </div>
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

    <!-- ── Tab: Overview ─────────────────────────────────────────────────── -->
    @if (activeTab() === 'overview' && summary() && !loading()) {
      <app-challenge-overview [summary]="summary()!" />
    }

    <!-- ── Tab: Day Tracker ──────────────────────────────────────────────── -->
    @if (activeTab() === 'tracker' && !loading()) {
      <div class="space-y-3">
        @for (day of days(); track day.dayNumber) {
          <app-challenge-day-card
            [day]="day"
            (toggleComplete)="onToggleComplete($event)"
          />
        }
        @if (days().length === 0 && !error()) {
          <p class="text-center text-slate-400 py-12 text-sm">No days loaded yet.</p>
        }
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

  readonly activeTab = signal<ActiveTab>('overview');
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  readonly days = signal<ChallengeDayModel[]>([]);
  readonly summary = signal<ChallengeSummaryModel | null>(null);
  readonly competencies = signal<CompetencyModel[]>([]);

  readonly tabs: { id: ActiveTab; label: string; icon: string }[] = [
    { id: 'overview',  label: 'Overview',          icon: 'layout-dashboard' },
    { id: 'tracker',   label: 'Day Tracker',        icon: 'calendar-days'    },
    { id: 'index',     label: 'Competency Index',   icon: 'brain-circuit'    },
  ];

  ngOnInit(): void {
    this.reload();
  }

  reload(): void {
    this.loading.set(true);
    this.error.set(null);

    // Load summary + days + competencies in parallel
    let pending = 3;
    const done = () => { if (--pending === 0) this.loading.set(false); };

    this.svc.getSummary().subscribe({
      next: s => { this.summary.set(s); done(); },
      error: e => { this.error.set(e?.error?.title ?? 'Unknown error'); done(); },
    });

    this.svc.getAllDays().subscribe({
      next: d => { this.days.set(d); done(); },
      error: () => done(),
    });

    this.svc.getAllCompetencies().subscribe({
      next: c => { this.competencies.set(c); done(); },
      error: () => done(),
    });
  }

  setTab(tab: ActiveTab): void {
    this.activeTab.set(tab);
  }

  onToggleComplete(event: { dayNumber: number; newState: boolean }): void {
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

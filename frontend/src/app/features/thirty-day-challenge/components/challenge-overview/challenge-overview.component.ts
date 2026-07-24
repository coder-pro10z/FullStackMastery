import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';
import { ChallengeSummaryModel } from '../../../../core/models/challenge.models';

@Component({
  selector: 'app-challenge-overview',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LucideAngularModule],
  template: `
    <div class="space-y-6">

      <!-- Hero stats row -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">

        <!-- Progress ring card -->
        <div class="col-span-2 lg:col-span-1 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm
                    flex flex-col items-center justify-center gap-3 hover:shadow-md transition-shadow duration-300">
          <!-- SVG Ring -->
          <div class="relative w-24 h-24">
            <svg class="w-full h-full -rotate-90" viewBox="0 0 96 96">
              <!-- Track -->
              <circle cx="48" cy="48" r="40" fill="none" stroke="#E2E8F0" stroke-width="8" />
              <!-- Progress -->
              <circle
                cx="48" cy="48" r="40"
                fill="none"
                stroke="url(#progress-gradient)"
                stroke-width="8"
                stroke-linecap="round"
                [attr.stroke-dasharray]="circumference"
                [attr.stroke-dashoffset]="dashOffset"
                style="transition: stroke-dashoffset 1s ease-out"
              />
              <defs>
                <linearGradient id="progress-gradient" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stop-color="#1A73E8" />
                  <stop offset="100%" stop-color="#7C3AED" />
                </linearGradient>
              </defs>
            </svg>
            <div class="absolute inset-0 flex flex-col items-center justify-center">
              <span class="text-xl font-bold text-slate-900">{{ summary.completedDays }}</span>
              <span class="text-[10px] text-slate-400 font-medium">/ {{ summary.totalDays }}</span>
            </div>
          </div>
          <div class="text-center">
            <p class="text-sm font-semibold text-slate-700">Progress</p>
            <p class="text-xs text-slate-400">{{ summary.completionPercentage }}% complete</p>
          </div>
        </div>

        <!-- Current Progress Card -->
        <div class="bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-100 rounded-2xl p-5 shadow-sm
                    hover:shadow-md transition-all duration-300 hover:-translate-y-0.5">
          <div class="flex items-center justify-between mb-3">
            <span class="text-xs font-semibold uppercase tracking-wider text-orange-600">Current Progress</span>
            <div class="w-8 h-8 bg-orange-500 rounded-xl flex items-center justify-center shadow-sm">
              <lucide-icon name="flame" [size]="16" class="text-white" />
            </div>
          </div>
          <p class="text-2xl font-bold text-slate-900">Day {{ summary.currentStreak > 0 ? summary.currentStreak : 1 }}</p>
          <p class="text-xs text-slate-500 mt-1">active learning focus</p>
        </div>

        <!-- Longest Progress Card -->
        <div class="bg-gradient-to-br from-violet-50 to-purple-50 border border-violet-100 rounded-2xl p-5 shadow-sm
                    hover:shadow-md transition-all duration-300 hover:-translate-y-0.5">
          <div class="flex items-center justify-between mb-3">
            <span class="text-xs font-semibold uppercase tracking-wider text-violet-600">Personal Best</span>
            <div class="w-8 h-8 bg-violet-500 rounded-xl flex items-center justify-center shadow-sm">
              <lucide-icon name="trophy" [size]="16" class="text-white" />
            </div>
          </div>
          <p class="text-2xl font-bold text-slate-900">Day {{ summary.longestStreak > 0 ? summary.longestStreak : 1 }}</p>
          <p class="text-xs text-slate-500 mt-1">highest day reached</p>
        </div>

        <!-- Total Competencies -->
        <div class="bg-gradient-to-br from-blue-50 to-sky-50 border border-blue-100 rounded-2xl p-5 shadow-sm
                    hover:shadow-md transition-all duration-300 hover:-translate-y-0.5">
          <div class="flex items-center justify-between mb-3">
            <span class="text-xs font-semibold uppercase tracking-wider text-blue-600">Competencies</span>
            <div class="w-8 h-8 bg-blue-500 rounded-xl flex items-center justify-center shadow-sm">
              <lucide-icon name="brain-circuit" [size]="16" class="text-white" />
            </div>
          </div>
          <p class="text-3xl font-bold text-slate-900">{{ summary.totalCompetencies }}</p>
          <p class="text-xs text-slate-500 mt-1">permanent index IDs</p>
        </div>

      </div>

      <!-- Progress bar with day markers -->
      <div class="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
        <div class="flex items-center justify-between mb-3">
          <p class="text-sm font-semibold text-slate-700">30-Day Journey</p>
          <p class="text-xs text-slate-400">{{ summary.completedDays }} of {{ summary.totalDays }} days</p>
        </div>
        <div class="relative h-3 bg-slate-100 rounded-full overflow-hidden">
          <div
            class="absolute left-0 top-0 h-full bg-gradient-to-r from-blue-500 to-violet-500 rounded-full transition-all duration-1000 ease-out"
            [style.width.%]="summary.completionPercentage"
          ></div>
        </div>
        <!-- Day tick marks -->
        <div class="flex justify-between mt-2 px-0.5">
          <span class="text-[10px] text-slate-400">Day 1</span>
          <span class="text-[10px] text-slate-400">Day 10</span>
          <span class="text-[10px] text-slate-400">Day 20</span>
          <span class="text-[10px] text-slate-400">Day 30</span>
        </div>
      </div>

    </div>
  `,
})
export class ChallengeOverviewComponent {
  @Input({ required: true }) summary!: ChallengeSummaryModel;

  readonly circumference = 2 * Math.PI * 40; // r = 40

  get dashOffset(): number {
    const progress = this.summary.completionPercentage / 100;
    return this.circumference * (1 - progress);
  }
}

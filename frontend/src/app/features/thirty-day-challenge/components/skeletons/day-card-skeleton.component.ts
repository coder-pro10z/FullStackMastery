import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-day-card-skeleton',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="bg-white border border-slate-200/80 rounded-2xl p-4 pl-6 flex items-center gap-4 shadow-sm animate-pulse">
      <!-- Day Number Box Skeleton -->
      <div class="w-11 h-11 rounded-xl bg-slate-200/80 flex-shrink-0"></div>

      <!-- Title & Focus Skeleton -->
      <div class="flex-1 min-w-0 space-y-2">
        <div class="flex items-center gap-2">
          <div class="h-3 bg-slate-200/80 rounded w-16"></div>
          <div class="h-3.5 bg-slate-100 rounded-full w-14"></div>
        </div>
        <div class="h-4 bg-slate-200/80 rounded w-3/4"></div>
      </div>

      <!-- Badges Skeleton -->
      <div class="hidden sm:flex items-center gap-1.5 flex-shrink-0">
        <div class="h-5 w-14 bg-slate-200/60 rounded-full"></div>
        <div class="h-5 w-14 bg-slate-200/60 rounded-full"></div>
        <div class="h-5 w-14 bg-slate-200/60 rounded-full"></div>
      </div>

      <!-- Complete Button Skeleton -->
      <div class="w-9 h-9 rounded-xl bg-slate-200/80 flex-shrink-0"></div>
    </div>
  `
})
export class DayCardSkeletonComponent {}

import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-overview-skeleton',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-6 animate-pulse">

      <!-- Hero stats row -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">

        <!-- Progress ring card skeleton -->
        <div class="col-span-2 lg:col-span-1 bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm
                    flex flex-col items-center justify-center gap-3">
          <div class="w-24 h-24 rounded-full bg-slate-100 border-4 border-slate-200/60 flex items-center justify-center">
            <div class="w-10 h-6 bg-slate-200/80 rounded"></div>
          </div>
          <div class="text-center space-y-1.5 w-full flex flex-col items-center">
            <div class="h-4 bg-slate-200/80 rounded w-20"></div>
            <div class="h-3 bg-slate-100 rounded w-28"></div>
          </div>
        </div>

        <!-- Current Streak Card Skeleton -->
        <div class="bg-slate-50/80 border border-slate-200/70 rounded-2xl p-5 shadow-sm">
          <div class="flex items-center justify-between mb-4">
            <div class="h-3 bg-slate-200/80 rounded w-24"></div>
            <div class="w-8 h-8 bg-slate-200/80 rounded-xl"></div>
          </div>
          <div class="h-8 bg-slate-200/80 rounded w-16 mb-2"></div>
          <div class="h-3 bg-slate-100 rounded w-28"></div>
        </div>

        <!-- Longest Streak Card Skeleton -->
        <div class="bg-slate-50/80 border border-slate-200/70 rounded-2xl p-5 shadow-sm">
          <div class="flex items-center justify-between mb-4">
            <div class="h-3 bg-slate-200/80 rounded w-20"></div>
            <div class="w-8 h-8 bg-slate-200/80 rounded-xl"></div>
          </div>
          <div class="h-8 bg-slate-200/80 rounded w-16 mb-2"></div>
          <div class="h-3 bg-slate-100 rounded w-32"></div>
        </div>

        <!-- Total Competencies Card Skeleton -->
        <div class="bg-slate-50/80 border border-slate-200/70 rounded-2xl p-5 shadow-sm">
          <div class="flex items-center justify-between mb-4">
            <div class="h-3 bg-slate-200/80 rounded w-24"></div>
            <div class="w-8 h-8 bg-slate-200/80 rounded-xl"></div>
          </div>
          <div class="h-8 bg-slate-200/80 rounded w-16 mb-2"></div>
          <div class="h-3 bg-slate-100 rounded w-32"></div>
        </div>

      </div>

      <!-- Progress bar with day markers skeleton -->
      <div class="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-3">
        <div class="flex items-center justify-between">
          <div class="h-4 bg-slate-200/80 rounded w-32"></div>
          <div class="h-3 bg-slate-100 rounded w-24"></div>
        </div>
        <div class="h-3 bg-slate-100 rounded-full w-full overflow-hidden">
          <div class="h-full bg-slate-200/80 rounded-full w-1/3"></div>
        </div>
      </div>

    </div>
  `
})
export class OverviewSkeletonComponent {}

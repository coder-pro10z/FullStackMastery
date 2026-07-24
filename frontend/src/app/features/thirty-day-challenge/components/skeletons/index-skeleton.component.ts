import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-index-skeleton',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-6 animate-pulse">
      <!-- 2 Group Skeletons -->
      @for (group of [1, 2]; track group) {
        <div class="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-sm">
          <!-- Category Header Skeleton -->
          <div class="px-5 py-3.5 border-b border-slate-100 bg-slate-50 flex items-center gap-3">
            <div class="w-2 h-8 rounded-full bg-slate-300"></div>
            <div class="space-y-1">
              <div class="h-4 bg-slate-300 rounded w-32"></div>
              <div class="h-3 bg-slate-200 rounded w-20"></div>
            </div>
          </div>

          <!-- Table Rows Skeleton -->
          <div class="divide-y divide-slate-100">
            @for (row of [1, 2, 3, 4]; track row) {
              <div class="flex items-center gap-3 px-5 py-3.5">
                <div class="h-5 w-12 bg-slate-200 rounded-full flex-shrink-0"></div>
                <div class="h-4 bg-slate-200 rounded flex-1"></div>
                <div class="h-3 w-8 bg-slate-100 rounded flex-shrink-0"></div>
              </div>
            }
          </div>
        </div>
      }
    </div>
  `
})
export class CompetencyIndexSkeletonComponent {}

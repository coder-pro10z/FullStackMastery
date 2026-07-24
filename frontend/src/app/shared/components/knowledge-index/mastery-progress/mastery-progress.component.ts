import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';
import { IndexNode, IndexStats } from '../../../../core/models/knowledge-index.models';

@Component({
  selector: 'app-mastery-progress',
  standalone: true,
  imports: [LucideAngularModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [`:host { display: block; }`],
  template: `
    @if (stats()) {
      <div class="flex flex-col gap-3">
        <!-- Stats Row -->
        <div class="flex items-center gap-4 p-3.5 bg-gradient-to-r from-blue-50 to-violet-50 rounded-xl border border-blue-100">
          <!-- Progress Bar Block -->
          <div class="flex-1 min-w-0">
            <div class="flex items-center justify-between mb-1.5">
              <span class="text-xs font-semibold text-[#202124]">Overall Mastery</span>
              <span class="text-xs font-bold text-blue-600">{{ stats()!.masteryPct }}%</span>
            </div>
            <div class="h-2 bg-blue-100 rounded-full overflow-hidden">
              <div
                class="h-full bg-gradient-to-r from-blue-500 to-violet-500 rounded-full transition-all duration-700 ease-out"
                [style.width.%]="stats()!.masteryPct"
              ></div>
            </div>
          </div>

          <!-- Stat Chips -->
          <div class="flex items-center gap-3 flex-shrink-0">
            <div class="text-center">
              <p class="text-sm font-bold text-[#202124]">{{ stats()!.solvedQuestions }}<span class="text-slate-400 font-normal">/{{ stats()!.totalQuestions }}</span></p>
              <p class="text-[10px] text-[#5F6368] uppercase tracking-wide">Solved</p>
            </div>
            <div class="w-px h-8 bg-blue-200"></div>
            <div class="text-center">
              <p class="text-sm font-bold text-[#202124]">{{ stats()!.totalCategories }}</p>
              <p class="text-[10px] text-[#5F6368] uppercase tracking-wide">Topics</p>
            </div>
            @if (stats()!.bookmarkedCount > 0) {
              <div class="w-px h-8 bg-blue-200"></div>
              <div class="text-center">
                <p class="text-sm font-bold text-amber-500">{{ stats()!.bookmarkedCount }}</p>
                <p class="text-[10px] text-[#5F6368] uppercase tracking-wide">Saved</p>
              </div>
            }
          </div>
        </div>

        <!-- Recently Viewed -->
        @if (recentItems().length > 0) {
          <div class="flex items-center gap-2 flex-wrap">
            <span class="text-[10px] font-semibold uppercase tracking-wider text-slate-500 flex-shrink-0 flex items-center gap-1">
              <lucide-icon name="clock" [size]="11" />
              Recent
            </span>
            @for (item of recentItems(); track item.id) {
              <button
                (click)="recentItemClicked.emit(item)"
                class="inline-flex items-center gap-1 px-2.5 py-1 bg-white border border-slate-200 rounded-full text-[11px] font-medium text-slate-600
                       hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50 transition-all duration-150 active:scale-95"
                [title]="item.label"
              >
                <lucide-icon name="history" [size]="11" />
                {{ item.label }}
              </button>
            }
          </div>
        }
      </div>
    }
  `
})
export class MasteryProgressComponent {
  readonly stats = input<IndexStats | null>(null);
  readonly recentItems = input<IndexNode[]>([]);
  readonly recentItemClicked = output<IndexNode>();
}

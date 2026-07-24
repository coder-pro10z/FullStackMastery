import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { ExplorerView } from '../../../../core/models/knowledge-index.models';

@Component({
  selector: 'app-explorer-skeleton',
  standalone: true,
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [`:host { display: block; }`],
  template: `
    @if (view() === 'category') {
      <!-- Category View Skeleton -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        @for (i of items; track i) {
          <div class="edudash-card animate-pulse">
            <div class="flex items-center gap-3 p-4">
              <div class="w-10 h-10 bg-slate-200 rounded-xl flex-shrink-0"></div>
              <div class="flex-1 space-y-2">
                <div class="h-4 bg-slate-200 rounded w-3/4"></div>
                <div class="h-3 bg-slate-200 rounded w-1/2"></div>
              </div>
              <div class="w-11 h-11 bg-slate-200 rounded-full flex-shrink-0"></div>
            </div>
          </div>
        }
      </div>
    }

    @if (view() === 'tree') {
      <!-- Tree View Skeleton -->
      <div class="space-y-2 animate-pulse">
        @for (item of treeItems; track item.depth + '' + item.width) {
          <div class="flex items-center gap-2" [style.padding-left.px]="item.depth * 20">
            <div class="w-4 h-4 bg-slate-200 rounded"></div>
            <div class="h-3 bg-slate-200 rounded" [style.width.%]="item.width"></div>
          </div>
        }
      </div>
    }

    @if (view() === 'list') {
      <!-- List View Skeleton -->
      <div class="space-y-3 animate-pulse">
        @for (i of items; track i) {
          <div class="flex items-start gap-3 p-4 border border-slate-100 rounded-xl">
            <div class="w-2 h-2 rounded-full bg-slate-200 mt-1.5 flex-shrink-0"></div>
            <div class="flex-1 space-y-2">
              <div class="h-4 bg-slate-200 rounded w-3/5"></div>
              <div class="h-3 bg-slate-200 rounded w-2/5"></div>
            </div>
            <div class="w-16 h-5 bg-slate-200 rounded-full flex-shrink-0"></div>
          </div>
        }
      </div>
    }
  `
})
export class ExplorerSkeletonComponent {
  readonly view = input<ExplorerView>('category');
  readonly count = input<number>(6);

  get items(): number[] {
    return Array.from({ length: this.count() }, (_, i) => i);
  }

  readonly treeItems = [
    { depth: 0, width: 55 }, { depth: 1, width: 40 }, { depth: 2, width: 35 },
    { depth: 2, width: 30 }, { depth: 1, width: 45 }, { depth: 0, width: 60 },
    { depth: 1, width: 38 }, { depth: 1, width: 42 }, { depth: 0, width: 50 },
  ];
}

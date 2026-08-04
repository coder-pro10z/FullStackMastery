import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';
import { IndexCategory, IndexNode } from '../../../../core/models/knowledge-index.models';

@Component({
  selector: 'app-category-card',
  standalone: true,
  imports: [LucideAngularModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [`
    :host { display: block; height: 100%; }
    .custom-scrollbar::-webkit-scrollbar { width: 4px; }
    .custom-scrollbar::-webkit-scrollbar-track { background: rgba(241, 245, 249, 0.8); }
    .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(203, 213, 225, 0.9); border-radius: 9999px; }
  `],
  template: `
    <div
      class="bg-white border rounded-2xl overflow-hidden cursor-pointer transition-all duration-200 flex flex-col justify-between shadow-xs
             hover:shadow-md hover:border-slate-300"
      [class.border-[#1A73E8]]="isExpanded()"
      [class.ring-1]="isExpanded()"
      [class.ring-[#1A73E8]]="isExpanded()"
      [class.border-slate-200]="!isExpanded()"
    >
      <!-- Card Header -->
      <div class="p-4" (click)="toggleExpand()">
        <!-- Top Row: Title + Index Badge + Done Counter -->
        <div class="flex items-start justify-between gap-2 mb-2.5">
          <div class="flex items-center gap-2 min-w-0">
            <h3 class="text-xs font-bold text-[#202124] truncate tracking-tight font-sans">
              {{ category().label }}
            </h3>
            <span class="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-mono font-bold flex-shrink-0 border border-slate-200">
              #{{ index() + 1 }}
            </span>
          </div>
          <span class="text-[11px] font-mono text-slate-500 font-semibold flex-shrink-0">
            {{ category().solvedCount }}/{{ category().questionCount }} Done
          </span>
        </div>

        <!-- Horizontal Progress Bar Line -->
        <div class="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <div
            class="h-full bg-gradient-to-r from-[#1A73E8] to-blue-500 rounded-full transition-all duration-500"
            [style.width.%]="category().masteryPct"
          ></div>
        </div>
      </div>

      <!-- Expanded State: Internal Scrollable Question List (matching Image 2 in Light Mode) -->
      @if (isExpanded() && category().children.length > 0) {
        <div class="px-3 pb-3 pt-1 border-t border-slate-100 bg-slate-50/90 animate-fade-in">
          <div class="max-h-56 overflow-y-auto custom-scrollbar space-y-1 pr-1">
            @for (child of category().children; track child.id; let i = $index) {
              <div
                (click)="onNodeSelect(child, $event)"
                class="flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg hover:bg-white hover:shadow-2xs transition-colors group cursor-pointer"
              >
                <!-- Question Number & Title -->
                <p class="text-[11px] text-slate-700 group-hover:text-[#202124] font-medium truncate leading-tight">
                  <span class="text-slate-400 font-mono mr-1.5">{{ i + 1 }}.</span>
                  {{ child.label }}
                </p>

                <!-- Status Circle Dot -->
                <div
                  class="w-2.5 h-2.5 rounded-full flex-shrink-0 transition-transform group-hover:scale-110"
                  [class.bg-emerald-500]="child.isSolved"
                  [class.shadow-2xs]="child.isSolved"
                  [class.bg-[#1A73E8]]="!child.isSolved"
                ></div>
              </div>
            }
          </div>

          <!-- Direct Filter Action -->
          <button
            (click)="onNodeSelect(category(), $event)"
            class="mt-2.5 w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-[11px] font-semibold bg-white text-slate-700
                   hover:bg-[#1A73E8] hover:text-white transition-all duration-150 border border-slate-200 shadow-2xs"
          >
            <lucide-icon name="filter" [size]="11" />
            Filter by {{ displayTitle }}
          </button>
        </div>
      }
    </div>
  `
})
export class CategoryCardComponent {
  readonly category = input.required<IndexCategory>();
  readonly index = input<number>(0);
  readonly isExpanded = input<boolean>(false);

  readonly expanded = output<void>();
  readonly nodeSelected = output<IndexNode>();

  get displayTitle(): string {
    return this.category().label.replace(/^\d+\s+/, '');
  }

  toggleExpand(): void {
    this.expanded.emit();
  }

  onNodeSelect(node: IndexNode, event: MouseEvent): void {
    event.stopPropagation();
    this.nodeSelected.emit(node);
  }
}

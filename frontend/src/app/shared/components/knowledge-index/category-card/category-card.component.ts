import { ChangeDetectionStrategy, Component, input, output, signal } from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';
import { IndexCategory, IndexNode, IndexColorTheme } from '../../../../core/models/knowledge-index.models';
import { ProgressRingComponent } from '../progress-ring/progress-ring.component';

const THEME_STYLES: Record<IndexColorTheme, { gradient: string; ring: string; pill: string; icon: string }> = {
  blue:    { gradient: 'from-blue-500 to-blue-600',    ring: '#1A73E8', pill: 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100',    icon: 'bg-blue-100 text-blue-600' },
  violet:  { gradient: 'from-violet-500 to-purple-600', ring: '#7C3AED', pill: 'bg-violet-50 text-violet-700 border-violet-200 hover:bg-violet-100', icon: 'bg-violet-100 text-violet-600' },
  emerald: { gradient: 'from-emerald-500 to-teal-600', ring: '#10B981', pill: 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100', icon: 'bg-emerald-100 text-emerald-600' },
  amber:   { gradient: 'from-amber-500 to-orange-500', ring: '#F59E0B', pill: 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100',   icon: 'bg-amber-100 text-amber-600' },
  rose:    { gradient: 'from-rose-500 to-pink-600',    ring: '#F43F5E', pill: 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100',       icon: 'bg-rose-100 text-rose-600' },
  cyan:    { gradient: 'from-cyan-500 to-blue-500',    ring: '#06B6D4', pill: 'bg-cyan-50 text-cyan-700 border-cyan-200 hover:bg-cyan-100',       icon: 'bg-cyan-100 text-cyan-600' },
  slate:   { gradient: 'from-slate-500 to-slate-600',  ring: '#64748B', pill: 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100',   icon: 'bg-slate-100 text-slate-600' },
};

@Component({
  selector: 'app-category-card',
  standalone: true,
  imports: [LucideAngularModule, ProgressRingComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [`:host { display: block; height: 100%; }`],
  template: `
    <div
      class="edudash-card h-full flex flex-col gap-0 overflow-hidden cursor-pointer
             transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]
             hover:-translate-y-1 hover:shadow-md border border-slate-200"
      [class.ring-2]="isExpanded()"
      [class.ring-blue-400]="isExpanded()"
    >
      <!-- Card Header -->
      <div class="flex items-center gap-3 p-4" (click)="toggleExpand()">
        <!-- Icon -->
        <div
          class="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 bg-gradient-to-br"
          [class]="themeStyles.icon + ' bg-gradient-to-br ' + themeStyles.gradient"
        >
          <lucide-icon [name]="category().icon" [size]="18" class="text-white" />
        </div>

        <!-- Title & Meta -->
        <div class="flex-1 min-w-0">
          <h3 class="text-sm font-semibold text-[#202124] truncate leading-tight">{{ category().label }}</h3>
          <p class="text-[11px] text-[#5F6368] mt-0.5">
            @if (category().questionCount > 0) {
              {{ category().solvedCount }}/{{ category().questionCount }} solved
            } @else {
              {{ category().children.length }} {{ category().children.length === 1 ? 'topic' : 'topics' }}
            }
          </p>
        </div>

        <!-- Progress Ring -->
        <div class="flex-shrink-0 flex items-center gap-2">
          <app-progress-ring
            [percentage]="category().masteryPct"
            [size]="44"
            [strokeWidth]="4"
            [showLabel]="true"
            [progressColor]="themeStyles.ring"
          />
          <!-- Chevron -->
          <lucide-icon
            [name]="isExpanded() ? 'chevron-up' : 'chevron-down'"
            [size]="14"
            class="text-slate-400 transition-transform duration-200"
            [class.-rotate-180]="isExpanded()"
          />
        </div>
      </div>

      <!-- Expanded Sub-categories -->
      @if (isExpanded() && category().children.length > 0) {
        <div class="px-4 pb-4 border-t border-slate-100 pt-3 animate-fade-in">
          <p class="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-2">Topics</p>
          <div class="flex flex-wrap gap-2">
            @for (child of category().children; track child.id) {
              <button
                (click)="onNodeSelect(child)"
                class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-150 active:scale-95"
                [class]="themeStyles.pill"
              >
                <lucide-icon name="folder" [size]="11" />
                {{ child.label }}
                @if (child.questionCount > 0) {
                  <span class="opacity-60">({{ child.questionCount }})</span>
                }
              </button>
            }
          </div>

          <!-- Apply Filter Button -->
          <button
            (click)="onNodeSelect(category())"
            class="mt-3 w-full flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold border border-dashed border-slate-300 text-slate-500
                   hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-all duration-150"
          >
            <lucide-icon name="filter" [size]="12" />
            Filter by {{ category().label }}
          </button>
        </div>
      }

      @if (isExpanded() && category().children.length === 0) {
        <div class="px-4 pb-4 pt-3 border-t border-slate-100 text-center">
          <p class="text-xs text-slate-400 italic">No sub-topics found</p>
          <button
            (click)="onNodeSelect(category())"
            class="mt-2 w-full flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold border border-dashed border-slate-300 text-slate-500
                   hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-all duration-150"
          >
            <lucide-icon name="filter" [size]="12" />
            View all questions
          </button>
        </div>
      }
    </div>
  `
})
export class CategoryCardComponent {
  readonly category = input.required<IndexCategory>();
  readonly isExpanded = input<boolean>(false);

  readonly expanded = output<void>();
  readonly nodeSelected = output<IndexNode>();

  get themeStyles() {
    return THEME_STYLES[this.category().colorTheme] ?? THEME_STYLES['blue'];
  }

  toggleExpand(): void {
    this.expanded.emit();
  }

  onNodeSelect(node: IndexNode): void {
    this.nodeSelected.emit(node);
  }
}

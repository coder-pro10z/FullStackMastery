import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';
import { ExplorerView } from '../../../../core/models/knowledge-index.models';

@Component({
  selector: 'app-explorer-toolbar',
  standalone: true,
  imports: [LucideAngularModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [`:host { display: block; }`],
  template: `
    <div class="flex flex-col gap-3">
      <!-- Top Row: Title + View Tabs + Close -->
      <div class="flex items-center justify-between gap-4">
        <div class="flex items-center gap-2.5">
          <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-violet-600 flex items-center justify-center flex-shrink-0">
            <lucide-icon name="layout-grid" [size]="16" class="text-white" />
          </div>
          <div>
            <h2 class="text-base font-semibold text-[#202124] leading-tight tracking-tight">Knowledge Index</h2>
            <p class="text-[11px] text-[#5F6368]">Browse all questions & topics</p>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <!-- View Tabs -->
          <div class="flex items-center bg-slate-100 rounded-lg p-0.5 gap-0.5">
            @for (tab of tabs; track tab.id) {
              <button
                [id]="'ki-tab-' + tab.id"
                (click)="viewChanged.emit(tab.id)"
                class="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-150"
                [class.bg-white]="activeView() === tab.id"
                [class.text-[#202124]]="activeView() === tab.id"
                [class.shadow-sm]="activeView() === tab.id"
                [class.text-slate-500]="activeView() !== tab.id"
                [class.hover:text-slate-700]="activeView() !== tab.id"
                [attr.aria-pressed]="activeView() === tab.id"
                [title]="tab.label + ' view'"
              >
                <lucide-icon [name]="tab.icon" [size]="13" />
                <span class="hidden sm:inline">{{ tab.label }}</span>
              </button>
            }
          </div>

          <!-- Expand All -->
          <button
            id="ki-expand-all"
            (click)="expandAll.emit()"
            title="Expand all"
            class="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors duration-150"
          >
            <lucide-icon name="chevrons-down-up" [size]="15" />
          </button>

          <!-- Collapse All -->
          <button
            id="ki-collapse-all"
            (click)="collapseAll.emit()"
            title="Collapse all"
            class="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors duration-150"
          >
            <lucide-icon name="chevrons-up-down" [size]="15" />
          </button>

          <!-- Close -->
          <button
            id="ki-close"
            (click)="closed.emit()"
            title="Close index"
            class="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors duration-150 ml-1"
          >
            <lucide-icon name="x" [size]="16" />
          </button>
        </div>
      </div>

      <!-- Search Bar -->
      <div class="relative">
        <lucide-icon name="search" [size]="15" class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        <input
          id="ki-search-input"
          type="text"
          [value]="searchTerm()"
          (input)="searchChanged.emit($any($event.target).value)"
          placeholder="Search questions, topics, categories..."
          class="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-[#202124] placeholder:text-slate-400
                 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all duration-150"
        />
        @if (searchTerm()) {
          <button
            (click)="searchChanged.emit('')"
            class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
            title="Clear search"
          >
            <lucide-icon name="x-circle" [size]="14" />
          </button>
        }
      </div>
    </div>
  `
})
export class ExplorerToolbarComponent {
  readonly activeView = input.required<ExplorerView>();
  readonly searchTerm = input<string>('');

  readonly viewChanged = output<ExplorerView>();
  readonly searchChanged = output<string>();
  readonly expandAll = output<void>();
  readonly collapseAll = output<void>();
  readonly closed = output<void>();

  readonly tabs: { id: ExplorerView; label: string; icon: string }[] = [
    { id: 'category', label: 'Category', icon: 'layout-grid' },
    { id: 'tree', label: 'Tree', icon: 'git-branch' },
    { id: 'list', label: 'List', icon: 'list' },
  ];
}

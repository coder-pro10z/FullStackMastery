import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';
import { ExplorerView, IndexStats } from '../../../../core/models/knowledge-index.models';

@Component({
  selector: 'app-explorer-toolbar',
  standalone: true,
  imports: [LucideAngularModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [`:host { display: block; }`],
  template: `
    <!-- Single Compact Header Row matching Scenario Index layout in Light Mode -->
    <div class="flex items-center justify-between gap-4 bg-white/95 backdrop-blur-md px-6 py-3.5 border-b border-slate-200 sticky top-0 z-20 shadow-xs">

      <!-- Left Group: Title + Category/List Tabs + Expand All -->
      <div class="flex items-center gap-4 flex-shrink-0">
        <!-- Title -->
        <div class="flex items-center gap-2.5">
          <div class="w-8 h-8 rounded-lg bg-[#1A73E8] text-white flex items-center justify-center font-bold text-sm shadow-xs flex-shrink-0">
            <lucide-icon name="layout-grid" [size]="16" />
          </div>
          <h2 class="text-base font-bold text-[#202124] tracking-tight">
            Scenario Index
          </h2>
        </div>

        <!-- View Tabs -->
        <div class="flex items-center bg-slate-100 border border-slate-200 rounded-xl p-0.5 gap-0.5">
          @for (tab of tabs; track tab.id) {
            <button
              [id]="'ki-tab-' + tab.id"
              (click)="viewChanged.emit(tab.id)"
              class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150"
              [class.bg-[#1A73E8]]="activeView() === tab.id"
              [class.text-white]="activeView() === tab.id"
              [class.shadow-xs]="activeView() === tab.id"
              [class.text-slate-600]="activeView() !== tab.id"
              [class.hover:text-slate-900]="activeView() !== tab.id"
              [attr.aria-pressed]="activeView() === tab.id"
            >
              <lucide-icon [name]="tab.icon" [size]="13" />
              <span>{{ tab.label }}</span>
            </button>
          }
        </div>

        <!-- Expand All Toggle -->
        <button
          id="ki-expand-all"
          (click)="toggleExpandAll.emit()"
          class="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/70 rounded-lg border border-slate-200 transition-colors"
          title="Toggle Expand All"
        >
          <lucide-icon name="chevrons-down-up" [size]="13" />
          <span class="hidden sm:inline">Expand All</span>
        </button>
      </div>

      <!-- Center Group: Light Mode Search Bar -->
      <div class="flex-1 max-w-md mx-2 relative">
        <lucide-icon name="search" [size]="15" class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        <input
          id="ki-search-input"
          type="text"
          [value]="searchTerm()"
          (input)="searchChanged.emit($any($event.target).value)"
          placeholder="Search questions, answers, half words (e.g. async)..."
          class="w-full pl-9 pr-8 py-2 bg-[#F8F9FA] border border-slate-300 rounded-xl text-xs text-[#202124] placeholder:text-slate-400
                 focus:outline-none focus:ring-2 focus:ring-[#1A73E8]/30 focus:border-[#1A73E8] focus:bg-white transition-all duration-150 font-sans"
        />
        @if (searchTerm()) {
          <button
            (click)="searchChanged.emit('')"
            class="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
            title="Clear search"
          >
            <lucide-icon name="x-circle" [size]="14" />
          </button>
        }
      </div>

      <!-- Right Group: Top Mastery Progress + Close -->
      <div class="flex items-center gap-4 flex-shrink-0">
        <!-- Top Right Mastery Progress Bar (Light Mode) -->
        @if (stats()) {
          <div class="hidden md:flex flex-col items-end gap-1 w-44">
            <div class="flex items-center justify-between w-full text-[11px] font-sans">
              <span class="text-slate-500 font-medium">Mastery Progress</span>
              <span class="font-bold text-[#202124] font-mono">
                {{ stats()!.solvedQuestions }} / {{ stats()!.totalQuestions }} ({{ stats()!.masteryPct }}%)
              </span>
            </div>
            <div class="w-full h-2 bg-slate-200/80 rounded-full overflow-hidden">
              <div
                class="h-full bg-gradient-to-r from-[#1A73E8] to-blue-500 rounded-full transition-all duration-500 shadow-2xs"
                [style.width.%]="stats()!.masteryPct"
              ></div>
            </div>
          </div>
        }

        <!-- Close Button -->
        <button
          id="ki-close"
          (click)="closed.emit()"
          title="Close index"
          class="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors duration-150"
        >
          <lucide-icon name="x" [size]="18" />
        </button>
      </div>

    </div>
  `
})
export class ExplorerToolbarComponent {
  readonly activeView = input.required<ExplorerView>();
  readonly searchTerm = input<string>('');
  readonly stats = input<IndexStats | null>(null);

  readonly viewChanged = output<ExplorerView>();
  readonly searchChanged = output<string>();
  readonly toggleExpandAll = output<void>();
  readonly closed = output<void>();

  readonly tabs: { id: ExplorerView; label: string; icon: string }[] = [
    { id: 'category', label: 'Category', icon: 'layout-grid' },
    { id: 'list', label: 'List', icon: 'list' },
  ];
}

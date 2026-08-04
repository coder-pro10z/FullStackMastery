import {
  ChangeDetectionStrategy, Component, computed, HostListener,
  inject, input, OnChanges, output, signal, SimpleChanges
} from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';
import { KnowledgeIndexService } from '../../../../core/services/knowledge-index.service';
import {
  ExplorerView, IndexCategory, IndexNode, IndexNodeSelectedEvent
} from '../../../../core/models/knowledge-index.models';
import { ExplorerToolbarComponent } from '../explorer-toolbar/explorer-toolbar.component';
import { CategoryCardComponent } from '../category-card/category-card.component';
import { QuestionRowComponent } from '../question-row/question-row.component';
import { ExplorerSkeletonComponent } from '../explorer-skeleton/explorer-skeleton.component';

@Component({
  selector: 'app-knowledge-index-overlay',
  standalone: true,
  imports: [
    LucideAngularModule,
    ExplorerToolbarComponent,
    CategoryCardComponent,
    QuestionRowComponent,
    ExplorerSkeletonComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [`
    :host {
      display: block;
      position: fixed;
      top: 4rem;
      bottom: 0;
      left: 0;
      right: 0;
      z-40;
      pointer-events: none;
    }
    :host > * {
      pointer-events: auto;
    }
    .custom-scrollbar::-webkit-scrollbar { width: 6px; }
    .custom-scrollbar::-webkit-scrollbar-track { background: #f8fafc; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 9999px; }
  `],
  template: `
    @if (isOpen()) {
      <!-- Backdrop (Starts at top-16 right below global navbar h-16) -->
      <div
        class="fixed top-16 bottom-0 inset-x-0 z-40 bg-slate-900/30 backdrop-blur-xs animate-fade-in"
        (click)="close()"
        aria-hidden="true"
      ></div>

      <!-- Overlay Panel Drawer (Positioned top-16 in visible area below global navbar) -->
      <div
        class="fixed top-16 bottom-0 right-0 z-40 w-full max-w-6xl bg-slate-50 border-l border-slate-200 shadow-2xl flex flex-col h-[calc(100vh-4rem)]
               animate-slide-in-right text-slate-800"
        role="dialog"
        aria-modal="true"
        aria-label="Scenario Index"
      >
        <!-- Sticky Header Toolbar Container -->
        <div class="flex-shrink-0 sticky top-0 z-20 bg-white shadow-xs">
          <app-explorer-toolbar
            [activeView]="activeView()"
            [searchTerm]="searchQuery()"
            [stats]="indexService.indexStats()"
            (viewChanged)="activeView.set($event)"
            (searchChanged)="onSearch($event)"
            (toggleExpandAll)="toggleExpandAll()"
            (closed)="close()"
          />

          <!-- Recently Viewed Chips Bar -->
          @if (recentItems().length > 0) {
            <div class="flex items-center gap-2.5 px-6 py-2.5 bg-slate-100/60 border-b border-slate-200/80 overflow-x-auto">
              <span class="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1 flex-shrink-0">
                <lucide-icon name="history" [size]="12" class="text-[#1A73E8]" />
                RECENTLY VIEWED:
              </span>
              @for (item of recentItems(); track item.id) {
                <button
                  (click)="onNodeSelected(item)"
                  class="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white border border-slate-200/90 rounded-full text-[11px] font-mono text-slate-700
                         hover:border-[#1A73E8] hover:text-[#1A73E8] shadow-2xs transition-all duration-150 active:scale-95 flex-shrink-0"
                >
                  <span class="w-1.5 h-1.5 rounded-full bg-[#1A73E8]"></span>
                  <span class="truncate max-w-[200px]">{{ item.label }}</span>
                </button>
              }
            </div>
          }
        </div>

        <!-- Scrollable Content Grid (Light Mode) -->
        <div class="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-4">
          @if (indexService.isLoading()) {
            <app-explorer-skeleton [view]="activeView()" [count]="9" />
          } @else {

            <!-- CATEGORY VIEW (3-Column Card Grid in Light Mode) -->
            @if (activeView() === 'category') {
              @if (moduleCards().length === 0) {
                <div class="flex flex-col items-center justify-center py-20 text-center">
                  <lucide-icon name="search-x" [size]="48" class="text-slate-300 mb-3" />
                  <p class="text-sm font-medium text-slate-600">No matching scenarios found</p>
                  <p class="text-xs text-slate-400 mt-1">Try a different search keyword</p>
                </div>
              } @else {
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  @for (cat of moduleCards(); track cat.id; let i = $index) {
                    <app-category-card
                      [category]="cat"
                      [index]="i"
                      [isExpanded]="expandedIds().has(cat.id)"
                      (expanded)="toggleExpand(cat.id)"
                      (nodeSelected)="onNodeSelected($event)"
                    />
                  }
                </div>
              }
            }

            <!-- LIST VIEW (Light Mode) -->
            @if (activeView() === 'list') {
              <!-- Difficulty Filter Chips -->
              <div class="flex items-center gap-2 flex-wrap pb-3 border-b border-slate-200">
                <span class="text-xs text-slate-500 font-mono">Filter by Difficulty:</span>
                @for (diff of difficultyFilters; track diff) {
                  <button
                    (click)="toggleDifficultyFilter(diff)"
                    class="px-3 py-1 rounded-full text-xs font-medium border transition-all duration-150 active:scale-95"
                    [class]="activeDifficultyFilters().has(diff) ? activeDiffStyle(diff) : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'"
                  >{{ diff }}</button>
                }
                @if (activeDifficultyFilters().size > 0) {
                  <button (click)="clearDifficultyFilters()" class="text-xs text-[#1A73E8] hover:underline ml-1 font-medium">Clear</button>
                }
              </div>

              <!-- Question Rows -->
              @if (filteredFlatList().length === 0) {
                <div class="flex flex-col items-center justify-center py-20 text-center">
                  <lucide-icon name="search-x" [size]="48" class="text-slate-300 mb-3" />
                  <p class="text-sm font-medium text-slate-600">No questions found</p>
                </div>
              } @else {
                <div class="space-y-2">
                  @for (q of filteredFlatList(); track q.id) {
                    <app-question-row
                      [question]="q"
                      [isSelected]="selectedId() === q.id"
                      (selected)="onNodeSelected($event)"
                    />
                  }
                </div>
                <p class="text-center text-xs text-slate-400 font-mono pt-3">{{ filteredFlatList().length }} questions listed</p>
              }
            }
          }
        </div>
      </div>
    }
  `
})
export class KnowledgeIndexOverlayComponent implements OnChanges {
  readonly indexService = inject(KnowledgeIndexService);

  readonly isOpen = input<boolean>(false);
  readonly initialView = input<ExplorerView>('category');

  readonly nodeSelected = output<IndexNodeSelectedEvent>();
  readonly closed = output<void>();

  // Internal state
  readonly activeView = signal<ExplorerView>('category');
  readonly searchQuery = signal('');
  readonly expandedIds = signal<Set<string>>(new Set());
  readonly selectedId = signal<string | null>(null);
  readonly recentItems = signal<IndexNode[]>([]);
  readonly activeDifficultyFilters = signal<Set<string>>(new Set());

  readonly difficultyFilters = ['Easy', 'Medium', 'Hard'];

  // Flatten tree to module cards for the 3-column grid
  readonly moduleCards = computed(() => {
    const tree = this.indexService.filterTree(this.indexService.indexTree(), this.searchQuery());
    const cards: IndexCategory[] = [];
    for (const domain of tree) {
      for (const mod of domain.children) {
        cards.push(mod as IndexCategory);
      }
    }
    return cards;
  });

  readonly flatList = computed(() =>
    this.indexService.flattenToQuestions(this.indexService.indexTree())
  );

  readonly filteredFlatList = computed(() => {
    const q = this.searchQuery().toLowerCase();
    const diffs = this.activeDifficultyFilters();
    return this.flatList().filter(item => {
      const matchSearch = !q || item.label.toLowerCase().includes(q);
      const matchDiff = diffs.size === 0 || (item.difficulty != null && diffs.has(item.difficulty));
      return matchSearch && matchDiff;
    });
  });

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isOpen']?.currentValue === true) {
      this.activeView.set(this.initialView());
      this.searchQuery.set('');
      this.recentItems.set(this.indexService.getRecentlyViewed());
      this.indexService.ensureLoaded();
    }
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.isOpen()) this.close();
  }

  close(): void {
    this.closed.emit();
  }

  onSearch(term: string): void {
    this.searchQuery.set(term);
    if (term) {
      // Expand matching module cards automatically
      const matched = new Set<string>();
      for (const card of this.moduleCards()) {
        if (card.children.some(ch => ch.label.toLowerCase().includes(term.toLowerCase()))) {
          matched.add(card.id);
        }
      }
      this.expandedIds.set(matched);
    }
  }

  toggleExpand(id: string): void {
    this.expandedIds.update(cur => {
      const next = new Set(cur);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  toggleExpandAll(): void {
    if (this.expandedIds().size > 0) {
      this.expandedIds.set(new Set());
    } else {
      const all = new Set(this.moduleCards().map(c => c.id));
      this.expandedIds.set(all);
    }
  }

  onNodeSelected(node: IndexNode): void {
    this.selectedId.set(node.id);
    this.indexService.recordView(node);
    const filterParams = this.indexService.buildFilterParams(node);
    this.nodeSelected.emit({ node, filterParams });
    this.close();
  }

  toggleDifficultyFilter(diff: string): void {
    this.activeDifficultyFilters.update(cur => {
      const next = new Set(cur);
      next.has(diff) ? next.delete(diff) : next.add(diff);
      return next;
    });
  }

  clearDifficultyFilters(): void {
    this.activeDifficultyFilters.set(new Set<string>());
  }

  activeDiffStyle(diff: string): string {
    if (diff === 'Easy') return 'bg-emerald-50 text-emerald-700 border-emerald-300 font-semibold';
    if (diff === 'Medium') return 'bg-amber-50 text-amber-700 border-amber-300 font-semibold';
    if (diff === 'Hard') return 'bg-rose-50 text-rose-700 border-rose-300 font-semibold';
    return '';
  }
}

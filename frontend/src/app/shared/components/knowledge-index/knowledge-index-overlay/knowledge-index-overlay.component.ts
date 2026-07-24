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
import { MasteryProgressComponent } from '../mastery-progress/mastery-progress.component';
import { CategoryCardComponent } from '../category-card/category-card.component';
import { TreeExplorerComponent } from '../tree-explorer/tree-explorer.component';
import { QuestionRowComponent } from '../question-row/question-row.component';
import { ExplorerSkeletonComponent } from '../explorer-skeleton/explorer-skeleton.component';

@Component({
  selector: 'app-knowledge-index-overlay',
  standalone: true,
  imports: [
    LucideAngularModule,
    ExplorerToolbarComponent,
    MasteryProgressComponent,
    CategoryCardComponent,
    TreeExplorerComponent,
    QuestionRowComponent,
    ExplorerSkeletonComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [`:host { display: block; }`],
  template: `
    @if (isOpen()) {
      <!-- Backdrop -->
      <div
        class="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm animate-fade-in"
        (click)="close()"
        aria-hidden="true"
      ></div>

      <!-- Overlay Panel -->
      <div
        class="fixed inset-y-0 right-0 z-50 w-full max-w-3xl bg-white shadow-2xl flex flex-col
               animate-slide-in-right"
        role="dialog"
        aria-modal="true"
        aria-label="Knowledge Index"
      >
        <!-- Header Section (fixed height) -->
        <div class="flex-shrink-0 px-5 pt-5 pb-4 border-b border-slate-100 space-y-4">
          <app-explorer-toolbar
            [activeView]="activeView()"
            [searchTerm]="searchQuery()"
            (viewChanged)="activeView.set($event)"
            (searchChanged)="onSearch($event)"
            (expandAll)="expandAll()"
            (collapseAll)="collapseAll()"
            (closed)="close()"
          />

          <app-mastery-progress
            [stats]="indexService.indexStats()"
            [recentItems]="recentItems()"
            (recentItemClicked)="onNodeSelected($event)"
          />
        </div>

        <!-- Scrollable Content -->
        <div class="flex-1 overflow-y-auto px-5 py-4 space-y-3">
          @if (indexService.isLoading()) {
            <app-explorer-skeleton [view]="activeView()" [count]="6" />
          } @else {

            <!-- CATEGORY VIEW -->
            @if (activeView() === 'category') {
              @if (filteredTree().length === 0) {
                <div class="flex flex-col items-center justify-center py-16 text-center">
                  <lucide-icon name="search-x" [size]="48" class="text-slate-200 mb-3" />
                  <p class="text-sm font-medium text-slate-500">No categories found</p>
                  <p class="text-xs text-slate-400 mt-1">Try a different search term</p>
                </div>
              } @else {
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  @for (cat of filteredTree(); track cat.id) {
                    <app-category-card
                      [category]="asCategory(cat)"
                      [isExpanded]="expandedIds().has(cat.id)"
                      (expanded)="toggleExpand(cat.id)"
                      (nodeSelected)="onNodeSelected($event)"
                    />
                  }
                </div>
              }
            }

            <!-- TREE VIEW -->
            @if (activeView() === 'tree') {
              <app-tree-explorer
                [roots]="filteredTree()"
                [expandedIds]="expandedIds()"
                [selectedId]="selectedId()"
                (nodeSelected)="onNodeSelected($event)"
                (nodeToggled)="toggleExpand($event)"
              />
            }

            <!-- LIST VIEW -->
            @if (activeView() === 'list') {
              <!-- Difficulty Filter Chips -->
              <div class="flex items-center gap-2 flex-wrap pb-2 border-b border-slate-100">
                <span class="text-xs text-slate-500 font-medium">Filter:</span>
                @for (diff of difficultyFilters; track diff) {
                  <button
                    (click)="toggleDifficultyFilter(diff)"
                    class="px-3 py-1 rounded-full text-xs font-medium border transition-all duration-150 active:scale-95"
                    [class]="activeDifficultyFilters().has(diff) ? activeDiffStyle(diff) : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'"
                  >{{ diff }}</button>
                }
                @if (activeDifficultyFilters().size > 0) {
                  <button (click)="clearDifficultyFilters()" class="text-xs text-blue-600 hover:underline ml-1">Clear</button>
                }
              </div>

              <!-- Question Rows -->
              @if (filteredFlatList().length === 0) {
                <div class="flex flex-col items-center justify-center py-16 text-center">
                  <lucide-icon name="search-x" [size]="48" class="text-slate-200 mb-3" />
                  <p class="text-sm font-medium text-slate-500">No questions found</p>
                </div>
              } @else {
                <div class="space-y-1">
                  @for (q of filteredFlatList(); track q.id) {
                    <app-question-row
                      [question]="q"
                      [isSelected]="selectedId() === q.id"
                      (selected)="onNodeSelected($event)"
                    />
                  }
                </div>
                <p class="text-center text-xs text-slate-400 pt-2">{{ filteredFlatList().length }} question{{ filteredFlatList().length !== 1 ? 's' : '' }}</p>
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

  // Derived
  readonly filteredTree = computed(() =>
    this.indexService.filterTree(this.indexService.indexTree(), this.searchQuery())
  );

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
    // Auto-expand nodes that match when in tree view
    if (this.activeView() === 'tree' && term) {
      const matched = new Set<string>();
      const walk = (nodes: IndexNode[]) => {
        for (const n of nodes) {
          if (n.label.toLowerCase().includes(term.toLowerCase())) {
            // Expand all ancestors
            n.parentIds.forEach(pid => matched.add(pid));
          }
          walk(n.children);
        }
      };
      walk(this.indexService.indexTree());
      this.expandedIds.update(cur => new Set([...cur, ...matched]));
    }
  }

  toggleExpand(id: string): void {
    this.expandedIds.update(cur => {
      const next = new Set(cur);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  expandAll(): void {
    const all = new Set<string>();
    const walk = (nodes: IndexNode[]) => {
      for (const n of nodes) {
        if (n.children.length) { all.add(n.id); walk(n.children); }
      }
    };
    walk(this.indexService.indexTree());
    this.expandedIds.set(all);
  }

  collapseAll(): void {
    this.expandedIds.set(new Set());
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
    if (diff === 'Easy') return 'bg-emerald-100 text-emerald-700 border-emerald-300';
    if (diff === 'Medium') return 'bg-amber-100 text-amber-700 border-amber-300';
    if (diff === 'Hard') return 'bg-rose-100 text-rose-700 border-rose-300';
    return '';
  }

  asCategory(node: IndexNode): IndexCategory {
    return node as IndexCategory;
  }
}

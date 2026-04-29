import { AsyncPipe, NgClass, NgIf } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject, combineLatest, map, switchMap, tap } from 'rxjs';
import { CategoryTreeDto } from '../../../core/models/category.models';
import { ProgressSummaryDto, UserProgressStateDto } from '../../../core/models/progress.models';
import { PagedResponse, QuestionDto, QuestionQueryParams } from '../../../core/models/question.models';
import { CategoryService } from '../../../core/services/category.service';
import { ProgressService } from '../../../core/services/progress.service';
import { QuestionService } from '../../../core/services/question.service';
import { FilterBarComponent } from '../../../shared/components/filter-bar/filter-bar.component';
import { ProgressCardComponent } from '../../../shared/components/progress-card/progress-card.component';
import { SubCategoryNavComponent } from '../../../shared/components/sub-category-nav/sub-category-nav.component';
import { QuestionTableComponent } from '../components/question-table/question-table.component';

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [AsyncPipe, NgClass, NgIf, FilterBarComponent, ProgressCardComponent, SubCategoryNavComponent, QuestionTableComponent],
  template: `
    <div class="space-y-5 animate-fade-in" *ngIf="vm$ | async as vm">
      <!-- Page Header -->
      <section class="flex items-center justify-between">
        <div>
          <h1 class="text-xl font-bold text-white">
            @if (vm.selectedCategoryName) {
              {{ vm.selectedCategoryName }}
            } @else {
              Dashboard
            }
          </h1>
          <p class="text-sm text-slate-500 mt-1">
            @if (vm.selectedCategoryName) {
              Viewing <span class="text-slate-300 font-medium">{{ vm.selectedCategoryName }}</span> questions
            } @else {
              Track progress, review questions, and master your next interview.
            }
          </p>
        </div>

        <!-- Question count -->
        @if (vm.totalRecords > 0) {
          <span class="text-xs text-slate-500 bg-dark-surface-light px-3 py-1.5 rounded-lg hidden sm:block">
            {{ paginationSummary(vm) }}
          </span>
        }
      </section>

      <!-- Progress Cards -->
      @if (vm.summary) {
        <section class="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <app-progress-card
            label="Overall"
            [solved]="vm.summary.totalSolved"
            [total]="vm.summary.totalQuestions"
            variant="default" />
          <app-progress-card
            label="Easy"
            [solved]="vm.summary.easySolved"
            [total]="vm.summary.easyTotal"
            variant="easy" />
          <app-progress-card
            label="Medium"
            [solved]="vm.summary.mediumSolved"
            [total]="vm.summary.mediumTotal"
            variant="medium" />
          <app-progress-card
            label="Hard"
            [solved]="vm.summary.hardSolved"
            [total]="vm.summary.hardTotal"
            variant="hard" />
        </section>
      } @else {
        <!-- Skeleton loading for progress cards -->
        <section class="grid grid-cols-2 lg:grid-cols-4 gap-3">
          @for (i of [1,2,3,4]; track i) {
            <div class="glass-panel p-4">
              <div class="skeleton h-3 w-16 mb-3"></div>
              <div class="skeleton h-7 w-20 mb-3"></div>
              <div class="skeleton h-1.5 w-full"></div>
            </div>
          }
        </section>
      }

      <!-- Sub-Category Navigation -->
      <app-sub-category-nav
        [rootCategory]="vm.selectedRootCategory"
        [selectedCategoryId]="vm.selectedCategoryId" />

      <!-- Filter Bar -->
      <app-filter-bar
        [roles]="vm.roles"
        [searchTerm]="activeFilters.searchTerm ?? ''"
        [difficulty]="activeFilters.difficulty ?? ''"
        [role]="activeFilters.role ?? ''"
        (filtersChanged)="updateFilters($event)" />

      <!-- Question List -->
      @if (loading()) {
        <!-- Skeleton loading for questions -->
        <div class="space-y-3">
          @for (i of [1,2,3]; track i) {
            <div class="glass-panel p-5">
              <div class="skeleton h-4 w-3/4 mb-3"></div>
              <div class="skeleton h-3 w-full mb-2"></div>
              <div class="skeleton h-3 w-2/3 mb-4"></div>
              <div class="flex gap-2">
                <div class="skeleton h-6 w-16 rounded-full"></div>
                <div class="skeleton h-6 w-20 rounded-full"></div>
              </div>
            </div>
          }
        </div>
      } @else if (vm.questions.length === 0) {
        <!-- Empty state -->
        <div class="glass-panel p-12 text-center">
          <svg class="w-12 h-12 text-slate-600 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          <h3 class="text-lg font-semibold text-slate-400 mb-1">No questions found</h3>
          <p class="text-sm text-slate-600">Try adjusting your filters or selecting a different category.</p>
        </div>
      } @else {
        <app-question-table
          [questions]="vm.questions"
          (solvedToggled)="toggleSolved($event)"
          (revisionToggled)="toggleRevision($event)" />

        @if (vm.totalPages > 1) {
          <section class="glass-panel p-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div class="text-sm text-slate-400">
              {{ pageRangeSummary(vm) }}
            </div>

            <div class="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div class="flex items-center gap-2">
                <span class="text-xs uppercase tracking-wider text-slate-500">Page Size</span>
                <div class="flex items-center gap-2">
                  @for (size of pageSizeOptions; track size) {
                    <button
                      type="button"
                      class="px-3 py-1.5 rounded-lg text-xs border transition-colors"
                      [ngClass]="{
                        'bg-white/10 text-white border-white/10': vm.pageSize === size,
                        'text-slate-400 border-white/5 hover:bg-white/5': vm.pageSize !== size
                      }"
                      (click)="setPageSize(size)">
                      {{ size }}
                    </button>
                  }
                </div>
              </div>

              <div class="flex items-center gap-2">
                <button
                  type="button"
                  class="btn-ghost text-xs px-3 py-2 disabled:opacity-40"
                  [disabled]="!canGoToPreviousPage(vm)"
                  (click)="goToPreviousPage(vm.pageNumber)">
                  Previous
                </button>
                <span class="text-sm text-slate-400 min-w-24 text-center">
                  Page {{ vm.pageNumber }} of {{ vm.totalPages }}
                </span>
                <button
                  type="button"
                  class="btn-ghost text-xs px-3 py-2 disabled:opacity-40"
                  [disabled]="!canGoToNextPage(vm)"
                  (click)="goToNextPage(vm.pageNumber, vm.totalPages)">
                  Next
                </button>
              </div>
            </div>
          </section>
        }
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardPageComponent {
  readonly pageSizeOptions = [10, 20, 50];

  private readonly destroyRef = inject(DestroyRef);
  private readonly route = inject(ActivatedRoute);
  private readonly categoryService = inject(CategoryService);
  private readonly progressService = inject(ProgressService);
  private readonly questionService = inject(QuestionService);

  activeFilters: QuestionQueryParams = {};
  readonly loading = signal(true);

  private readonly filters$ = new BehaviorSubject<QuestionQueryParams>({});
  private readonly summary$ = new BehaviorSubject<ProgressSummaryDto | null>(null);
  private readonly questionPage$ = new BehaviorSubject<PagedResponse<QuestionDto> | null>(null);
  private readonly categories$ = new BehaviorSubject<CategoryTreeDto[]>([]);
  private readonly pagination$ = new BehaviorSubject<{ pageNumber: number; pageSize: number }>({
    pageNumber: 1,
    pageSize: 10
  });

  private readonly selectedCategoryId$ = this.route.queryParamMap.pipe(
    map((queryParams) => {
      const rawCategoryId = queryParams.get('categoryId');
      if (!rawCategoryId) return null;
      const categoryId = Number(rawCategoryId);
      return Number.isNaN(categoryId) ? null : categoryId;
    })
  );

  private readonly loadQuestions$ = combineLatest([this.selectedCategoryId$, this.filters$, this.pagination$]).pipe(
    tap(() => this.loading.set(true)),
    switchMap(([categoryId, filters, pagination]) =>
      this.questionService.getQuestions({
        pageNumber: pagination.pageNumber,
        pageSize: pagination.pageSize,
        ...filters,
        ...(categoryId ? { categoryId } : {})
      })
    )
  );

  readonly vm$ = combineLatest([
    this.summary$,
    this.questionPage$,
    this.categories$,
    this.selectedCategoryId$
  ]).pipe(
    map(([summary, questionPage, categories, selectedCategoryId]) => {
      const selectedRootCategory = this.findRootCategory(categories, selectedCategoryId);
      const selectedCategory = this.findCategory(categories, selectedCategoryId);
      const questions = questionPage?.data ?? [];

      return {
        summary,
        questions,
        totalRecords: questionPage?.totalRecords ?? 0,
        pageNumber: questionPage?.pageNumber ?? 1,
        pageSize: questionPage?.pageSize ?? this.pagination$.value.pageSize,
        totalPages: questionPage?.totalPages ?? 0,
        selectedCategoryId,
        selectedCategoryName: selectedCategory?.name ?? null,
        selectedRootCategory,
        roles: [...new Set(questions.map((question) => question.role))].sort()
      };
    })
  );

  constructor() {
    this.progressService.getSummary()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((summary) => this.summary$.next(summary));

    this.categoryService.getTree()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((categories) => this.categories$.next(categories));

    this.loadQuestions$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((response) => {
        this.questionPage$.next(response);
        this.loading.set(false);
      });
  }

  updateFilters(filters: QuestionQueryParams) {
    this.activeFilters = filters;
    this.filters$.next(filters);
    this.pagination$.next({
      ...this.pagination$.value,
      pageNumber: 1
    });
  }

  toggleSolved(questionId: number) {
    const snapshot = this.questionPage$.value;
    if (!snapshot) return;

    const questionSnapshot = snapshot.data;
    const targetQuestion = questionSnapshot.find((question) => question.id === questionId);
    if (!targetQuestion) return;

    const nextSolved = !targetQuestion.isSolved;
    const summarySnapshot = this.summary$.value;
    this.updateQuestion(questionId, (question) => ({ ...question, isSolved: nextSolved }));
    this.patchSummaryTransition(targetQuestion, targetQuestion.isSolved, nextSolved);

    this.progressService.toggleSolved(questionId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (state) => {
          if (state.isSolved !== nextSolved) {
            this.patchSummaryTransition(targetQuestion, nextSolved, state.isSolved);
          }
          this.applyRemoteToggleState(questionId, state);
        },
        error: () => {
          this.questionPage$.next(snapshot);
          this.summary$.next(summarySnapshot);
        }
      });
  }

  toggleRevision(questionId: number) {
    const snapshot = this.questionPage$.value;
    if (!snapshot) return;

    const targetQuestion = snapshot.data.find((question) => question.id === questionId);
    if (!targetQuestion) return;

    this.updateQuestion(questionId, (question) => ({ ...question, isRevision: !question.isRevision }));

    this.progressService.toggleRevision(questionId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (state) => this.applyRemoteToggleState(questionId, state),
        error: () => this.questionPage$.next(snapshot)
      });
  }

  private updateQuestion(questionId: number, updater: (question: QuestionDto) => QuestionDto) {
    const currentPage = this.questionPage$.value;
    if (!currentPage) return;

    this.questionPage$.next({
      ...currentPage,
      data: currentPage.data.map((question) =>
        question.id === questionId ? updater(question) : question)
    });
  }

  private applyRemoteToggleState(questionId: number, state: UserProgressStateDto) {
    this.updateQuestion(questionId, (question) => ({
      ...question,
      isSolved: state.isSolved,
      isRevision: state.isRevision
    }));
  }

  private patchSummaryTransition(question: QuestionDto, previousSolved: boolean, nextSolved: boolean) {
    const summary = this.summary$.value;
    if (!summary) return;

    const delta = Number(nextSolved) - Number(previousSolved);
    if (delta === 0) return;

    const nextSummary: ProgressSummaryDto = {
      ...summary,
      totalSolved: Math.max(0, summary.totalSolved + delta)
    };

    const difficulty = this.getDifficultyLabel(question.difficulty);
    if (difficulty === 'Easy') {
      nextSummary.easySolved = Math.max(0, nextSummary.easySolved + delta);
    } else if (difficulty === 'Medium') {
      nextSummary.mediumSolved = Math.max(0, nextSummary.mediumSolved + delta);
    } else {
      nextSummary.hardSolved = Math.max(0, nextSummary.hardSolved + delta);
    }

    this.summary$.next(nextSummary);
  }

  paginationSummary(vm: {
    totalRecords: number;
    questions: QuestionDto[];
    pageNumber: number;
    pageSize: number;
  }): string {
    if (vm.totalRecords === 0) return '0 questions';

    const start = (vm.pageNumber - 1) * vm.pageSize + 1;
    const end = start + vm.questions.length - 1;
    return `${start}-${end} of ${vm.totalRecords} questions`;
  }

  pageRangeSummary(vm: {
    totalRecords: number;
    questions: QuestionDto[];
    pageNumber: number;
    pageSize: number;
  }): string {
    return `Showing ${this.paginationSummary(vm)}`;
  }

  canGoToPreviousPage(vm: { pageNumber: number }): boolean {
    return vm.pageNumber > 1;
  }

  canGoToNextPage(vm: { pageNumber: number; totalPages: number }): boolean {
    return vm.pageNumber < vm.totalPages;
  }

  goToPreviousPage(currentPage: number) {
    if (currentPage <= 1) return;
    this.pagination$.next({
      ...this.pagination$.value,
      pageNumber: currentPage - 1
    });
  }

  goToNextPage(currentPage: number, totalPages: number) {
    if (currentPage >= totalPages) return;
    this.pagination$.next({
      ...this.pagination$.value,
      pageNumber: currentPage + 1
    });
  }

  setPageSize(pageSize: number) {
    if (this.pagination$.value.pageSize === pageSize) return;
    this.pagination$.next({
      pageNumber: 1,
      pageSize
    });
  }

  private getDifficultyLabel(value: QuestionDto['difficulty']): 'Easy' | 'Medium' | 'Hard' {
    const difficultyMap: Record<string, 'Easy' | 'Medium' | 'Hard'> = {
      '0': 'Easy', Easy: 'Easy',
      '1': 'Medium', Medium: 'Medium',
      '2': 'Hard', Hard: 'Hard'
    };
    return difficultyMap[String(value)] ?? 'Medium';
  }

  private findRootCategory(categories: CategoryTreeDto[], selectedCategoryId: number | null): CategoryTreeDto | null {
    if (selectedCategoryId === null) return null;
    return categories.find((category) =>
      category.id === selectedCategoryId || this.findCategory(category.subCategories, selectedCategoryId)) ?? null;
  }

  private findCategory(categories: CategoryTreeDto[], targetId: number | null): CategoryTreeDto | null {
    if (targetId === null) return null;
    for (const category of categories) {
      if (category.id === targetId) return category;
      const match = this.findCategory(category.subCategories, targetId);
      if (match) return match;
    }
    return null;
  }
}

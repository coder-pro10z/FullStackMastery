import { AsyncPipe, NgIf } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject, combineLatest, map, switchMap } from 'rxjs';
import { CategoryTreeDto } from '../../../core/models/category.models';
import { ProgressSummaryDto, UserProgressStateDto } from '../../../core/models/progress.models';
import { QuestionDto, QuestionQueryParams } from '../../../core/models/question.models';
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
  imports: [AsyncPipe, NgIf, FilterBarComponent, ProgressCardComponent, SubCategoryNavComponent, QuestionTableComponent],
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
        @if (vm.questions.length > 0) {
          <span class="text-xs text-slate-500 bg-dark-surface-light px-3 py-1.5 rounded-lg hidden sm:block">
            {{ vm.questions.length }} question{{ vm.questions.length === 1 ? '' : 's' }}
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
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardPageComponent {
  private readonly destroyRef = inject(DestroyRef);
  private readonly route = inject(ActivatedRoute);
  private readonly categoryService = inject(CategoryService);
  private readonly progressService = inject(ProgressService);
  private readonly questionService = inject(QuestionService);

  activeFilters: QuestionQueryParams = {};
  readonly loading = signal(true);

  private readonly filters$ = new BehaviorSubject<QuestionQueryParams>({});
  private readonly summary$ = new BehaviorSubject<ProgressSummaryDto | null>(null);
  private readonly questions$ = new BehaviorSubject<QuestionDto[]>([]);
  private readonly categories$ = new BehaviorSubject<CategoryTreeDto[]>([]);

  private readonly selectedCategoryId$ = this.route.queryParamMap.pipe(
    map((queryParams) => {
      const rawCategoryId = queryParams.get('categoryId');
      if (!rawCategoryId) return null;
      const categoryId = Number(rawCategoryId);
      return Number.isNaN(categoryId) ? null : categoryId;
    })
  );

  private readonly loadQuestions$ = combineLatest([this.selectedCategoryId$, this.filters$]).pipe(
    switchMap(([categoryId, filters]) =>
      this.questionService.getQuestions({
        pageNumber: 1,
        pageSize: 10,
        ...filters,
        ...(categoryId ? { categoryId } : {})
      })
    )
  );

  readonly vm$ = combineLatest([
    this.summary$,
    this.questions$,
    this.categories$,
    this.selectedCategoryId$
  ]).pipe(
    map(([summary, questions, categories, selectedCategoryId]) => {
      const selectedRootCategory = this.findRootCategory(categories, selectedCategoryId);
      const selectedCategory = this.findCategory(categories, selectedCategoryId);

      return {
        summary,
        questions,
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
        this.questions$.next(response.data);
        this.loading.set(false);
      });
  }

  updateFilters(filters: QuestionQueryParams) {
    this.activeFilters = filters;
    this.loading.set(true);
    this.filters$.next(filters);
  }

  toggleSolved(questionId: number) {
    const snapshot = this.questions$.value;
    const targetQuestion = snapshot.find((question) => question.id === questionId);
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
          this.questions$.next(snapshot);
          this.summary$.next(summarySnapshot);
        }
      });
  }

  toggleRevision(questionId: number) {
    const snapshot = this.questions$.value;
    const targetQuestion = snapshot.find((question) => question.id === questionId);
    if (!targetQuestion) return;

    this.updateQuestion(questionId, (question) => ({ ...question, isRevision: !question.isRevision }));

    this.progressService.toggleRevision(questionId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (state) => this.applyRemoteToggleState(questionId, state),
        error: () => this.questions$.next(snapshot)
      });
  }

  private updateQuestion(questionId: number, updater: (question: QuestionDto) => QuestionDto) {
    this.questions$.next(
      this.questions$.value.map((question) =>
        question.id === questionId ? updater(question) : question)
    );
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

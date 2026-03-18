import { AsyncPipe, NgIf } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, inject } from '@angular/core';
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
    <div class="dashboard-stack" *ngIf="vm$ | async as vm">
      <section class="page-header">
        <h1>Interview Dashboard</h1>
        <p>
          @if (vm.selectedCategoryName) {
            Viewing <strong>{{ vm.selectedCategoryName }}</strong> questions.
          } @else {
            Filter questions, review answers, and keep your revision queue moving.
          }
        </p>
      </section>

      <section class="card-grid">
        <app-progress-card label="Solved" [solved]="vm.summary?.totalSolved ?? 0" [total]="vm.summary?.totalQuestions ?? 0" />
        <app-progress-card label="Easy" [solved]="vm.summary?.easySolved ?? 0" [total]="vm.summary?.easyTotal ?? 0" />
        <app-progress-card label="Medium" [solved]="vm.summary?.mediumSolved ?? 0" [total]="vm.summary?.mediumTotal ?? 0" />
        <app-progress-card label="Hard" [solved]="vm.summary?.hardSolved ?? 0" [total]="vm.summary?.hardTotal ?? 0" />
      </section>

      <app-sub-category-nav
        [rootCategory]="vm.selectedRootCategory"
        [selectedCategoryId]="vm.selectedCategoryId" />

      <app-filter-bar
        [roles]="vm.roles"
        [searchTerm]="activeFilters.searchTerm ?? ''"
        [difficulty]="activeFilters.difficulty ?? ''"
        [role]="activeFilters.role ?? ''"
        (filtersChanged)="updateFilters($event)" />

      <app-question-table
        [questions]="vm.questions"
        (solvedToggled)="toggleSolved($event)"
        (revisionToggled)="toggleRevision($event)" />
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
  private readonly filters$ = new BehaviorSubject<QuestionQueryParams>({});
  private readonly summary$ = new BehaviorSubject<ProgressSummaryDto | null>(null);
  private readonly questions$ = new BehaviorSubject<QuestionDto[]>([]);
  private readonly categories$ = new BehaviorSubject<CategoryTreeDto[]>([]);

  private readonly selectedCategoryId$ = this.route.queryParamMap.pipe(
    map((queryParams) => {
      const rawCategoryId = queryParams.get('categoryId');

      if (!rawCategoryId) {
        return null;
      }

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
      .subscribe((response) => this.questions$.next(response.data));
  }

  updateFilters(filters: QuestionQueryParams) {
    this.activeFilters = filters;
    this.filters$.next(filters);
  }

  toggleSolved(questionId: number) {
    const snapshot = this.questions$.value;
    const targetQuestion = snapshot.find((question) => question.id === questionId);

    if (!targetQuestion) {
      return;
    }

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

    if (!targetQuestion) {
      return;
    }

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

    if (!summary) {
      return;
    }

    const delta = Number(nextSolved) - Number(previousSolved);

    if (delta === 0) {
      return;
    }

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
      '0': 'Easy',
      Easy: 'Easy',
      '1': 'Medium',
      Medium: 'Medium',
      '2': 'Hard',
      Hard: 'Hard'
    };

    return difficultyMap[String(value)] ?? 'Medium';
  }
  private findRootCategory(categories: CategoryTreeDto[], selectedCategoryId: number | null): CategoryTreeDto | null {
    if (selectedCategoryId === null) {
      return null;
    }

    return categories.find((category) =>
      category.id === selectedCategoryId || this.findCategory(category.subCategories, selectedCategoryId)) ?? null;
  }

  private findCategory(categories: CategoryTreeDto[], targetId: number | null): CategoryTreeDto | null {
    if (targetId === null) {
      return null;
    }

    for (const category of categories) {
      if (category.id === targetId) {
        return category;
      }

      const match = this.findCategory(category.subCategories, targetId);
      if (match) {
        return match;
      }
    }

    return null;
  }
}

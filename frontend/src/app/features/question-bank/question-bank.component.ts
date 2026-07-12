import { AsyncPipe, NgClass, NgIf, SlicePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject, combineLatest, map, switchMap, tap } from 'rxjs';
import { LucideAngularModule } from 'lucide-angular';

import { UserProgressStateDto } from '../../core/models/progress.models';
import { PagedResponse, QuestionDto, QuestionQueryParams, Difficulty } from '../../core/models/question.models';
import { ProgressService } from '../../core/services/progress.service';
import { QuestionService } from '../../core/services/question.service';

import { ActionToggleComponent } from '../../shared/components/action-toggle/action-toggle.component';
import { FilterBarComponent } from '../../shared/components/filter-bar/filter-bar.component';
import { QuestionBadgeComponent } from '../../shared/components/question-badge/question-badge.component';

@Component({
  selector: 'app-question-bank',
  standalone: true,
  imports: [
    AsyncPipe, NgClass, NgIf, SlicePipe, LucideAngularModule,
    ActionToggleComponent, FilterBarComponent, QuestionBadgeComponent
  ],
  animations: [
    trigger('expandCollapse', [
      state('collapsed', style({ height: '0px', opacity: 0, marginTop: '0px' })),
      state('expanded', style({ height: '*', opacity: 1, marginTop: '1.25rem' })),
      transition('collapsed <=> expanded', [
        animate('400ms cubic-bezier(0.4, 0, 0.2, 1)')
      ])
    ]),
    trigger('listAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('500ms 100ms cubic-bezier(0.4, 0, 0.2, 1)', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ])
  ],
  templateUrl: './question-bank.component.html',
  styleUrl: './question-bank.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class QuestionBankComponent {
  readonly pageSizeOptions = [12, 24, 48];

  private readonly destroyRef = inject(DestroyRef);
  private readonly route = inject(ActivatedRoute);
  private readonly questionService = inject(QuestionService);
  private readonly progressService = inject(ProgressService);

  activeFilters: QuestionQueryParams = {};
  readonly loading = signal(true);

  private readonly filters$ = new BehaviorSubject<QuestionQueryParams>({});
  private readonly questionPage$ = new BehaviorSubject<PagedResponse<QuestionDto> | null>(null);
  private readonly pagination$ = new BehaviorSubject<{ pageNumber: number; pageSize: number }>({
    pageNumber: 1,
    pageSize: 12
  });

  expandedQuestionId: number | null = null;

  private readonly selectedCategoryId$ = this.route.queryParamMap.pipe(
    map(queryParams => {
      const raw = queryParams.get('categoryId');
      if (!raw) return null;
      const id = Number(raw);
      return Number.isNaN(id) ? null : id;
    })
  );

  private readonly loadQuestions$ = combineLatest([
    this.selectedCategoryId$,
    this.filters$,
    this.pagination$
  ]).pipe(
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
    this.questionPage$,
    this.selectedCategoryId$
  ]).pipe(
    map(([questionPage, selectedCategoryId]) => {
      const questions = questionPage?.data ?? [];
      return {
        questions,
        totalRecords: questionPage?.totalRecords ?? 0,
        pageNumber: questionPage?.pageNumber ?? 1,
        pageSize: questionPage?.pageSize ?? this.pagination$.value.pageSize,
        totalPages: questionPage?.totalPages ?? 0,
        selectedCategoryId,
        roles: [...new Set(questions.map(q => q.role))].sort()
      };
    })
  );

  constructor() {
    this.loadQuestions$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(response => {
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

  setPageSize(pageSize: number) {
    if (this.pagination$.value.pageSize === pageSize) return;
    this.pagination$.next({
      pageNumber: 1,
      pageSize
    });
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

  canGoToPreviousPage(vm: { pageNumber: number }): boolean {
    return vm.pageNumber > 1;
  }

  canGoToNextPage(vm: { pageNumber: number; totalPages: number }): boolean {
    return vm.pageNumber < vm.totalPages;
  }

  paginationSummary(vm: { totalRecords: number; questions: QuestionDto[]; pageNumber: number; pageSize: number }): string {
    if (vm.totalRecords === 0) return '0 questions';
    const start = (vm.pageNumber - 1) * vm.pageSize + 1;
    const end = start + vm.questions.length - 1;
    return `${start}-${end} of ${vm.totalRecords} questions`;
  }

  toggleSolved(questionId: number) {
    const snapshot = this.questionPage$.value;
    if (!snapshot) return;

    const target = snapshot.data.find(q => q.id === questionId);
    if (!target) return;

    const nextSolved = !target.isSolved;
    this.updateQuestion(questionId, q => ({ ...q, isSolved: nextSolved }));

    this.progressService.toggleSolved(questionId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (state) => this.applyRemoteToggleState(questionId, state),
        error: () => this.questionPage$.next(snapshot)
      });
  }

  toggleRevision(questionId: number) {
    const snapshot = this.questionPage$.value;
    if (!snapshot) return;

    const target = snapshot.data.find(q => q.id === questionId);
    if (!target) return;

    this.updateQuestion(questionId, q => ({ ...q, isRevision: !q.isRevision }));

    this.progressService.toggleRevision(questionId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (state) => this.applyRemoteToggleState(questionId, state),
        error: () => this.questionPage$.next(snapshot)
      });
  }

  toggleAnswer(questionId: number) {
    this.expandedQuestionId = this.expandedQuestionId === questionId ? null : questionId;
  }

  private updateQuestion(questionId: number, updater: (q: QuestionDto) => QuestionDto) {
    const currentPage = this.questionPage$.value;
    if (!currentPage) return;
    this.questionPage$.next({
      ...currentPage,
      data: currentPage.data.map(q => q.id === questionId ? updater(q) : q)
    });
  }

  private applyRemoteToggleState(questionId: number, state: UserProgressStateDto) {
    this.updateQuestion(questionId, q => ({
      ...q,
      isSolved: state.isSolved,
      isRevision: state.isRevision
    }));
  }
}

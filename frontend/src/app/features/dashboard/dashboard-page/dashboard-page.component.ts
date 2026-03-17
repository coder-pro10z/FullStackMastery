import { AsyncPipe, NgIf } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { combineLatest, map, startWith, switchMap } from 'rxjs';
import { ProgressService } from '../../../core/services/progress.service';
import { QuestionService } from '../../../core/services/question.service';
import { QuestionTableComponent } from '../components/question-table/question-table.component';

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [AsyncPipe, NgIf, QuestionTableComponent],
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
        <article class="panel summary-card">
          <span class="muted">Solved</span>
          <strong>{{ vm.summary?.totalSolved ?? 0 }}/{{ vm.summary?.totalQuestions ?? 0 }}</strong>
        </article>

        <article class="panel summary-card">
          <span class="muted">Easy</span>
          <strong>{{ vm.summary?.easySolved ?? 0 }}/{{ vm.summary?.easyTotal ?? 0 }}</strong>
        </article>

        <article class="panel summary-card">
          <span class="muted">Medium</span>
          <strong>{{ vm.summary?.mediumSolved ?? 0 }}/{{ vm.summary?.mediumTotal ?? 0 }}</strong>
        </article>

        <article class="panel summary-card">
          <span class="muted">Hard</span>
          <strong>{{ vm.summary?.hardSolved ?? 0 }}/{{ vm.summary?.hardTotal ?? 0 }}</strong>
        </article>
      </section>

      <app-question-table [questions]="vm.questions" />
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardPageComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly progressService = inject(ProgressService);
  private readonly questionService = inject(QuestionService);

  private readonly selectedCategoryId$ = this.route.queryParamMap.pipe(
    map((queryParams) => {
      const rawCategoryId = queryParams.get('categoryId');

      if (!rawCategoryId) {
        return null;
      }

      const categoryId = Number(rawCategoryId);
      return Number.isNaN(categoryId) ? null : categoryId;
    }),
    startWith(null)
  );

  private readonly questions$ = this.selectedCategoryId$.pipe(
    switchMap((categoryId) =>
      this.questionService.getQuestions({
        pageNumber: 1,
        pageSize: 10,
        ...(categoryId ? { categoryId } : {})
      }).pipe(startWith(null))
    )
  );

  readonly vm$ = combineLatest([
    this.progressService.getSummary().pipe(startWith(null)),
    this.questions$,
    this.selectedCategoryId$
  ]).pipe(
    map(([summary, questions, selectedCategoryId]) => ({
      summary,
      questions: questions?.data ?? [],
      selectedCategoryName: questions?.data.find((question) => question.categoryId === selectedCategoryId)?.categoryName ?? null
    }))
  );
}

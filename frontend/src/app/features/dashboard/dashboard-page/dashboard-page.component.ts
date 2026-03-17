import { AsyncPipe, NgIf } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { combineLatest, map, startWith } from 'rxjs';
import { ProgressService } from '../../../core/services/progress.service';
import { QuestionService } from '../../../core/services/question.service';
import { QuestionTableComponent } from '../components/question-table/question-table.component';

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [AsyncPipe, NgIf, QuestionTableComponent],
  template: `
    <section class="page-header">
      <h1>Interview Dashboard</h1>
      <p>Filter questions, review answers, and keep your revision queue moving.</p>
    </section>

    <section class="card-grid" *ngIf="vm$ | async as vm">
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

    <app-question-table [questions]="(vm$ | async)?.questions ?? []" />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardPageComponent {
  private readonly progressService = inject(ProgressService);
  private readonly questionService = inject(QuestionService);

  readonly vm$ = combineLatest([
    this.progressService.getSummary().pipe(startWith(null)),
    this.questionService.getQuestions({ pageNumber: 1, pageSize: 10 }).pipe(startWith(null))
  ]).pipe(
    map(([summary, questions]) => ({
      summary,
      questions: questions?.data ?? []
    }))
  );
}

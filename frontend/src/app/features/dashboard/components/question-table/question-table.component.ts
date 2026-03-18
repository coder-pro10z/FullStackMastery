import { NgFor, NgIf } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { QuestionDto } from '../../../../core/models/question.models';
import { ActionToggleComponent } from '../../../../shared/components/action-toggle/action-toggle.component';
import { QuestionBadgeComponent } from '../../../../shared/components/question-badge/question-badge.component';

@Component({
  selector: 'app-question-table',
  standalone: true,
  imports: [NgFor, NgIf, ActionToggleComponent, QuestionBadgeComponent],
  template: `
    <section class="panel table-card">
      <table class="question-table-desktop">
        <thead>
          <tr>
            <th>Question</th>
            <th>Role</th>
            <th>Difficulty</th>
            <th>Category</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          <tr *ngFor="let question of questions; trackBy: trackByQuestion">
            <td>
              <strong>{{ question.title || 'Untitled question' }}</strong>
              <div class="muted">{{ question.questionText }}</div>
              <div class="answer-snippet" *ngIf="question.answerText">{{ question.answerText }}</div>
            </td>
            <td><app-question-badge [label]="question.role" variant="Role" /></td>
            <td><app-question-badge [label]="difficultyLabel(question.difficulty)" [variant]="difficultyLabel(question.difficulty)" /></td>
            <td>{{ question.categoryName }}</td>
            <td>
              <div class="table-actions">
                <app-action-toggle
                  label="Solved"
                  [active]="question.isSolved"
                  (toggled)="solvedToggled.emit(question.id)" />
                <app-action-toggle
                  label="Revision"
                  [active]="question.isRevision"
                  (toggled)="revisionToggled.emit(question.id)" />
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <div class="question-table-mobile">
        <article class="mobile-question-card" *ngFor="let question of questions; trackBy: trackByQuestion">
          <div class="mobile-question-top">
            <div>
              <strong>{{ question.title || 'Untitled question' }}</strong>
              <div class="muted">{{ question.questionText }}</div>
            </div>

            <app-question-badge [label]="difficultyLabel(question.difficulty)" [variant]="difficultyLabel(question.difficulty)" />
          </div>

          <div class="mobile-question-meta">
            <app-question-badge [label]="question.role" variant="Role" />
            <span class="muted">{{ question.categoryName }}</span>
          </div>

          <div class="answer-snippet" *ngIf="question.answerText">{{ question.answerText }}</div>

          <div class="table-actions">
            <app-action-toggle
              label="Solved"
              [active]="question.isSolved"
              (toggled)="solvedToggled.emit(question.id)" />
            <app-action-toggle
              label="Revision"
              [active]="question.isRevision"
              (toggled)="revisionToggled.emit(question.id)" />
          </div>
        </article>
      </div>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class QuestionTableComponent {
  @Input({ required: true }) questions: QuestionDto[] = [];
  @Output() solvedToggled = new EventEmitter<number>();
  @Output() revisionToggled = new EventEmitter<number>();
  private readonly difficultyMap: Record<string, 'Easy' | 'Medium' | 'Hard'> = {
    '0': 'Easy',
    Easy: 'Easy',
    '1': 'Medium',
    Medium: 'Medium',
    '2': 'Hard',
    Hard: 'Hard'
  };

  trackByQuestion(_index: number, question: QuestionDto): number {
    return question.id;
  }

  difficultyLabel(value: QuestionDto['difficulty']): 'Easy' | 'Medium' | 'Hard' {
    return this.difficultyMap[String(value)] ?? 'Medium';
  }
}

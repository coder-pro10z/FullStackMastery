import { NgFor } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { QuestionDto } from '../../../../core/models/question.models';

@Component({
  selector: 'app-question-table',
  standalone: true,
  imports: [NgFor],
  template: `
    <section class="panel table-card">
      <table>
        <thead>
          <tr>
            <th>Question</th>
            <th>Role</th>
            <th>Difficulty</th>
            <th>Category</th>
          </tr>
        </thead>

        <tbody>
          <tr *ngFor="let question of questions">
            <td>
              <strong>{{ question.title || 'Untitled question' }}</strong>
              <div class="muted">{{ question.questionText }}</div>
            </td>
            <td><span class="badge">{{ question.role }}</span></td>
            <td>{{ question.difficulty }}</td>
            <td>{{ question.categoryName }}</td>
          </tr>
        </tbody>
      </table>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class QuestionTableComponent {
  @Input({ required: true }) questions: QuestionDto[] = [];
}

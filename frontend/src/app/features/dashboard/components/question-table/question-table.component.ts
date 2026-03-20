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
    <div class="space-y-3">
      <article
        *ngFor="let question of questions; trackBy: trackByQuestion"
        class="glass-panel-interactive group animate-slide-up">

        <!-- Card Content -->
        <div class="p-4 lg:p-5">
          <!-- Top Row: Title + Badges -->
          <div class="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-2">
            <div class="flex-1 min-w-0">
              <!-- Title -->
              <h3 class="text-sm font-semibold text-white group-hover:text-accent-blue transition-colors duration-150 leading-snug">
                {{ question.title || 'Untitled Question' }}
              </h3>
              <!-- Category -->
              <span class="text-[11px] text-slate-600 mt-0.5 block">{{ question.categoryName }}</span>
            </div>

            <!-- Badges -->
            <div class="flex items-center gap-1.5 flex-shrink-0">
              <app-question-badge [label]="question.role" variant="Role" />
              <app-question-badge
                [label]="difficultyLabel(question.difficulty)"
                [variant]="difficultyLabel(question.difficulty)" />
            </div>
          </div>

          <!-- Question Text -->
          <p class="text-sm text-slate-400 leading-relaxed line-clamp-2 mb-3">
            {{ question.questionText }}
          </p>

          <!-- Bottom Row: Actions + Show Answer -->
          <div class="flex items-center justify-between gap-3">
            <!-- Action toggles -->
            <div class="flex items-center gap-2">
              <app-action-toggle
                label="Solved"
                icon="solved"
                [active]="question.isSolved"
                (toggled)="solvedToggled.emit(question.id)" />
              <app-action-toggle
                label="Revision"
                icon="bookmark"
                [active]="question.isRevision"
                (toggled)="revisionToggled.emit(question.id)" />
            </div>

            <!-- Expand Answer Button -->
            <button
              *ngIf="question.answerText"
              class="btn-ghost text-xs gap-1"
              (click)="toggleAnswer(question.id)">
              <svg
                class="w-3.5 h-3.5 transition-transform duration-200"
                [class.rotate-180]="expandedQuestionId === question.id"
                fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
              {{ expandedQuestionId === question.id ? 'Hide' : 'Show' }} Answer
            </button>
          </div>
        </div>

        <!-- Accordion Answer -->
        <div
          *ngIf="question.answerText"
          class="accordion-content"
          [class.expanded]="expandedQuestionId === question.id">
          <div class="accordion-inner">
            <div class="px-4 lg:px-5 pb-4 lg:pb-5 pt-0">
              <div class="border-t border-dark-border-light/50 pt-4">
                <div class="flex items-center gap-2 mb-2">
                  <svg class="w-3.5 h-3.5 text-accent-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  <span class="text-xs font-semibold text-accent-blue uppercase tracking-wider">Answer</span>
                </div>
                <p class="text-sm text-slate-300 leading-relaxed whitespace-pre-line">{{ question.answerText }}</p>
              </div>
            </div>
          </div>
        </div>
      </article>
    </div>
  `,
  styles: [`
    .line-clamp-2 {
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class QuestionTableComponent {
  @Input({ required: true }) questions: QuestionDto[] = [];
  @Output() solvedToggled = new EventEmitter<number>();
  @Output() revisionToggled = new EventEmitter<number>();

  expandedQuestionId: number | null = null;

  private readonly difficultyMap: Record<string, 'Easy' | 'Medium' | 'Hard'> = {
    '0': 'Easy', Easy: 'Easy',
    '1': 'Medium', Medium: 'Medium',
    '2': 'Hard', Hard: 'Hard'
  };

  trackByQuestion(_index: number, question: QuestionDto): number {
    return question.id;
  }

  difficultyLabel(value: QuestionDto['difficulty']): 'Easy' | 'Medium' | 'Hard' {
    return this.difficultyMap[String(value)] ?? 'Medium';
  }

  toggleAnswer(questionId: number) {
    this.expandedQuestionId = this.expandedQuestionId === questionId ? null : questionId;
  }
}

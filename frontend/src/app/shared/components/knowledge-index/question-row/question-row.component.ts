import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';
import { IndexNode } from '../../../../core/models/knowledge-index.models';
import { Difficulty } from '../../../../core/models/question.models';

const DIFFICULTY_STYLES: Record<Difficulty, string> = {
  Easy:   'bg-emerald-50 text-emerald-700 border-emerald-200',
  Medium: 'bg-amber-50 text-amber-700 border-amber-200',
  Hard:   'bg-rose-50 text-rose-700 border-rose-200',
};

const DIFFICULTY_DOT: Record<Difficulty, string> = {
  Easy:   'bg-emerald-500',
  Medium: 'bg-amber-500',
  Hard:   'bg-rose-500',
};

@Component({
  selector: 'app-question-row',
  standalone: true,
  imports: [LucideAngularModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [`:host { display: block; }`],
  template: `
    <div
      class="flex items-start gap-3 px-4 py-3.5 border border-transparent rounded-xl cursor-pointer group
             hover:bg-slate-50 hover:border-slate-200 transition-all duration-150"
      [class.bg-blue-50]="isSelected()"
      [class.border-blue-200]="isSelected()"
      (click)="selected.emit(question())"
      role="option"
      [attr.aria-selected]="isSelected()"
    >
      <!-- Status Dot -->
      <div class="flex-shrink-0 mt-1.5">
        @if (question().isSolved) {
          <lucide-icon name="check-circle-2" [size]="16" class="text-emerald-500" />
        } @else {
          <div class="w-4 h-4 rounded-full border-2 border-slate-300 group-hover:border-slate-400 transition-colors"></div>
        }
      </div>

      <!-- Question Info -->
      <div class="flex-1 min-w-0">
        <p class="text-sm font-medium text-[#202124] truncate leading-snug group-hover:text-blue-700 transition-colors">
          {{ question().label }}
        </p>
        @if (question().parentIds.length > 0) {
          <p class="text-[11px] text-[#5F6368] mt-0.5 truncate">
            {{ breadcrumb() }}
          </p>
        }
      </div>

      <!-- Right Side Badges -->
      <div class="flex items-center gap-1.5 flex-shrink-0">
        @if (question().difficulty) {
          <span class="text-[10px] px-2 py-0.5 rounded-full border font-medium"
                [class]="difficultyStyle(question().difficulty!)">
            {{ question().difficulty }}
          </span>
        }
        @if (question().isRevision) {
          <lucide-icon name="star" [size]="13" class="text-amber-400 fill-amber-400" />
        }
      </div>
    </div>
  `
})
export class QuestionRowComponent {
  readonly question = input.required<IndexNode>();
  readonly isSelected = input<boolean>(false);
  readonly breadcrumbLabels = input<string[]>([]);

  readonly selected = output<IndexNode>();

  get breadcrumb(): () => string {
    return () => this.breadcrumbLabels().join(' > ') || '';
  }

  difficultyStyle(diff: Difficulty): string {
    return DIFFICULTY_STYLES[diff] ?? '';
  }
}

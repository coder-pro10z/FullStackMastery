import { Component, Input, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { RelatedQuestionReference } from '../../../../../core/models/answer-sheet.models';
import { AnswerSheetService } from '../../../../../core/services/answer-sheet.service';

@Component({
  selector: 'app-related-questions-card',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (questions && questions.length > 0) {
      <div class="my-6 p-4 rounded-2xl border border-indigo-200/80 bg-gradient-to-br from-indigo-50/60 via-slate-50 to-white shadow-xs">
        <!-- Header -->
        <div class="flex items-center justify-between mb-3">
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-xs">
              <lucide-icon name="book-open" [size]="16" />
            </div>
            <div>
              <h3 class="text-xs font-bold text-slate-900 uppercase tracking-wider">Related Question Bank Questions</h3>
              <p class="text-[11px] text-slate-500 font-medium">
                Practice pre-existing questions mapped to this competency topic.
              </p>
            </div>
          </div>
          <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 border border-indigo-200">
            {{ questions.length }} Linked
          </span>
        </div>

        <!-- Question Cards Grid -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          @for (q of questions; track q.id) {
            <div
              (click)="navigateToQuestion(q.id)"
              class="p-3 rounded-xl border border-slate-200 bg-white hover:border-indigo-400 hover:shadow-md transition-all cursor-pointer select-none group flex flex-col justify-between"
            >
              <div>
                <div class="flex items-center justify-between gap-2 mb-1.5">
                  <!-- Category Badge -->
                  <span class="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                    {{ q.categoryName }}
                  </span>

                  <!-- Difficulty Badge -->
                  <span
                    class="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full border"
                    [class]="getDifficultyClass(q.difficulty)"
                  >
                    {{ q.difficulty }}
                  </span>
                </div>

                <!-- Title -->
                <h4 class="text-xs font-semibold text-slate-800 group-hover:text-indigo-600 transition-colors leading-snug">
                  #{{ q.id }}: {{ q.title }}
                </h4>
              </div>

              <!-- Action Link Footer -->
              <div class="flex items-center justify-end gap-1 mt-2.5 text-[10px] font-bold uppercase tracking-wider text-indigo-600 group-hover:translate-x-0.5 transition-transform">
                <span>Practice in Question Bank</span>
                <lucide-icon name="external-link" [size]="11" />
              </div>
            </div>
          }
        </div>
      </div>
    }
  `,
  styles: [`
    :host { display: block; width: 100%; }
  `]
})
export class RelatedQuestionsCardComponent {
  @Input() questions?: RelatedQuestionReference[];

  private readonly router = inject(Router);
  private readonly sheetService = inject(AnswerSheetService);

  getDifficultyClass(diff: 'Easy' | 'Medium' | 'Hard'): string {
    switch (diff) {
      case 'Easy': return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'Hard': return 'bg-rose-100 text-rose-800 border-rose-300';
      default: return 'bg-amber-100 text-amber-800 border-amber-300';
    }
  }

  navigateToQuestion(questionId: number) {
    this.sheetService.close();
    this.router.navigate(['/question-bank'], { queryParams: { questionId } });
  }
}

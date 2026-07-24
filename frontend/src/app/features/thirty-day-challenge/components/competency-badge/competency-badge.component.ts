import { ChangeDetectionStrategy, Component, Input, inject } from '@angular/core';
import { CATEGORY_COLORS, CATEGORY_LABELS, CompetencyCategory, CompetencyModel } from '../../../../core/models/challenge.models';
import { AnswerSheetService } from '../../../../core/services/answer-sheet.service';
import { CompetencyProgressService } from '../../../../core/services/competency-progress.service';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-competency-badge',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LucideAngularModule],
  template: `
    @if (showTitle) {
      <div
        class="group relative flex flex-col justify-between p-3.5 my-0.5 rounded-2xl text-xs font-medium w-full h-full
               border transition-all duration-300 hover:shadow-md cursor-pointer select-none overflow-hidden"
        [class]="isCompleted 
          ? 'bg-gradient-to-br from-emerald-50/90 to-teal-50/70 border-emerald-300/90 shadow-sm text-emerald-950' 
          : badgeClasses"
        [title]="'View Answer Sheet for ' + competency.title"
        (click)="onBadgeClick($event)"
      >
        <!-- Top Row: Custom Mastered Toggle Icon + Top-Right ID Badge -->
        <div class="flex items-center justify-between gap-2 mb-2">
          <!-- Premium Custom Completion Toggle Button -->
          <div
            (click)="onCheckboxClick($event)"
            [title]="isCompleted ? 'Topic is Mastered (Click to undo)' : 'Click to Mark Topic as Mastered'"
            class="flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all duration-200 cursor-pointer shadow-2xs"
            [class]="isCompleted 
              ? 'bg-emerald-600 text-white hover:bg-emerald-700' 
              : 'bg-white/90 border border-slate-300/80 text-slate-600 hover:border-emerald-500 hover:text-emerald-700'"
          >
            <div
              class="w-3.5 h-3.5 rounded flex items-center justify-center transition-all duration-200"
              [class]="isCompleted ? 'bg-white text-emerald-700' : 'border border-slate-400 group-hover:border-emerald-600'"
            >
              @if (isCompleted) {
                <lucide-icon name="check" [size]="11" strokeWidth="3" />
              } @else {
                <span class="w-1 h-1 rounded-full flex-shrink-0" [class]="dotClass"></span>
              }
            </div>
            <span class="text-[10px] font-bold tracking-wider uppercase">
              {{ isCompleted ? 'Mastered' : 'Mark Topic' }}
            </span>
          </div>

          <!-- Top-Right Competency ID Badge -->
          <span class="font-mono font-bold uppercase px-2 py-0.5 rounded-md text-[11px] border tracking-wider shadow-2xs"
                [class]="isCompleted 
                  ? 'bg-emerald-200/80 text-emerald-900 border-emerald-300' 
                  : 'bg-white/90 text-slate-700 border-slate-200/80'">
            {{ competency.competencyId }}
          </span>
        </div>

        <!-- Middle Body: Title Text -->
        <p class="font-semibold text-xs leading-relaxed flex-1 my-1"
           [class]="isCompleted ? 'text-emerald-950 font-bold' : 'text-slate-800'">
          {{ competency.title }}
        </p>

        <!-- Bottom Action CTA Row -->
        <div class="flex items-center justify-end gap-1 mt-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 group-hover:text-blue-600 transition-colors">
          <span>Answer Sheet</span>
          <lucide-icon name="arrow-right" [size]="11" />
        </div>
      </div>
    } @else {
      <span
        class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold
               border transition-all duration-200 hover:scale-105 cursor-pointer select-none"
        [class]="isCompleted ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : badgeClasses"
        [title]="competency.competencyId + ': ' + competency.title + (isCompleted ? ' (Mastered)' : '')"
        (click)="onBadgeClick($event)"
      >
        @if (isCompleted) {
          <lucide-icon name="check" [size]="10" class="text-emerald-700" />
        } @else {
          <span class="w-1.5 h-1.5 rounded-full flex-shrink-0" [class]="dotClass"></span>
        }
        {{ competency.competencyId }}
      </span>
    }
  `,
  styles: [`
    :host { display: block; height: 100%; }
  `]
})
export class CompetencyBadgeComponent {
  @Input({ required: true }) competency!: CompetencyModel;
  @Input() showTitle = false;

  sheetService = inject(AnswerSheetService);
  progressService = inject(CompetencyProgressService);

  get isCompleted(): boolean {
    return this.progressService.isCompleted(this.competency.competencyId);
  }

  get cat(): CompetencyCategory { return this.competency.category as CompetencyCategory; }
  get colors() { return CATEGORY_COLORS[this.cat] ?? CATEGORY_COLORS['CSharpCore']; }
  get badgeClasses(): string {
    const c = this.colors;
    return `${c.bg} ${c.text} ${c.border}`;
  }
  get dotClass(): string { return this.colors.dot; }

  onBadgeClick(event: MouseEvent): void {
    event.stopPropagation();
    this.sheetService.openSheet(this.competency.competencyId);
  }

  onCheckboxClick(event: MouseEvent): void {
    event.stopPropagation();
    this.progressService.toggleCompetency(this.competency.competencyId);
  }
}

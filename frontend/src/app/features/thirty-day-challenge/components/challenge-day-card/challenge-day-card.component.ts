import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
  signal,
} from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';
import { CATEGORY_COLORS, CATEGORY_LABELS, ChallengeDayModel, CompetencyModel } from '../../../../core/models/challenge.models';
import { CompetencyBadgeComponent } from '../competency-badge/competency-badge.component';

@Component({
  selector: 'app-challenge-day-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LucideAngularModule, CompetencyBadgeComponent],
  template: `
    <div
      class="group relative bg-white border rounded-2xl transition-all duration-300 ease-out overflow-hidden"
      [class.border-emerald-200]="day.isCompleted"
      [class.shadow-emerald-50]="day.isCompleted"
      [class.border-slate-200]="!day.isCompleted"
      [class.hover:border-blue-200]="!day.isCompleted"
      [class.shadow-sm]="true"
      [class.hover:shadow-md]="true"
    >
      <!-- Completion gradient strip -->
      <div
        class="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl transition-all duration-500"
        [class.bg-gradient-to-b]="true"
        [class.from-emerald-400]="day.isCompleted"
        [class.to-emerald-600]="day.isCompleted"
        [class.from-slate-200]="!day.isCompleted"
        [class.to-slate-300]="!day.isCompleted"
        [class.group-hover:from-blue-300]="!day.isCompleted"
        [class.group-hover:to-blue-500]="!day.isCompleted"
      ></div>

      <!-- Header row -->
      <div
        class="flex items-center gap-4 px-5 py-4 pl-6 cursor-pointer select-none"
        (click)="toggleExpanded()"
        [attr.aria-expanded]="expanded()"
        [attr.aria-controls]="'day-body-' + day.dayNumber"
      >
        <!-- Day number badge -->
        <div
          class="flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center font-bold text-sm transition-all duration-300"
          [class.bg-emerald-500]="day.isCompleted"
          [class.text-white]="day.isCompleted"
          [class.shadow-emerald-200]="day.isCompleted"
          [class.shadow-md]="day.isCompleted"
          [class.bg-slate-100]="!day.isCompleted"
          [class.text-slate-600]="!day.isCompleted"
          [class.group-hover:bg-blue-50]="!day.isCompleted"
          [class.group-hover:text-blue-700]="!day.isCompleted"
        >
          @if (day.isCompleted) {
            <lucide-icon name="check" [size]="18" />
          } @else {
            {{ day.dayNumber }}
          }
        </div>

        <!-- Title + main focus -->
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2 flex-wrap">
            <span class="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Day {{ day.dayNumber }}
            </span>
            @if (day.isCompleted) {
              <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold
                           bg-emerald-100 text-emerald-700 border border-emerald-200">
                <lucide-icon name="check-circle" [size]="10" />
                Complete
              </span>
            }
          </div>
          <h3 class="text-sm font-semibold text-slate-800 mt-0.5 truncate">{{ day.title }}</h3>
        </div>

        <!-- Competency badges (collapsed preview — show first 3) -->
        @if (!expanded()) {
          <div class="hidden sm:flex items-center gap-1.5 flex-shrink-0">
            @for (comp of day.primaryCompetencies.slice(0, 3); track comp.id) {
              <app-competency-badge [competency]="comp" />
            }
            @if (day.primaryCompetencies.length > 3) {
              <span class="text-[11px] text-slate-400 font-medium">+{{ day.primaryCompetencies.length - 3 }}</span>
            }
          </div>
        }

        <!-- Complete toggle button -->
        <button
          class="flex-shrink-0 p-2 rounded-xl transition-all duration-200 hover:scale-110 active:scale-95"
          [class.bg-emerald-50]="day.isCompleted"
          [class.text-emerald-600]="day.isCompleted"
          [class.hover:bg-emerald-100]="day.isCompleted"
          [class.bg-slate-50]="!day.isCompleted"
          [class.text-slate-400]="!day.isCompleted"
          [class.hover:bg-blue-50]="!day.isCompleted"
          [class.hover:text-blue-600]="!day.isCompleted"
          (click)="onToggleComplete($event)"
          [title]="day.isCompleted ? 'Mark incomplete' : 'Mark complete'"
          [id]="'toggle-day-' + day.dayNumber"
        >
          <lucide-icon [name]="day.isCompleted ? 'check-circle-2' : 'circle'" [size]="20" />
        </button>

        <!-- Chevron -->
        <lucide-icon
          name="chevron-down"
          [size]="16"
          class="flex-shrink-0 text-slate-400 transition-transform duration-300 ease-out"
          [class.rotate-180]="expanded()"
        />
      </div>

      <!-- Expanded body -->
      @if (expanded()) {
        <div
          [id]="'day-body-' + day.dayNumber"
          class="px-5 pb-5 pl-6 border-t border-slate-100 animate-fade-in space-y-4"
        >
          <!-- Main Focus -->
          <div class="pt-4">
            <p class="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Main Focus
            </p>
            <p class="text-sm text-slate-600 leading-relaxed">{{ day.mainFocus }}</p>
          </div>

          <!-- Primary Competencies -->
          @if (day.primaryCompetencies.length > 0) {
            <div>
              <p class="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Primary Competencies
              </p>
              <div class="flex flex-wrap gap-1.5">
                @for (comp of day.primaryCompetencies; track comp.id) {
                  <app-competency-badge [competency]="comp" />
                }
              </div>
            </div>
          }

          <!-- Secondary / SQL Competencies -->
          @if (day.secondaryCompetencies.length > 0) {
            <div>
              <p class="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                SQL Practice
              </p>
              <div class="flex flex-wrap gap-1.5">
                @for (comp of day.secondaryCompetencies; track comp.id) {
                  <app-competency-badge [competency]="comp" />
                }
              </div>
            </div>
          }

          <!-- SQL Coding Note -->
          @if (day.sqlCodingNote) {
            <div class="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl p-3">
              <lucide-icon name="code-2" [size]="15" class="text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p class="text-[11px] font-semibold text-amber-700 uppercase tracking-wider mb-0.5">SQL Challenge</p>
                <p class="text-sm text-amber-800 font-medium">{{ day.sqlCodingNote }}</p>
              </div>
            </div>
          }

          <!-- Study Tip -->
          @if (day.notes) {
            <div class="flex items-start gap-2 bg-blue-50 border border-blue-200 rounded-xl p-3">
              <lucide-icon name="lightbulb" [size]="15" class="text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p class="text-[11px] font-semibold text-blue-700 uppercase tracking-wider mb-0.5">Study Tip</p>
                <p class="text-sm text-blue-800">{{ day.notes }}</p>
              </div>
            </div>
          }

          <!-- Completion timestamp -->
          @if (day.isCompleted && day.completedAt) {
            <p class="text-xs text-emerald-600 flex items-center gap-1.5">
              <lucide-icon name="check-circle" [size]="12" />
              Completed {{ formatDate(day.completedAt) }}
            </p>
          }
        </div>
      }
    </div>
  `,
})
export class ChallengeDayCardComponent {
  @Input({ required: true }) day!: ChallengeDayModel;
  @Output() toggleComplete = new EventEmitter<{ dayNumber: number; newState: boolean }>();

  readonly expanded = signal(false);

  toggleExpanded(): void {
    this.expanded.update(v => !v);
  }

  onToggleComplete(event: Event): void {
    event.stopPropagation();
    this.toggleComplete.emit({ dayNumber: this.day.dayNumber, newState: !this.day.isCompleted });
  }

  formatDate(iso: string | null): string {
    if (!iso) return '';
    return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  }
}

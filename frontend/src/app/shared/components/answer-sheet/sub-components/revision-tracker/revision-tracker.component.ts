import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-revision-tracker',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LucideAngularModule],
  template: `
    <div class="flex flex-col gap-1.5 font-sans text-xs">
      @for (rev of reviews; track $index) {
        <div
          class="flex items-center justify-between p-1.5 rounded-lg border transition-all cursor-pointer select-none"
          [class.bg-emerald-50]="rev.completed"
          [class.border-emerald-200]="rev.completed"
          [class.bg-slate-50]="!rev.completed"
          [class.border-slate-200]="!rev.completed"
          (click)="toggleReview($index)"
        >
          <div class="flex items-center gap-2">
            <div
              class="w-4 h-4 rounded border flex items-center justify-center transition-all"
              [class.bg-emerald-500]="rev.completed"
              [class.border-emerald-600]="rev.completed"
              [class.text-white]="rev.completed"
              [class.bg-white]="!rev.completed"
              [class.border-slate-300]="!rev.completed"
            >
              @if (rev.completed) {
                <lucide-icon name="check" [size]="12" />
              }
            </div>
            <span class="font-medium text-slate-700 text-[11px]">{{ rev.stage }}</span>
          </div>

          <span class="font-mono text-[10px] text-slate-400">
            {{ rev.date || '-- / -- / ----' }}
          </span>
        </div>
      }
    </div>
  `
})
export class RevisionTrackerComponent {
  @Input({ required: true }) reviews!: { stage: '1st Review' | '2nd Review' | '3rd Review'; date?: string; completed: boolean }[];
  @Output() reviewToggle = new EventEmitter<number>();

  toggleReview(index: number): void {
    this.reviewToggle.emit(index);
  }
}

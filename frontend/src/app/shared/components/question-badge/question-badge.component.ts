import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'app-question-badge',
  standalone: true,
  template: `
    <span class="badge" [class]="badgeClass">
      {{ label }}
    </span>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class QuestionBadgeComponent {
  @Input({ required: true }) label = '';
  @Input() variant: 'Easy' | 'Medium' | 'Hard' | 'Role' = 'Role';

  get badgeClass(): string {
    const map: Record<string, string> = {
      'Easy': 'bg-green-100 text-green-800 border border-green-200 shadow-sm',
      'Medium': 'bg-amber-100 text-amber-900 border border-amber-200 shadow-sm',
      'Hard': 'bg-red-100 text-red-800 border border-red-200 shadow-sm',
      'Role': 'bg-slate-100 text-slate-700 border border-slate-200 shadow-sm',
    };
    return map[this.variant] ?? 'bg-slate-100 text-slate-700 border border-slate-200 shadow-sm';
  }
}

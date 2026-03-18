import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'app-question-badge',
  standalone: true,
  template: `
    <span
      class="badge"
      [class.badge-easy]="variant === 'Easy'"
      [class.badge-medium]="variant === 'Medium'"
      [class.badge-hard]="variant === 'Hard'">
      {{ label }}
    </span>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class QuestionBadgeComponent {
  @Input({ required: true }) label = '';
  @Input() variant: 'Easy' | 'Medium' | 'Hard' | 'Role' = 'Role';
}

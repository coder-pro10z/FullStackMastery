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
      'Easy': 'badge-easy',
      'Medium': 'badge-medium',
      'Hard': 'badge-hard',
      'Role': 'badge-role',
    };
    return map[this.variant] ?? 'badge-role';
  }
}

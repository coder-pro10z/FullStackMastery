import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'app-progress-card',
  standalone: true,
  template: `
    <article class="panel summary-card">
      <span class="muted">{{ label }}</span>
      <strong>{{ solved }}/{{ total }}</strong>
    </article>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProgressCardComponent {
  @Input({ required: true }) label = '';
  @Input() solved = 0;
  @Input() total = 0;
}

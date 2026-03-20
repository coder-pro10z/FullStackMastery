import { ChangeDetectionStrategy, Component, Input, computed, signal } from '@angular/core';

@Component({
  selector: 'app-progress-card',
  standalone: true,
  template: `
    <article class="glass-panel p-4 group hover:border-dark-border-light transition-all duration-200">
      <!-- Header -->
      <div class="flex items-center justify-between mb-3">
        <span class="text-xs font-medium uppercase tracking-wider text-slate-500">{{ label }}</span>
        <span class="text-xs font-bold" [class]="accentClass">{{ percentage }}%</span>
      </div>

      <!-- Value -->
      <div class="flex items-end gap-2 mb-3">
        <span class="text-2xl font-bold text-white leading-none">{{ solved }}</span>
        <span class="text-sm text-slate-500 pb-0.5">/ {{ total }}</span>
      </div>

      <!-- Progress Bar -->
      <div class="progress-track">
        <div
          class="progress-fill"
          [style.width.%]="percentage"
          [class]="barClass">
        </div>
      </div>
    </article>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProgressCardComponent {
  @Input({ required: true }) label = '';
  @Input() solved = 0;
  @Input() total = 0;
  @Input() variant: 'default' | 'easy' | 'medium' | 'hard' = 'default';

  get percentage(): number {
    return this.total > 0 ? Math.round((this.solved / this.total) * 100) : 0;
  }

  get accentClass(): string {
    const map: Record<string, string> = {
      'default': 'text-accent-blue',
      'easy': 'text-badge-easy',
      'medium': 'text-badge-medium',
      'hard': 'text-badge-hard',
    };
    return map[this.variant] ?? map['default'];
  }

  get barClass(): string {
    const map: Record<string, string> = {
      'default': 'bg-gradient-to-r from-accent-blue to-accent-indigo',
      'easy': 'bg-gradient-to-r from-green-500 to-emerald-400',
      'medium': 'bg-gradient-to-r from-amber-500 to-yellow-400',
      'hard': 'bg-gradient-to-r from-red-500 to-rose-400',
    };
    return map[this.variant] ?? map['default'];
  }
}

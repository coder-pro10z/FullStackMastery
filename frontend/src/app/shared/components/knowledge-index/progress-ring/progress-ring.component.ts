import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

@Component({
  selector: 'app-progress-ring',
  standalone: true,
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [`:host { display: block; }`],
  template: `
    <div class="relative inline-flex items-center justify-center" [style.width.px]="size()" [style.height.px]="size()">
      <svg [attr.width]="size()" [attr.height]="size()" class="-rotate-90">
        <!-- Background track -->
        <circle
          [attr.cx]="size() / 2"
          [attr.cy]="size() / 2"
          [attr.r]="radius()"
          fill="none"
          [attr.stroke]="trackColor()"
          [attr.stroke-width]="strokeWidth()"
        />
        <!-- Progress arc -->
        <circle
          [attr.cx]="size() / 2"
          [attr.cy]="size() / 2"
          [attr.r]="radius()"
          fill="none"
          [attr.stroke]="progressColor()"
          [attr.stroke-width]="strokeWidth()"
          stroke-linecap="round"
          [attr.stroke-dasharray]="circumference()"
          [attr.stroke-dashoffset]="dashOffset()"
          style="transition: stroke-dashoffset 0.6s ease-out"
        />
      </svg>
      <!-- Center label -->
      @if (showLabel()) {
        <span
          class="absolute text-center font-bold leading-none"
          [style.font-size.px]="size() * 0.22"
          [style.color]="labelColor()"
        >{{ pct() }}%</span>
      }
    </div>
  `
})
export class ProgressRingComponent {
  readonly percentage = input<number>(0);
  readonly size = input<number>(56);
  readonly strokeWidth = input<number>(5);
  readonly showLabel = input<boolean>(true);
  readonly progressColor = input<string>('#1A73E8');
  readonly trackColor = input<string>('#E2E8F0');
  readonly labelColor = input<string>('#202124');

  readonly pct = computed(() => Math.min(100, Math.max(0, this.percentage())));
  readonly radius = computed(() => (this.size() - this.strokeWidth() * 2) / 2);
  readonly circumference = computed(() => 2 * Math.PI * this.radius());
  readonly dashOffset = computed(() => this.circumference() * (1 - this.pct() / 100));
}

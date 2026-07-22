import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CATEGORY_COLORS, CATEGORY_LABELS, CompetencyCategory, CompetencyModel } from '../../../../core/models/challenge.models';

@Component({
  selector: 'app-competency-badge',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span
      class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold
             border transition-all duration-200 hover:scale-105 cursor-default select-none"
      [class]="badgeClasses"
      [title]="competency.title"
    >
      <span class="w-1.5 h-1.5 rounded-full flex-shrink-0" [class]="dotClass"></span>
      {{ competency.competencyId }}
    </span>
  `,
})
export class CompetencyBadgeComponent {
  @Input({ required: true }) competency!: CompetencyModel;

  get cat(): CompetencyCategory { return this.competency.category as CompetencyCategory; }
  get colors() { return CATEGORY_COLORS[this.cat] ?? CATEGORY_COLORS['CSharpCore']; }
  get badgeClasses(): string {
    const c = this.colors;
    return `${c.bg} ${c.text} ${c.border}`;
  }
  get dotClass(): string { return this.colors.dot; }
}

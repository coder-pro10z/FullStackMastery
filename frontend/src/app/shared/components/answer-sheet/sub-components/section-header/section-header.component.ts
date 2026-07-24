import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-answer-section-header',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LucideAngularModule],
  template: `
    <div
      class="flex items-center gap-2.5 px-3.5 py-1.5 rounded-lg text-white font-semibold text-xs shadow-sm mb-2.5"
      [class.bg-[#0A192F]]="theme === 'navy'"
      [class.bg-emerald-800]="theme === 'emerald'"
      [class.bg-blue-800]="theme === 'blue'"
      [class.bg-purple-800]="theme === 'purple'"
      [class.bg-amber-800]="theme === 'amber'"
    >
      @if (iconName) {
        <lucide-icon [name]="iconName" [size]="15" class="text-amber-400 flex-shrink-0" />
      }
      <div class="flex items-center gap-1.5 flex-1 min-w-0">
        @if (sectionNumber !== undefined) {
          <span class="text-amber-300 font-bold font-mono">{{ sectionNumber }}.</span>
        }
        <h4 class="uppercase tracking-wider font-bold truncate text-[11px]">{{ title }}</h4>
      </div>
    </div>
  `
})
export class SectionHeaderComponent {
  @Input() sectionNumber?: string | number;
  @Input({ required: true }) title!: string;
  @Input() iconName: string = 'book-open';
  @Input() theme: 'navy' | 'blue' | 'emerald' | 'amber' | 'purple' = 'navy';
}

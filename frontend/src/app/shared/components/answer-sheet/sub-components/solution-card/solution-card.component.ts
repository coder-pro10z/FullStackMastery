import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';
import { CodeBlockComponent } from '../code-block/code-block.component';

@Component({
  selector: 'app-solution-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LucideAngularModule, CodeBlockComponent],
  template: `
    <div
      class="rounded-xl border p-3 flex flex-col justify-between transition-all shadow-sm"
      [class]="cardContainerClasses"
    >
      <div>
        <!-- Header Strip -->
        <div
          class="flex items-center justify-between px-2.5 py-1 rounded-lg text-white font-bold text-[11px] mb-2"
          [class.bg-amber-800]="type === 'brute-force'"
          [class.bg-emerald-700]="type === 'optimal'"
          [class.bg-purple-800]="type === 'alternate'"
        >
          <div class="flex items-center gap-1.5 truncate">
            @if (type === 'optimal') {
              <lucide-icon name="star" [size]="13" class="text-amber-300 fill-amber-300 flex-shrink-0" />
            }
            <span class="truncate">{{ sectionNumber }}. {{ title }}</span>
          </div>

          @if (type === 'optimal') {
            <span class="text-[9px] uppercase tracking-wider bg-emerald-900/60 text-emerald-200 px-1.5 py-0.5 rounded font-mono">Recommended</span>
          }
        </div>

        <p class="text-[11px] font-semibold text-slate-700 mb-1 font-sans">{{ approachTitle }}</p>

        <!-- Code Snippet -->
        <app-code-block [code]="code" language="sql" />

        <!-- Pros & Cons or Why Optimal -->
        @if (type === 'brute-force' && (pros?.length || cons?.length)) {
          <div class="grid grid-cols-2 gap-2 mt-2 font-sans text-[10px]">
            @if (pros?.length) {
              <div class="bg-emerald-50 border border-emerald-100 p-1.5 rounded-lg">
                <span class="font-bold text-emerald-700 uppercase tracking-wider block mb-0.5">Pros</span>
                @for (p of pros; track p) {
                  <p class="text-emerald-800 leading-tight">• {{ p }}</p>
                }
              </div>
            }
            @if (cons?.length) {
              <div class="bg-rose-50 border border-rose-100 p-1.5 rounded-lg">
                <span class="font-bold text-rose-700 uppercase tracking-wider block mb-0.5">Cons</span>
                @for (c of cons; track c) {
                  <p class="text-rose-800 leading-tight">• {{ c }}</p>
                }
              </div>
            }
          </div>
        }

        @if (type === 'optimal' && whyOptimal?.length) {
          <div class="bg-emerald-100/70 border border-emerald-200 p-2 rounded-lg mt-2 font-sans text-[10px]">
            <span class="font-bold text-emerald-800 uppercase tracking-wider block mb-1">Why is this optimal?</span>
            @for (w of whyOptimal; track w) {
              <div class="flex items-start gap-1 text-emerald-900 mb-0.5">
                <lucide-icon name="check" [size]="12" class="text-emerald-600 flex-shrink-0 mt-0.5" />
                <span class="leading-tight">{{ w }}</span>
              </div>
            }
          </div>
        }

        @if (type === 'alternate' && notes) {
          <div class="bg-purple-100/60 border border-purple-200 p-2 rounded-lg mt-2 font-sans text-[10px]">
            <span class="font-bold text-purple-800 uppercase tracking-wider block mb-0.5">Notes</span>
            <p class="text-purple-900 leading-tight">{{ notes }}</p>
          </div>
        }
      </div>
    </div>
  `
})
export class SolutionCardComponent {
  @Input({ required: true }) sectionNumber!: number;
  @Input({ required: true }) title!: string;
  @Input({ required: true }) type!: 'brute-force' | 'optimal' | 'alternate';
  @Input({ required: true }) approachTitle!: string;
  @Input({ required: true }) code!: string;
  @Input() pros?: string[];
  @Input() cons?: string[];
  @Input() whyOptimal?: string[];
  @Input() notes?: string;

  get cardContainerClasses(): string {
    switch (this.type) {
      case 'optimal':
        return 'bg-emerald-50/40 border-emerald-300 ring-2 ring-emerald-500/20';
      case 'alternate':
        return 'bg-purple-50/40 border-purple-200';
      default:
        return 'bg-white border-slate-200';
    }
  }
}

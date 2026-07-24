import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'app-line-by-line-breakdown',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="rounded-xl border border-slate-200 overflow-hidden bg-white text-xs font-sans shadow-sm my-2">
      <div class="divide-y divide-slate-100">
        @for (item of explanationList; track item.lineNo) {
          <div class="flex items-start gap-3 p-2 hover:bg-slate-50/80 transition-colors">
            <span
              class="w-5 h-5 rounded-full bg-[#0A192F] text-amber-300 font-mono text-[10px] font-bold
                     flex items-center justify-center flex-shrink-0 mt-0.5"
            >
              {{ item.lineNo }}
            </span>
            <div class="flex-1 min-w-0 grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
              <code class="sm:col-span-5 font-mono text-[11px] bg-slate-100 text-slate-800 px-2 py-1 rounded border border-slate-200 truncate">
                {{ item.code }}
              </code>
              <p class="sm:col-span-7 text-slate-600 text-[11px] leading-relaxed">
                {{ item.explanation }}
              </p>
            </div>
          </div>
        }
      </div>
    </div>
  `
})
export class LineByLineBreakdownComponent {
  @Input({ required: true }) explanationList!: { lineNo: number; code: string; explanation: string }[];
}

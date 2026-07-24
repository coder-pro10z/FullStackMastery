import { ChangeDetectionStrategy, Component, Input, signal } from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-code-block',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LucideAngularModule],
  template: `
    <div class="rounded-xl border border-slate-800 bg-slate-950 overflow-hidden shadow-inner font-mono text-xs my-2">
      <!-- Header -->
      <div class="flex items-center justify-between px-3 py-1.5 bg-slate-900 border-b border-slate-800 text-slate-400">
        <div class="flex items-center gap-2">
          <span class="w-2.5 h-2.5 rounded-full bg-rose-500/80"></span>
          <span class="w-2.5 h-2.5 rounded-full bg-amber-500/80"></span>
          <span class="w-2.5 h-2.5 rounded-full bg-emerald-500/80"></span>
          @if (title) {
            <span class="ml-2 font-sans font-medium text-[11px] text-slate-300">{{ title }}</span>
          } @else {
            <span class="ml-2 uppercase tracking-wider text-[10px] font-semibold text-slate-400">{{ language }}</span>
          }
        </div>

        <button
          type="button"
          (click)="copyCode()"
          class="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-sans font-medium transition-all
                 bg-slate-800 hover:bg-slate-700 text-slate-300 active:scale-95 cursor-pointer"
        >
          @if (copied()) {
            <lucide-icon name="check" [size]="12" class="text-emerald-400" />
            <span class="text-emerald-400">Copied!</span>
          } @else {
            <lucide-icon name="copy" [size]="12" />
            <span>Copy</span>
          }
        </button>
      </div>

      <!-- Code Content -->
      <div class="p-3.5 overflow-x-auto text-slate-100 leading-relaxed font-mono whitespace-pre select-text bg-slate-950">
        <code class="!bg-transparent !border-0 !p-0 text-slate-100 font-mono block code-text">{{ code }}</code>
      </div>
    </div>
  `
})
export class CodeBlockComponent {
  @Input({ required: true }) code!: string;
  @Input() language: string = 'csharp';
  @Input() title?: string;

  copied = signal(false);

  copyCode(): void {
    if (this.code) {
      navigator.clipboard.writeText(this.code);
      this.copied.set(true);
      setTimeout(() => this.copied.set(false), 2000);
    }
  }
}

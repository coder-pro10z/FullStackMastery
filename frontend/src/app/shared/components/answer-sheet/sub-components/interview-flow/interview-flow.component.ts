import { Component, Input, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';
import { InterviewSpeechFlow } from '../../../../../core/models/answer-sheet.models';

@Component({
  selector: 'app-interview-flow',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="my-6 rounded-2xl border border-emerald-200/90 bg-gradient-to-br from-emerald-50/80 via-teal-50/50 to-slate-50 overflow-hidden shadow-xs">
      <!-- Accordion Header Bar -->
      <div
        (click)="isExpanded.set(!isExpanded())"
        class="flex items-center justify-between px-5 py-4 cursor-pointer select-none border-b border-emerald-100 hover:bg-emerald-100/40 transition-colors"
      >
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-sm flex-shrink-0">
            <lucide-icon name="mic" [size]="20" />
          </div>
          <div>
            <div class="flex items-center gap-2">
              <h3 class="text-sm font-bold text-slate-900 uppercase tracking-wider">Interview Answer Speech Flow</h3>
              <span class="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-200 text-emerald-800 border border-emerald-300">
                Verbal Script
              </span>
            </div>
            <p class="text-xs text-slate-600 mt-0.5">
              Structured step-by-step teleprompter script for answering verbally in interviews.
            </p>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <span class="text-xs font-semibold text-emerald-700 hidden sm:inline">
            {{ isExpanded() ? 'Collapse' : 'Expand Flow' }}
          </span>
          <div class="w-8 h-8 rounded-lg bg-emerald-100/80 text-emerald-800 flex items-center justify-center transition-transform duration-300"
               [class.rotate-180]="isExpanded()">
            <lucide-icon name="chevron-down" [size]="16" />
          </div>
        </div>
      </div>

      <!-- Accordion Body -->
      @if (isExpanded()) {
        <div class="p-5 space-y-4">
          <!-- Intro Opening Phrase -->
          <div class="p-3.5 rounded-xl bg-white border border-emerald-200/80 shadow-2xs">
            <div class="flex items-center justify-between mb-1.5">
              <span class="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                Opening Statement
              </span>
              <button
                (click)="copyToClipboard(flow.intro, -1)"
                title="Copy opening phrase"
                class="text-[11px] font-semibold text-slate-500 hover:text-emerald-600 flex items-center gap-1 transition-colors"
              >
                <lucide-icon [name]="copiedIndex() === -1 ? 'check' : 'copy'" [size]="12" />
                <span>{{ copiedIndex() === -1 ? 'Copied' : 'Copy' }}</span>
              </button>
            </div>
            <p class="text-xs font-medium text-slate-800 italic leading-relaxed">
              "{{ flow.intro }}"
            </p>
          </div>

          <!-- Step-by-Step Script Accordion Cards -->
          <div class="space-y-3">
            @for (step of flow.steps; track step.stepNumber; let idx = $index) {
              <div class="p-4 rounded-xl bg-white border border-slate-200/90 shadow-2xs hover:border-emerald-300 transition-all">
                <div class="flex items-center justify-between mb-2">
                  <div class="flex items-center gap-2">
                    <span class="w-6 h-6 rounded-md bg-emerald-600 text-white font-extrabold text-[11px] flex items-center justify-center">
                      {{ step.stepNumber }}
                    </span>
                    <h4 class="text-xs font-bold text-slate-800">
                      {{ step.label }}
                    </h4>
                  </div>

                  <button
                    (click)="copyToClipboard(step.script, idx)"
                    title="Copy step script"
                    class="text-[11px] font-semibold text-slate-500 hover:text-emerald-600 flex items-center gap-1 transition-colors"
                  >
                    <lucide-icon [name]="copiedIndex() === idx ? 'check' : 'copy'" [size]="12" />
                    <span>{{ copiedIndex() === idx ? 'Copied' : 'Copy Script' }}</span>
                  </button>
                </div>

                <!-- Spoken Script -->
                <p class="text-xs text-slate-700 italic bg-slate-50 p-3 rounded-lg border border-slate-200/60 leading-relaxed">
                  "{{ step.script }}"
                </p>

                <!-- Optional Coaching Tip -->
                @if (step.tip) {
                  <div class="mt-2 flex items-start gap-1.5 text-[11px] text-amber-800 bg-amber-50/80 px-2.5 py-1.5 rounded-md border border-amber-200/60">
                    <lucide-icon name="lightbulb" [size]="13" class="text-amber-600 flex-shrink-0 mt-0.5" />
                    <span><strong>Interviewer Tip:</strong> {{ step.tip }}</span>
                  </div>
                }
              </div>
            }
          </div>

          <!-- Closing Wrap-up Phrase -->
          @if (flow.closingStatement) {
            <div class="p-3.5 rounded-xl bg-gradient-to-r from-emerald-800 via-teal-800 to-slate-900 text-emerald-50 border border-emerald-500/40 shadow-sm flex items-center justify-between gap-3">
              <div class="flex items-center gap-2.5 min-w-0">
                <lucide-icon name="check-circle-2" [size]="18" class="text-emerald-300 flex-shrink-0" />
                <div>
                  <span class="text-[9px] font-extrabold uppercase tracking-widest text-emerald-300 block mb-0.5">
                    Closing Statement
                  </span>
                  <p class="text-xs font-semibold leading-relaxed text-emerald-50 italic">
                    "{{ flow.closingStatement }}"
                  </p>
                </div>
              </div>
              <button
                (click)="copyToClipboard(flow.closingStatement, 99)"
                class="px-2.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-[10px] uppercase tracking-wider flex items-center gap-1.5 transition-all active:scale-95 flex-shrink-0 shadow-sm"
              >
                <lucide-icon [name]="copiedIndex() === 99 ? 'check' : 'copy'" [size]="12" />
                <span>{{ copiedIndex() === 99 ? 'Copied' : 'Copy' }}</span>
              </button>
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    :host { display: block; width: 100%; }
  `]
})
export class InterviewFlowComponent {
  @Input({ required: true }) flow!: InterviewSpeechFlow;

  readonly isExpanded = signal(true);
  readonly copiedIndex = signal<number | null>(null);

  copyToClipboard(text: string, index: number) {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      this.copiedIndex.set(index);
      setTimeout(() => this.copiedIndex.set(null), 2000);
    }
  }
}

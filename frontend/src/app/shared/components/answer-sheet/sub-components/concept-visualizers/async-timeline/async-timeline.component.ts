import { Component, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-async-timeline',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="my-6 p-4 sm:p-5 rounded-2xl border border-cyan-200 bg-gradient-to-br from-slate-900 via-slate-800 to-cyan-950 text-white shadow-xl">
      <!-- Header -->
      <div class="flex items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-700/80">
        <div class="flex items-center gap-2.5">
          <div class="w-9 h-9 rounded-xl bg-cyan-600 flex items-center justify-center font-bold text-white shadow-sm">
            <lucide-icon name="clock" [size]="18" />
          </div>
          <div>
            <h3 class="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-100">
              Interactive async / await Thread Timeline
            </h3>
            <p class="text-[11px] text-slate-400 font-medium">
              Compare Non-Blocking Async I/O Yielding vs Synchronous Thread Starvation.
            </p>
          </div>
        </div>

        <!-- Mode Toggle -->
        <div class="flex items-center gap-1.5 p-1 rounded-xl bg-slate-800 border border-slate-700">
          <button
            (click)="isAsyncMode.set(true)"
            class="px-3 py-1 rounded-lg text-xs font-bold transition-all select-none cursor-pointer"
            [class]="isAsyncMode() ? 'bg-cyan-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'"
          >
            async / await (Non-Blocking)
          </button>
          <button
            (click)="isAsyncMode.set(false)"
            class="px-3 py-1 rounded-lg text-xs font-bold transition-all select-none cursor-pointer"
            [class]="!isAsyncMode() ? 'bg-rose-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'"
          >
            Synchronous (Blocking)
          </button>
        </div>
      </div>

      <!-- Execution Timeline Diagram -->
      <div class="space-y-4 p-4 rounded-xl bg-slate-950 border border-slate-800">
        <!-- Thread 1 Line -->
        <div class="space-y-1.5">
          <div class="flex items-center justify-between text-xs font-mono">
            <span class="font-bold text-cyan-300">Thread #1 (Main Worker Thread)</span>
            <span [class]="isAsyncMode() ? 'text-emerald-400' : 'text-rose-400'">
              {{ isAsyncMode() ? 'Status: Freed during await I/O' : 'Status: Blocked (Thread Starvation)' }}
            </span>
          </div>

          <div class="h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center p-1.5 gap-2 relative overflow-hidden">
            <!-- Phase 1: Request -->
            <div class="h-full px-3 rounded-lg bg-blue-600 text-white font-mono text-[10px] font-bold flex items-center whitespace-nowrap">
              HTTP Request Initiated
            </div>

            <!-- Phase 2: Await / Block -->
            @if (isAsyncMode()) {
              <div class="flex-1 h-full rounded-lg bg-emerald-950/60 border border-dashed border-emerald-500/50 text-emerald-300 font-mono text-[10px] font-bold flex items-center justify-center gap-2 whitespace-nowrap animate-pulse">
                <lucide-icon name="corner-up-right" [size]="14" class="text-emerald-400" />
                <span>Thread Freed to Handle Other Users!</span>
              </div>
            } @else {
              <div class="flex-1 h-full rounded-lg bg-rose-950/80 border border-rose-500/50 text-rose-200 font-mono text-[10px] font-bold flex items-center justify-center gap-2 whitespace-nowrap">
                <lucide-icon name="lock" [size]="14" class="text-rose-400" />
                <span>Thread Blocked (Thread.Sleep / .Result)</span>
              </div>
            }

            <!-- Phase 3: Resume -->
            <div class="h-full px-3 rounded-lg bg-cyan-600 text-white font-mono text-[10px] font-bold flex items-center whitespace-nowrap">
              Resume Continuation
            </div>
          </div>
        </div>

        <!-- I/O Network Layer -->
        <div class="space-y-1.5 pt-2 border-t border-slate-800">
          <div class="flex items-center justify-between text-xs font-mono text-slate-400">
            <span>OS Network / Database Driver (I/O Completion Port)</span>
            <span class="text-cyan-400">Hardware I/O Wait (e.g. 500ms)</span>
          </div>

          <div class="h-8 rounded-lg bg-slate-900/80 border border-slate-800 flex items-center justify-center text-[10px] font-mono text-cyan-300 gap-2">
            <lucide-icon name="hard-drive" [size]="14" />
            <span>Database Query / Remote REST Call Processing</span>
          </div>
        </div>
      </div>

      <!-- Explanatory Banner -->
      <div class="mt-4 p-3 rounded-xl bg-slate-800 border border-cyan-500/40 text-xs text-slate-100 flex items-start gap-2.5 shadow-sm">
        <lucide-icon name="info" [size]="18" class="text-cyan-400 flex-shrink-0 mt-0.5" />
        <p class="leading-relaxed text-slate-200">
          <strong class="text-cyan-300 font-extrabold uppercase tracking-wide mr-1">Async Rule:</strong>
          <code class="bg-cyan-950/90 text-cyan-300 border border-cyan-500/50 px-1.5 py-0.5 rounded font-mono font-bold">await</code> does NOT create a new thread! It returns the active thread back to the ThreadPool while waiting for hardware I/O to finish, keeping server throughput high.
        </p>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; width: 100%; }
  `]
})
export class AsyncTimelineComponent {
  readonly isAsyncMode = signal(true);
}

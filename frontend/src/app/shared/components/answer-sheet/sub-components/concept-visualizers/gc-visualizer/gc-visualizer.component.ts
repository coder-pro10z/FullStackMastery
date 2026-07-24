import { Component, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';

interface GcObject {
  id: string;
  name: string;
  size: string;
  survives: boolean;
}

@Component({
  selector: 'app-gc-visualizer',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="my-6 p-4 sm:p-5 rounded-2xl border border-emerald-200 bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 text-white shadow-xl">
      <!-- Header -->
      <div class="flex items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-700/80">
        <div class="flex items-center gap-2.5">
          <div class="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center font-bold text-white shadow-sm">
            <lucide-icon name="trash-2" [size]="18" />
          </div>
          <div>
            <h3 class="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-100">
              Interactive .NET Garbage Collector (GC Generations)
            </h3>
            <p class="text-[11px] text-slate-400 font-medium">
              Simulate Gen 0, Gen 1, Gen 2 & Large Object Heap (LOH) object promotion.
            </p>
          </div>
        </div>

        <!-- Controls -->
        <div class="flex items-center gap-2">
          <button
            (click)="triggerGc()"
            class="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-extrabold text-xs transition-all active:scale-95 flex items-center gap-1 shadow-sm"
          >
            <lucide-icon name="play" [size]="13" />
            <span>Run GC Collect()</span>
          </button>

          <button
            (click)="allocateNewObjects()"
            class="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-all active:scale-95 flex items-center gap-1 shadow-sm"
          >
            <lucide-icon name="plus" [size]="13" />
            <span>Allocate</span>
          </button>
        </div>
      </div>

      <!-- Generations Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <!-- ── Gen 0 ────────────────────────────────────────────────────── -->
        <div class="p-3.5 rounded-xl bg-slate-800/90 border border-emerald-500/40">
          <div class="flex items-center justify-between mb-2.5 pb-1.5 border-b border-slate-700">
            <h4 class="text-xs font-bold uppercase tracking-wider text-emerald-300">Gen 0 (Short-Lived)</h4>
            <span class="text-[10px] text-slate-400 font-mono">Freq: High</span>
          </div>

          <div class="space-y-1.5 min-h-[120px]">
            @for (obj of gen0(); track obj.id) {
              <div
                class="p-2 rounded-lg border flex items-center justify-between text-xs font-mono transition-all duration-300"
                [class]="obj.survives ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200' : 'bg-rose-950/40 border-rose-500/50 text-rose-300'"
              >
                <span>{{ obj.name }}</span>
                <span class="font-bold">{{ obj.survives ? '✓ Keep' : '✗ Sweep' }}</span>
              </div>
            }
          </div>
        </div>

        <!-- ── Gen 1 ────────────────────────────────────────────────────── -->
        <div class="p-3.5 rounded-xl bg-slate-800/90 border border-blue-500/40">
          <div class="flex items-center justify-between mb-2.5 pb-1.5 border-b border-slate-700">
            <h4 class="text-xs font-bold uppercase tracking-wider text-blue-300">Gen 1 (Buffer Zone)</h4>
            <span class="text-[10px] text-slate-400 font-mono">Freq: Medium</span>
          </div>

          <div class="space-y-1.5 min-h-[120px]">
            @for (obj of gen1(); track obj.id) {
              <div class="p-2 rounded-lg bg-blue-950/40 border border-blue-500/50 text-blue-200 flex items-center justify-between text-xs font-mono">
                <span>{{ obj.name }}</span>
                <span class="text-emerald-400 font-bold">✓ Promoted</span>
              </div>
            }
            @if (gen1().length === 0) {
              <div class="text-[11px] text-slate-500 italic text-center py-8">Empty (Awaiting Gen0 promotion)</div>
            }
          </div>
        </div>

        <!-- ── Gen 2 ────────────────────────────────────────────────────── -->
        <div class="p-3.5 rounded-xl bg-slate-800/90 border border-purple-500/40">
          <div class="flex items-center justify-between mb-2.5 pb-1.5 border-b border-slate-700">
            <h4 class="text-xs font-bold uppercase tracking-wider text-purple-300">Gen 2 (Long-Lived)</h4>
            <span class="text-[10px] text-slate-400 font-mono">Freq: Low</span>
          </div>

          <div class="space-y-1.5 min-h-[120px]">
            @for (obj of gen2(); track obj.id) {
              <div class="p-2 rounded-lg bg-purple-950/40 border border-purple-500/50 text-purple-200 flex items-center justify-between text-xs font-mono">
                <span>{{ obj.name }}</span>
                <span class="text-purple-300 font-bold">Long-term</span>
              </div>
            }
            @if (gen2().length === 0) {
              <div class="text-[11px] text-slate-500 italic text-center py-8">Empty</div>
            }
          </div>
        </div>

        <!-- ── Large Object Heap (LOH) ─────────────────────────────────── -->
        <div class="p-3.5 rounded-xl bg-slate-800/90 border border-amber-500/40">
          <div class="flex items-center justify-between mb-2.5 pb-1.5 border-b border-slate-700">
            <h4 class="text-xs font-bold uppercase tracking-wider text-amber-300">LOH (&gt; 85KB)</h4>
            <span class="text-[10px] text-slate-400 font-mono">Direct Gen 2</span>
          </div>

          <div class="space-y-1.5 min-h-[120px]">
            <div class="p-2 rounded-lg bg-amber-950/40 border border-amber-500/50 text-amber-200 flex items-center justify-between text-xs font-mono">
              <span>byte[100000]</span>
              <span class="text-amber-400 font-bold">100 KB</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Explanatory Footer Banner -->
      <div class="mt-4 p-3 rounded-xl bg-slate-800 border border-emerald-500/40 text-xs text-slate-100 flex items-start gap-2.5 shadow-sm">
        <lucide-icon name="info" [size]="18" class="text-emerald-400 flex-shrink-0 mt-0.5" />
        <p class="leading-relaxed text-slate-200">
          <strong class="text-emerald-300 font-extrabold uppercase tracking-wide mr-1">GC Strategy:</strong>
          Gen 0 is collected most frequently. Objects that survive a Gen 0 collection get promoted to Gen 1, and surviving Gen 1 objects get promoted to Gen 2. Objects larger than 85,000 bytes go straight to the LOH!
        </p>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; width: 100%; }
  `]
})
export class GcVisualizerComponent {
  readonly gen0 = signal<GcObject[]>([
    { id: '1', name: 'temp_string', size: '128B', survives: false },
    { id: '2', name: 'http_req_dto', size: '512B', survives: true },
    { id: '3', name: 'loop_var', size: '64B', survives: false },
    { id: '4', name: 'user_session', size: '1KB', survives: true }
  ]);

  readonly gen1 = signal<GcObject[]>([]);
  readonly gen2 = signal<GcObject[]>([
    { id: '10', name: 'AppConfigSingleton', size: '4KB', survives: true }
  ]);

  triggerGc() {
    const currentGen0 = this.gen0();
    const survivors = currentGen0.filter(o => o.survives);

    // Move survivors to Gen 1
    this.gen1.update(g1 => [...g1, ...survivors]);
    // Clear Gen 0
    this.gen0.set([]);
  }

  allocateNewObjects() {
    this.gen0.set([
      { id: Date.now().toString() + '-1', name: 'temp_cache', size: '256B', survives: false },
      { id: Date.now().toString() + '-2', name: 'db_entity', size: '2KB', survives: true },
      { id: Date.now().toString() + '-3', name: 'response_buffer', size: '512B', survives: false }
    ]);
  }
}

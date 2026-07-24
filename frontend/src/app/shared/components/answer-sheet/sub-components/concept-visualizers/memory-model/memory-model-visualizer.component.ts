import { Component, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';

interface StackFrame {
  id: string;
  name: string;
  type: string;
  value: string;
  isPointer?: boolean;
  heapAddress?: string;
}

interface HeapObject {
  address: string;
  type: string;
  fields: { name: string; value: string }[];
  isBoxed?: boolean;
}

@Component({
  selector: 'app-memory-model-visualizer',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="my-6 p-4 sm:p-5 rounded-2xl border border-blue-200 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 text-white shadow-xl">
      <!-- Header -->
      <div class="flex items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-700/80">
        <div class="flex items-center gap-2.5">
          <div class="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center font-bold text-white shadow-sm">
            <lucide-icon name="layers" [size]="18" />
          </div>
          <div>
            <h3 class="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-100">
              Interactive C# Memory Model (Stack vs Heap)
            </h3>
            <p class="text-[11px] text-slate-400 font-medium">
              Simulate Value Types, Reference Types, Boxing & Unboxing in real-time.
            </p>
          </div>
        </div>

        <!-- Action Controls -->
        <div class="flex items-center gap-2 flex-wrap">
          <button
            (click)="performBoxing()"
            [disabled]="isBoxed()"
            class="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 disabled:opacity-40 text-slate-950 font-bold text-xs transition-all active:scale-95 flex items-center gap-1 shadow-sm"
          >
            <lucide-icon name="box" [size]="13" />
            <span>Box (object o = val)</span>
          </button>

          <button
            (click)="performUnboxing()"
            [disabled]="!isBoxed()"
            class="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 disabled:opacity-40 text-slate-950 font-bold text-xs transition-all active:scale-95 flex items-center gap-1 shadow-sm"
          >
            <lucide-icon name="archive-restore" [size]="13" />
            <span>Unbox (int y = (int)o)</span>
          </button>

          <button
            (click)="resetMemory()"
            class="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            title="Reset Memory Model"
          >
            <lucide-icon name="rotate-ccw" [size]="14" />
          </button>
        </div>
      </div>

      <!-- Memory Columns Layout -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <!-- ── Stack Memory Panel ───────────────────────────────────────── -->
        <div class="p-4 rounded-xl bg-slate-800/90 border border-slate-700/80 min-w-0">
          <div class="flex items-center justify-between gap-2 mb-3 pb-2 border-b border-slate-700 flex-wrap sm:flex-nowrap">
            <div class="flex items-center gap-2 min-w-0">
              <span class="w-2.5 h-2.5 rounded-full bg-blue-400 animate-pulse flex-shrink-0"></span>
              <h4 class="text-xs font-bold uppercase tracking-wider text-blue-300 whitespace-nowrap">
                Stack Memory (LIFO Frame)
              </h4>
            </div>
            <span class="text-[10px] text-slate-400 font-mono whitespace-nowrap flex-shrink-0">Fast • Thread-Allocated</span>
          </div>

          <div class="space-y-2">
            @for (frame of stack(); track frame.id) {
              <div
                class="p-2.5 rounded-lg border transition-all duration-300 flex items-center justify-between text-xs font-mono gap-2 whitespace-nowrap"
                [class]="frame.isPointer 
                  ? 'bg-purple-950/40 border-purple-500/50 text-purple-200' 
                  : 'bg-blue-950/40 border-blue-500/50 text-blue-200'"
              >
                <div class="flex items-center gap-2 whitespace-nowrap">
                  <span class="text-[10px] font-bold text-slate-400 font-mono">{{ frame.type }}</span>
                  <span class="font-bold text-white">{{ frame.name }}</span>
                </div>

                <div class="flex items-center gap-2 whitespace-nowrap">
                  <span class="text-slate-400 font-mono">=</span>
                  <span class="font-bold font-mono" [class]="frame.isPointer ? 'text-purple-300' : 'text-emerald-400'">
                    {{ frame.value }}
                  </span>
                  @if (frame.isPointer) {
                    <lucide-icon name="arrow-right" [size]="12" class="text-purple-400 flex-shrink-0" />
                  }
                </div>
              </div>
            }
          </div>
        </div>

        <!-- ── Heap Memory Panel ────────────────────────────────────────── -->
        <div class="p-4 rounded-xl bg-slate-800/90 border border-slate-700/80 min-w-0">
          <div class="flex items-center justify-between gap-2 mb-3 pb-2 border-b border-slate-700 flex-wrap sm:flex-nowrap">
            <div class="flex items-center gap-2 min-w-0">
              <span class="w-2.5 h-2.5 rounded-full bg-purple-400 animate-pulse flex-shrink-0"></span>
              <h4 class="text-xs font-bold uppercase tracking-wider text-purple-300 whitespace-nowrap">
                Heap Memory (GC Heap)
              </h4>
            </div>
            <span class="text-[10px] text-slate-400 font-mono whitespace-nowrap flex-shrink-0">Dynamic • Managed</span>
          </div>

          <div class="space-y-3">
            @for (obj of heap(); track obj.address) {
              <div
                class="p-3 rounded-lg border transition-all duration-300 font-mono text-xs whitespace-nowrap"
                [class]="obj.isBoxed 
                  ? 'bg-amber-950/40 border-amber-500/60 text-amber-200 animate-fade-in' 
                  : 'bg-purple-950/40 border-purple-500/50 text-purple-200'"
              >
                <div class="flex items-center justify-between gap-2 mb-2 pb-1 border-b border-white/10 whitespace-nowrap">
                  <span class="text-[10px] font-bold px-1.5 py-0.5 rounded bg-white/10 text-purple-300 font-mono">
                    {{ obj.address }}
                  </span>
                  <span class="font-bold text-white font-mono">{{ obj.type }}</span>
                  @if (obj.isBoxed) {
                    <span class="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-amber-500 text-slate-950 whitespace-nowrap">
                      BOXED VALUE
                    </span>
                  }
                </div>

                <div class="space-y-1">
                  @for (field of obj.fields; track field.name) {
                    <div class="flex items-center justify-between gap-3 text-[11px] text-slate-300 whitespace-nowrap">
                      <span class="font-mono text-slate-400">{{ field.name }}:</span>
                      <span class="font-bold text-emerald-400 font-mono">{{ field.value }}</span>
                    </div>
                  }
                </div>
              </div>
            }
          </div>
        </div>
      </div>

      <!-- Explanatory Footer Banner -->
      <div class="mt-4 p-3.5 rounded-xl bg-slate-800 border border-blue-500/40 text-xs text-slate-100 flex items-start gap-2.5 shadow-sm">
        <lucide-icon name="info" [size]="18" class="text-blue-400 flex-shrink-0 mt-0.5" />
        <p class="leading-relaxed text-slate-200">
          <strong class="text-amber-400 font-extrabold uppercase tracking-wide mr-1">Key Insight:</strong>
          Value Types (e.g. <code class="bg-blue-950/90 text-blue-300 border border-blue-500/50 px-1.5 py-0.5 rounded font-mono font-bold">int</code>, <code class="bg-blue-950/90 text-blue-300 border border-blue-500/50 px-1.5 py-0.5 rounded font-mono font-bold">struct</code>) store data directly on the Stack. Reference Types (e.g. <code class="bg-purple-950/90 text-purple-300 border border-purple-500/50 px-1.5 py-0.5 rounded font-mono font-bold">class</code>, <code class="bg-purple-950/90 text-purple-300 border border-purple-500/50 px-1.5 py-0.5 rounded font-mono font-bold">string</code>) store pointers on the Stack pointing to objects on the Heap. Boxing converts a Value Type into an <code class="bg-amber-950/90 text-amber-300 border border-amber-500/50 px-1.5 py-0.5 rounded font-mono font-bold">object</code> on the Heap.
        </p>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; width: 100%; }
  `]
})
export class MemoryModelVisualizerComponent {
  readonly isBoxed = signal(false);

  readonly stack = signal<StackFrame[]>([
    { id: '1', name: 'val', type: 'int', value: '42' },
    { id: '2', name: 'rate', type: 'double', value: '9.5' },
    { id: '3', name: 'user', type: 'User', value: '0x4B20', isPointer: true, heapAddress: '0x4B20' }
  ]);

  readonly heap = signal<HeapObject[]>([
    {
      address: '0x4B20',
      type: 'User (Class)',
      fields: [
        { name: 'Name', value: '"Alice"' },
        { name: 'Age', value: '30' }
      ]
    }
  ]);

  performBoxing() {
    if (this.isBoxed()) return;
    this.isBoxed.set(true);

    this.stack.update(s => [
      ...s,
      { id: '4', name: 'boxedObj', type: 'object', value: '0x8F10', isPointer: true, heapAddress: '0x8F10' }
    ]);

    this.heap.update(h => [
      ...h,
      {
        address: '0x8F10',
        type: 'System.Int32 (Boxed)',
        isBoxed: true,
        fields: [
          { name: 'Value', value: '42' },
          { name: 'TypeHandle', value: 'Int32' }
        ]
      }
    ]);
  }

  performUnboxing() {
    if (!this.isBoxed()) return;

    this.stack.update(s => [
      ...s.filter(item => item.id !== '4'),
      { id: '5', name: 'unboxedVal', type: 'int', value: '42' }
    ]);

    this.isBoxed.set(false);
  }

  resetMemory() {
    this.isBoxed.set(false);
    this.stack.set([
      { id: '1', name: 'val', type: 'int', value: '42' },
      { id: '2', name: 'rate', type: 'double', value: '9.5' },
      { id: '3', name: 'user', type: 'User', value: '0x4B20', isPointer: true, heapAddress: '0x4B20' }
    ]);
    this.heap.set([
      {
        address: '0x4B20',
        type: 'User (Class)',
        fields: [
          { name: 'Name', value: '"Alice"' },
          { name: 'Age', value: '30' }
        ]
      }
    ]);
  }
}

import { Component, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';

type CollectionType = 'List' | 'Dictionary' | 'HashSet' | 'Queue' | 'Stack';

@Component({
  selector: 'app-collection-visualizer',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="my-6 p-4 sm:p-5 rounded-2xl border border-indigo-200 bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 text-white shadow-xl">
      <!-- Top Title Bar -->
      <div class="flex items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-700/80">
        <div class="flex items-center gap-2.5">
          <div class="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center font-bold text-white shadow-sm">
            <lucide-icon name="database" [size]="18" />
          </div>
          <div>
            <h3 class="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-100">
              Interactive C# Collections Architecture
            </h3>
            <p class="text-[11px] text-slate-400 font-medium">
              Explore dynamic array resizing, hash indexing, FIFO queues & LIFO stacks.
            </p>
          </div>
        </div>

        <span class="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
          System.Collections.Generic
        </span>
      </div>

      <!-- Collection Selector Tabs -->
      <div class="flex items-center gap-2 overflow-x-auto pb-2 mb-4">
        @for (type of collectionTypes; track type) {
          <button
            (click)="activeTab.set(type)"
            class="px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all select-none cursor-pointer flex-shrink-0"
            [class]="activeTab() === type
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-900/50'
              : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'"
          >
            {{ type }}&lt;T&gt;
          </button>
        }
      </div>

      <!-- Tab Content Area -->
      @switch (activeTab()) {
        <!-- ── 1. List<T> Visualizer ──────────────────────────────────────── -->
        @case ('List') {
          <div class="space-y-4">
            <div class="flex items-center justify-between bg-slate-800/80 p-3 rounded-xl border border-slate-700">
              <div class="text-xs space-y-0.5">
                <span class="font-bold text-indigo-300">Underlying Data Structure:</span>
                <p class="text-slate-300 text-[11px]">Dynamic Contiguous Array (<code class="text-indigo-200">T[]</code>)</p>
              </div>

              <div class="flex items-center gap-3 text-xs font-mono">
                <span class="text-slate-400">Count: <strong class="text-emerald-400">{{ listItems().length }}</strong></span>
                <span class="text-slate-400">Capacity: <strong class="text-amber-400">8</strong></span>
              </div>
            </div>

            <!-- Array Blocks -->
            <div class="flex items-center gap-2 overflow-x-auto p-3 rounded-xl bg-slate-950 border border-slate-800">
              @for (item of listItems(); track $index) {
                <div class="flex flex-col items-center gap-1">
                  <span class="text-[9px] font-mono text-slate-500">[{{ $index }}]</span>
                  <div class="w-14 h-12 rounded-lg bg-indigo-600/90 border border-indigo-400 flex items-center justify-center font-bold text-xs shadow-sm">
                    {{ item }}
                  </div>
                </div>
              }
              <!-- Empty Allocations -->
              @for (empty of [1, 2, 3]; track empty) {
                <div class="flex flex-col items-center gap-1 opacity-30">
                  <span class="text-[9px] font-mono text-slate-600">[empty]</span>
                  <div class="w-14 h-12 rounded-lg border border-dashed border-slate-500 flex items-center justify-center text-xs">
                    -
                  </div>
                </div>
              }
            </div>

            <!-- Big-O Badge & Notes -->
            <div class="flex items-center justify-between text-xs text-slate-300 bg-slate-800/60 p-3 rounded-xl border border-slate-700">
              <span>Indexer Access: <strong class="text-emerald-400 font-mono">O(1)</strong></span>
              <span>Add(): <strong class="text-emerald-400 font-mono">O(1) amortized</strong></span>
              <span>Insert / Remove: <strong class="text-rose-400 font-mono">O(N)</strong></span>
            </div>
          </div>
        }

        <!-- ── 2. Dictionary<TKey, TValue> Visualizer ────────────────────── -->
        @case ('Dictionary') {
          <div class="space-y-4">
            <div class="bg-slate-800/80 p-3 rounded-xl border border-slate-700 text-xs">
              <span class="font-bold text-indigo-300">Underlying Mechanism:</span>
              <p class="text-slate-300 text-[11px] mt-0.5">
                Hash Table with Bucket Array + Entry Array. Computes <code class="text-indigo-200">GetHashCode()</code> modulo bucket length.
              </p>
            </div>

            <!-- Key Value Table -->
            <div class="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              @for (pair of dictItems(); track pair.key) {
                <div class="flex items-center justify-between p-2.5 rounded-lg bg-slate-900 border border-slate-800 font-mono text-xs">
                  <div class="flex items-center gap-2">
                    <span class="text-[10px] text-slate-500 bg-slate-800 px-1.5 py-0.5 rounded">
                      Hash: {{ pair.hash }}
                    </span>
                    <span class="font-bold text-amber-300">Key: "{{ pair.key }}"</span>
                  </div>

                  <div class="flex items-center gap-2">
                    <lucide-icon name="arrow-right" [size]="12" class="text-slate-500" />
                    <span class="font-bold text-emerald-400">Value: {{ pair.val }}</span>
                  </div>
                </div>
              }
            </div>

            <div class="flex items-center justify-between text-xs text-slate-300 bg-slate-800/60 p-3 rounded-xl border border-slate-700">
              <span>Lookup by Key: <strong class="text-emerald-400 font-mono">O(1) average</strong></span>
              <span>Hash Collision Worst Case: <strong class="text-rose-400 font-mono">O(N)</strong></span>
            </div>
          </div>
        }

        <!-- ── 3. HashSet<T> Visualizer ───────────────────────────────────── -->
        @case ('HashSet') {
          <div class="space-y-4">
            <div class="bg-slate-800/80 p-3 rounded-xl border border-slate-700 text-xs">
              <span class="font-bold text-indigo-300">Uniqueness Guarantee:</span>
              <p class="text-slate-300 text-[11px] mt-0.5">
                Stores unique elements using hashing logic. Duplicate values are ignored during <code class="text-indigo-200">Add()</code>.
              </p>
            </div>

            <div class="flex items-center gap-3 overflow-x-auto p-4 rounded-xl bg-slate-950 border border-slate-800 justify-center">
              @for (item of setElements(); track item) {
                <div class="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 border border-indigo-300 flex items-center justify-center font-bold text-xs shadow-md">
                  {{ item }}
                </div>
              }
            </div>

            <div class="flex items-center justify-between text-xs text-slate-300 bg-slate-800/60 p-3 rounded-xl border border-slate-700">
              <span>Contains(): <strong class="text-emerald-400 font-mono">O(1)</strong></span>
              <span>Add Unique: <strong class="text-emerald-400 font-mono">O(1)</strong></span>
            </div>
          </div>
        }

        <!-- ── 4. Queue<T> Visualizer ────────────────────────────────────── -->
        @case ('Queue') {
          <div class="space-y-4">
            <div class="bg-slate-800/80 p-3 rounded-xl border border-slate-700 text-xs flex items-center justify-between">
              <div>
                <span class="font-bold text-indigo-300">Ordering Principle:</span>
                <p class="text-slate-300 text-[11px]">FIFO — First In First Out</p>
              </div>

              <div class="flex items-center gap-2">
                <button (click)="enqueue()" class="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs">
                  Enqueue()
                </button>
                <button (click)="dequeue()" class="px-2.5 py-1 rounded bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs">
                  Dequeue()
                </button>
              </div>
            </div>

            <!-- Queue Line -->
            <div class="flex items-center gap-2 overflow-x-auto p-4 rounded-xl bg-slate-950 border border-slate-800">
              <span class="text-[10px] uppercase font-bold text-emerald-400">OUT ◄</span>
              @for (qItem of queueItems(); track qItem) {
                <div class="w-12 h-12 rounded-lg bg-emerald-600/90 border border-emerald-400 flex items-center justify-center font-bold text-xs shadow-sm">
                  {{ qItem }}
                </div>
              }
              <span class="text-[10px] uppercase font-bold text-indigo-400">◄ IN</span>
            </div>
          </div>
        }

        <!-- ── 5. Stack<T> Visualizer ────────────────────────────────────── -->
        @case ('Stack') {
          <div class="space-y-4">
            <div class="bg-slate-800/80 p-3 rounded-xl border border-slate-700 text-xs flex items-center justify-between">
              <div>
                <span class="font-bold text-indigo-300">Ordering Principle:</span>
                <p class="text-slate-300 text-[11px]">LIFO — Last In First Out</p>
              </div>

              <div class="flex items-center gap-2">
                <button (click)="pushStack()" class="px-2.5 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs">
                  Push()
                </button>
                <button (click)="popStack()" class="px-2.5 py-1 rounded bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs">
                  Pop()
                </button>
              </div>
            </div>

            <!-- Vertical Stack -->
            <div class="flex flex-col-reverse items-center gap-2 p-4 rounded-xl bg-slate-950 border border-slate-800 max-w-xs mx-auto">
              @for (sItem of stackItems(); track sItem) {
                <div class="w-full h-10 rounded-lg bg-blue-600/90 border border-blue-400 flex items-center justify-center font-bold text-xs shadow-sm">
                  {{ sItem }}
                </div>
              }
              <span class="text-[10px] uppercase font-bold text-blue-400 mb-1">TOP OF STACK ▼</span>
            </div>
          </div>
        }
      }
    </div>
  `,
  styles: [`
    :host { display: block; width: 100%; }
  `]
})
export class CollectionVisualizerComponent {
  readonly collectionTypes: CollectionType[] = ['List', 'Dictionary', 'HashSet', 'Queue', 'Stack'];
  readonly activeTab = signal<CollectionType>('List');

  // State
  readonly listItems = signal<string[]>(['"Alice"', '"Bob"', '"Carol"', '"David"', '"Eve"']);
  readonly dictItems = signal<{ key: string; val: string; hash: number }[]>([
    { key: 'emp_101', val: '"John Doe"', hash: 7481 },
    { key: 'emp_102', val: '"Jane Smith"', hash: 3912 },
    { key: 'emp_103', val: '"Bob Wilson"', hash: 5504 }
  ]);
  readonly setElements = signal<string[]>(['10', '25', '42', '99', '150']);
  readonly queueItems = signal<string[]>(['Req1', 'Req2', 'Req3', 'Req4']);
  readonly stackItems = signal<string[]>(['Frame1', 'Frame2', 'Frame3']);

  enqueue() {
    this.queueItems.update(q => [...q, `Req${q.length + 1}`]);
  }

  dequeue() {
    this.queueItems.update(q => q.slice(1));
  }

  pushStack() {
    this.stackItems.update(s => [...s, `Frame${s.length + 1}`]);
  }

  popStack() {
    this.stackItems.update(s => s.slice(0, -1));
  }
}

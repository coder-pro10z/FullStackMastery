import {
  ChangeDetectionStrategy, Component, inject, input, output, signal
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { CanvasStore } from '../../../../core/state/canvas.store';
import { ImportPipelineService } from '../../services/import-pipeline.service';

@Component({
  selector: 'app-bulk-import-drawer',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex justify-end" (click)="onBackdrop($event)">
      <div class="h-full w-full max-w-lg bg-white shadow-2xl flex flex-col" (click)="$event.stopPropagation()">

        <!-- Header -->
        <div class="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <h3 class="text-sm font-bold text-slate-800">
              Bulk Add {{ type() === 'keyword' ? 'Keywords' : 'Q&A Questions' }}
            </h3>
            <p class="text-xs text-slate-400 mt-0.5">Comma-separated, one-per-line, or upload CSV</p>
          </div>
          <button (click)="close.emit()" class="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition-colors">
            <lucide-icon name="x" [size]="18" />
          </button>
        </div>

        <!-- Body -->
        <div class="flex-1 overflow-y-auto p-6 space-y-5">
          <!-- Paste Area -->
          <div>
            <label class="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
              Paste {{ type() === 'keyword' ? 'Keywords' : 'Questions' }}
            </label>
            <textarea
              [(ngModel)]="rawText"
              (ngModelChange)="updatePreview()"
              [placeholder]="placeholder()"
              class="w-full h-40 px-4 py-3 border border-slate-200 rounded-xl text-sm font-sans resize-none focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
            ></textarea>
          </div>

          <!-- CSV Upload -->
          <div>
            <p class="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">— or upload CSV</p>
            <button (click)="csvInput.click()" class="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors">
              <lucide-icon name="upload" [size]="16" />
              Upload CSV File
            </button>
            <input #csvInput type="file" accept=".csv,text/csv" class="hidden" (change)="onCsvUpload($event)">
            @if (csvFileName()) {
              <p class="text-xs text-emerald-600 font-semibold mt-1">✓ {{ csvFileName() }}</p>
            }
          </div>

          <!-- Preview -->
          @if (preview().length) {
            <div>
              <p class="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Preview — {{ preview().length }} items detected</p>
              <div class="flex flex-wrap gap-2 max-h-40 overflow-y-auto p-3 bg-slate-50 rounded-xl border border-slate-200">
                @for (item of preview(); track item; let i = $index) {
                  <span class="flex items-center gap-1 px-3 py-1 bg-white border border-slate-200 rounded-full text-xs font-semibold text-slate-700 shadow-sm">
                    {{ item }}
                    <button (click)="removePreview(i)" class="text-slate-300 hover:text-red-500 ml-1">×</button>
                  </span>
                }
              </div>
            </div>
          }
        </div>

        <!-- Footer -->
        <div class="px-6 py-4 border-t border-slate-200 bg-slate-50 flex justify-end gap-3">
          <button (click)="close.emit()" class="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-200 rounded-lg transition-colors">
            Cancel
          </button>
          <button (click)="addAll()" [disabled]="!preview().length" class="px-6 py-2 text-sm font-bold text-white bg-[#1A73E8] hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg shadow-sm transition-colors flex items-center gap-2">
            <lucide-icon name="plus" [size]="16" /> Add All ({{ preview().length }})
          </button>
        </div>
      </div>
    </div>
  `
})
export class BulkImportDrawerComponent {
  readonly type = input.required<'keyword' | 'qa'>();
  readonly close = output<void>();
  readonly added = output<void>();

  private readonly canvasStore = inject(CanvasStore);
  private readonly pipeline = inject(ImportPipelineService);

  rawText = '';
  readonly preview = signal<string[]>([]);
  readonly csvFileName = signal('');

  readonly placeholder = () => this.type() === 'keyword'
    ? 'Docker, Kubernetes, Redis\n.NET Core\nEntity Framework, LINQ'
    : 'Tell me about a time you resolved a conflict\nExplain SOLID principles with an example\nHow do you handle high-availability requirements?';

  updatePreview() {
    const items = this.type() === 'keyword'
      ? this.pipeline.parseBulkKeywords(this.rawText)
      : this.pipeline.parseBulkQuestions(this.rawText);
    this.preview.set(items);
  }

  removePreview(index: number) {
    this.preview.update(p => p.filter((_, i) => i !== index));
  }

  onCsvUpload(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.csvFileName.set(file.name);
    const reader = new FileReader();
    reader.onload = e => {
      const text = e.target?.result as string ?? '';
      // CSV: first column of each row is the value
      const rows = text.split('\n').map(r => r.split(',')[0].trim()).filter(Boolean);
      this.rawText = rows.join('\n');
      this.updatePreview();
    };
    reader.readAsText(file);
  }

  addAll() {
    const items = this.preview();
    if (!items.length) return;

    if (this.type() === 'keyword') {
      this.canvasStore.bulkAddKeywords(items);
    } else {
      this.canvasStore.bulkAddQA(items);
    }

    this.added.emit();
    this.close.emit();
  }

  onBackdrop(e: MouseEvent) {
    if (e.target === e.currentTarget) this.close.emit();
  }
}

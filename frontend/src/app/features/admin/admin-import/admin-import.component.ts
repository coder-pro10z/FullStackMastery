import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import {
  AdminApiService,
  BulkImportResultDto,
  CategoryManageDto,
} from '../../../core/services/admin-api.service';

@Component({
  selector: 'app-admin-import',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [`
    @keyframes slideUp {
      from { transform: translate(-50%, 1.5rem) scale(0.95); opacity: 0; }
      to { transform: translate(-50%, 0) scale(1); opacity: 1; }
    }
    .animate-slide-up {
      animation: slideUp 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }
  `],
  template: `
    <div class="space-y-6 animate-fade-in">

      <!-- Page Header -->
      <div>
        <h1 class="text-2xl font-semibold tracking-tight text-[#202124]">Import Questions</h1>
        <p class="text-sm text-[#5F6368] mt-1">
          Bulk-upload questions from
          <code>.xlsx</code>, <code>.csv</code>, or <code>.json</code>.
          Use <strong class="font-semibold text-[#202124]">Dry Run</strong> to validate without saving.
        </p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">

        <!-- ── Left: Upload Form ── -->
        <div class="lg:col-span-2 space-y-5">

          <!-- Default Category -->
          <div class="edudash-card">
            <h2 class="text-sm font-semibold text-[#202124] mb-4 flex items-center gap-2">
              <lucide-icon name="settings" [size]="15" class="text-[#1A73E8]" />
              Import Settings
            </h2>

            <div class="space-y-4">
              <!-- Category Picker -->
              <div>
                <label class="edudash-label" for="import-category">Default Category *</label>
                @if (catsLoading()) {
                  <div class="h-10 bg-slate-200 rounded-lg animate-pulse"></div>
                } @else {
                  <select id="import-category" [(ngModel)]="categoryId" class="edudash-input">
                    <option [ngValue]="0" disabled>Select a category…</option>
                    @for (cat of flatCategories(); track cat.id) {
                      <option [ngValue]="cat.id">{{ cat.indent }}{{ cat.name }}</option>
                    }
                  </select>
                  <p class="text-xs text-[#5F6368] mt-1">Used when a row doesn't specify its own category.</p>
                }
              </div>

              <!-- Dry Run Toggle -->
              <div class="flex items-center justify-between py-3 border-t border-[#E0E0E0]">
                <div>
                  <p class="text-sm font-medium text-[#202124]">Dry Run</p>
                  <p class="text-xs text-[#5F6368]">Validate the file without saving any data</p>
                </div>
                <label class="relative inline-flex items-center cursor-pointer" for="import-dry-run">
                  <input id="import-dry-run" type="checkbox" [(ngModel)]="dryRun" class="sr-only peer" />
                  <div class="w-11 h-6 rounded-full bg-[#E0E0E0] peer-checked:bg-[#1A73E8] transition-colors duration-200"></div>
                  <div class="absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 peer-checked:translate-x-5"></div>
                </label>
              </div>
            </div>
          </div>

          <!-- Drop Zone -->
          <div class="edudash-card">
            <label class="edudash-label mb-3" for="import-file-input">Upload File</label>
            <div
              id="import-drop-zone"
              class="border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all duration-200"
              [class]="dropZoneClass()"
              (dragover)="onDragOver($event)"
              (dragleave)="dragging.set(false)"
              (drop)="onDrop($event)"
              (click)="fileInput.click()"
              role="button"
              aria-label="Upload file">
              <input
                #fileInput
                id="import-file-input"
                type="file"
                accept=".xlsx,.xls,.json,.csv"
                class="hidden"
                (change)="onFileChange($event)" />

              @if (file()) {
                <div class="flex flex-col items-center gap-3">
                  <div class="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center">
                    <lucide-icon name="file-check" [size]="24" class="text-emerald-600" />
                  </div>
                  <div>
                    <p class="text-sm font-semibold text-[#202124]">{{ file()!.name }}</p>
                    <p class="text-xs text-[#5F6368] mt-0.5">{{ fileSize() }} · Click or drag to replace</p>
                  </div>
                </div>
              } @else if (dragging()) {
                <div class="flex flex-col items-center gap-3">
                  <lucide-icon name="upload-cloud" [size]="40" class="text-[#1A73E8]" />
                  <p class="text-sm font-semibold text-[#1A73E8]">Drop it here!</p>
                </div>
              } @else {
                <div class="flex flex-col items-center gap-3">
                  <lucide-icon name="upload-cloud" [size]="40" class="text-[#5F6368]" />
                  <div>
                    <p class="text-sm text-[#202124]">
                      <span class="font-semibold text-[#1A73E8]">Click to upload</span> or drag & drop
                    </p>
                    <p class="text-xs text-[#5F6368] mt-1">.xlsx &nbsp;·&nbsp; .csv &nbsp;·&nbsp; .json</p>
                  </div>
                </div>
              }
            </div>
          </div>

          <!-- Progress bar -->
          @if (uploading()) {
            <div class="edudash-card">
              <div class="flex items-center justify-between text-xs text-[#5F6368] mb-2">
                <span class="flex items-center gap-2">
                  <lucide-icon name="loader" [size]="14" class="animate-spin text-[#1A73E8]" />
                  Processing file…
                </span>
              </div>
              <div class="h-2 bg-[#F8F9FA] border border-[#E0E0E0] rounded-full overflow-hidden">
                <div class="h-full bg-gradient-to-r from-blue-600 to-violet-600 rounded-full animate-pulse" style="width:70%"></div>
              </div>
            </div>
          }

          <!-- Result Panel -->
          @if (result()) {
            <div class="edudash-card border-l-4"
              [class]="result()!.failed > 0 ? 'border-l-red-500' : result()!.isDryRun ? 'border-l-blue-500' : 'border-l-emerald-500'">
              <!-- Summary row -->
              <div class="flex flex-wrap items-center gap-3 mb-4">
                @if (result()!.isDryRun) {
                  <span class="badge badge-primary">🔍 Dry Run</span>
                }
                <span class="badge badge-success">✓ {{ result()!.imported }} imported</span>
                @if (result()!.skipped) {
                  <span class="badge badge-warning">⚠ {{ result()!.skipped }} skipped</span>
                }
                @if (result()!.failed) {
                  <span class="badge bg-red-50 text-red-600 border-red-200">✗ {{ result()!.failed }} failed</span>
                }
              </div>

              @if (result()!.warnings.length) {
                <div class="space-y-1 mb-3">
                  <p class="text-xs font-semibold text-amber-700 uppercase tracking-wider">Warnings</p>
                  @for (w of result()!.warnings; track $index) {
                    <p class="text-xs text-amber-700">⚠ {{ w }}</p>
                  }
                </div>
              }
              @if (result()!.errors.length) {
                <div class="space-y-1">
                  <p class="text-xs font-semibold text-red-600 uppercase tracking-wider">Errors</p>
                  @for (e of result()!.errors; track $index) {
                    <p class="text-xs text-red-600">✗ {{ e }}</p>
                  }
                </div>
              }
            </div>
          }

          <!-- Error Banner -->
          @if (errorMsg()) {
            <div class="edudash-card bg-red-50 border-red-200 flex items-start gap-3">
              <lucide-icon name="alert-circle" [size]="18" class="text-red-500 flex-shrink-0 mt-0.5" />
              <p class="text-sm text-red-600">{{ errorMsg() }}</p>
            </div>
          }

          <!-- Submit Button -->
          <button
            id="import-submit-btn"
            (click)="runImport()"
            [disabled]="!file() || uploading() || !categoryId"
            class="btn btn-primary w-full py-3 text-sm flex items-center justify-center gap-2 disabled:opacity-40">
            @if (uploading()) {
              <lucide-icon name="loader" [size]="16" class="animate-spin" />
              Processing…
            } @else {
              <lucide-icon name="upload" [size]="16" />
              {{ dryRun ? 'Validate File (Dry Run)' : 'Import Questions' }}
            }
          </button>

          @if (!categoryId && !uploading()) {
            <p class="text-center text-xs text-amber-600 flex items-center justify-center gap-1">
              <lucide-icon name="alert-triangle" [size]="13" />
              Select a default category before importing.
            </p>
          }
        </div>

        <!-- ── Right: Format Guide ── -->
        <div class="space-y-4">
          <h2 class="text-xs font-semibold text-[#5F6368] uppercase tracking-wider">Supported Formats</h2>

          <div class="edudash-card">
            <div class="flex items-center gap-3 mb-3">
              <div class="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center flex-shrink-0">
                <lucide-icon name="table" [size]="18" class="text-emerald-600" />
              </div>
              <div>
                <p class="text-sm font-semibold text-[#202124]">.xlsx / .xls</p>
                <p class="text-xs text-[#5F6368]">Excel spreadsheet</p>
              </div>
            </div>
            <p class="text-xs text-[#5F6368] leading-relaxed">
              Columns: <code>Title</code>, <code>QuestionText</code>, <code>Difficulty</code>,
              <code>CategorySlug</code>, <code>AnswerMarkdown</code>
            </p>
          </div>

          <div class="edudash-card">
            <div class="flex items-center gap-3 mb-3">
              <div class="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                <lucide-icon name="file-text" [size]="18" class="text-blue-600" />
              </div>
              <div>
                <p class="text-sm font-semibold text-[#202124]">.csv</p>
                <p class="text-xs text-[#5F6368]">Comma-separated values</p>
              </div>
            </div>
            <p class="text-xs text-[#5F6368] leading-relaxed">
              Same headers as .xlsx. Quoted fields and embedded newlines are supported.
            </p>
          </div>

          <div class="edudash-card">
            <div class="flex items-center gap-3 mb-3">
              <div class="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center flex-shrink-0">
                <lucide-icon name="braces" [size]="18" class="text-violet-600" />
              </div>
              <div>
                <p class="text-sm font-semibold text-[#202124]">.json</p>
                <p class="text-xs text-[#5F6368]">JSON array</p>
              </div>
            </div>
            <p class="text-xs text-[#5F6368] leading-relaxed">
              Array under <code>"questions"</code> key. Each object: <code>questionText</code>,
              <code>difficulty</code>, <code>categorySlug</code>.
            </p>
          </div>

          <!-- Tip -->
          <div class="edudash-card bg-blue-50 border-blue-100">
            <div class="flex items-start gap-2">
              <lucide-icon name="lightbulb" [size]="16" class="text-[#1A73E8] flex-shrink-0 mt-0.5" />
              <p class="text-xs text-[#1A73E8] leading-relaxed">
                Always run a <strong>Dry Run</strong> first to catch validation errors before committing.
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- ====== FLOATING DRY RUN SUCCESS TOAST (SANDWICH) ====== -->
      @if (showDryRunSuccessSnackbar()) {
        <div class="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-slide-up w-full max-w-md px-4">
          <div class="bg-slate-950 border border-slate-800 text-white rounded-2xl shadow-2xl p-4 flex items-center justify-between gap-4 backdrop-blur-md bg-opacity-95">
            <div class="flex items-center gap-3 min-w-0">
              <div class="w-10 h-10 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center flex-shrink-0 animate-bounce">
                <lucide-icon name="file-check" class="text-emerald-400" [size]="20" />
              </div>
              <div class="min-w-0">
                <p class="text-xs font-bold text-slate-100">Dry Run Validation Passed!</p>
                <p class="text-[11px] text-slate-400 mt-0.5 truncate">
                  {{ result()?.imported }} questions are valid. Ready for live database upload.
                </p>
              </div>
            </div>
            <div class="flex items-center gap-2 flex-shrink-0">
              <button
                (click)="dismissSnackbar()"
                class="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                Dismiss
              </button>
              <button
                (click)="switchToLiveAndImport()"
                class="px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-violet-600 hover:bg-violet-500 transition-all shadow-md active:scale-95"
              >
                Go Live & Import
              </button>
            </div>
          </div>
        </div>
      }
  `
})
export class AdminImportComponent implements OnInit {
  private readonly api = inject(AdminApiService);

  // ── Category state ────────────────────────────────────────────────────────
  readonly categories = signal<CategoryManageDto[]>([]);
  readonly catsLoading = signal(true);

  readonly flatCategories = computed(() => {
    const result: { id: number; name: string; indent: string }[] = [];
    const flatten = (cats: CategoryManageDto[], depth: number) => {
      for (const c of cats) {
        result.push({ id: c.id, name: c.name, indent: '\u00a0\u00a0'.repeat(depth) });
        if (c.subCategories?.length) flatten(c.subCategories, depth + 1);
      }
    };
    flatten(this.categories(), 0);
    return result;
  });

  // ── Import state ──────────────────────────────────────────────────────────
  categoryId = 0;
  dryRun = false;
  readonly showDryRunSuccessSnackbar = signal(false);

  readonly file = signal<File | null>(null);
  readonly dragging = signal(false);
  readonly uploading = signal(false);
  readonly result = signal<BulkImportResultDto | null>(null);
  readonly errorMsg = signal('');

  readonly fileSize = computed(() => {
    const f = this.file();
    if (!f) return '';
    const kb = f.size / 1024;
    return kb < 1024 ? `${kb.toFixed(1)} KB` : `${(kb / 1024).toFixed(2)} MB`;
  });

  readonly dropZoneClass = computed(() => {
    if (this.dragging()) return 'border-[#1A73E8] bg-blue-50';
    if (this.file()) return 'border-emerald-400 bg-emerald-50/40';
    return 'border-[#E0E0E0] hover:border-[#1A73E8]/50 hover:bg-blue-50/20';
  });

  // ── Lifecycle ─────────────────────────────────────────────────────────────
  ngOnInit(): void {
    this.api.getCategoryTree().subscribe({
      next: cats => { this.categories.set(cats); this.catsLoading.set(false); },
      error: () => this.catsLoading.set(false),
    });
  }

  // ── Drag & Drop ───────────────────────────────────────────────────────────
  onDragOver(e: DragEvent): void {
    e.preventDefault();
    this.dragging.set(true);
  }

  onDrop(e: DragEvent): void {
    e.preventDefault();
    this.dragging.set(false);
    const f = e.dataTransfer?.files[0];
    if (f) this.setFile(f);
  }

  onFileChange(e: Event): void {
    const f = (e.target as HTMLInputElement).files?.[0];
    if (f) this.setFile(f);
  }

  private setFile(f: File): void {
    this.file.set(f);
    this.result.set(null);
    this.errorMsg.set('');
  }

  // ── Import ────────────────────────────────────────────────────────────────
  runImport(): void {
    const f = this.file();
    if (!f || this.uploading()) return;
    this.uploading.set(true);
    this.result.set(null);
    this.errorMsg.set('');
    this.showDryRunSuccessSnackbar.set(false);
    this.api.importFile(f, this.categoryId || 1, this.dryRun).subscribe({
      next: r => {
        this.result.set(r);
        this.uploading.set(false);
        if (this.dryRun && r.failed === 0 && r.imported > 0) {
          this.showDryRunSuccessSnackbar.set(true);
        }
      },
      error: err => {
        const msg = err?.error?.error ?? err?.error?.title ?? err?.message ?? 'Upload failed. Please try again.';
        this.errorMsg.set(msg);
        this.uploading.set(false);
      },
    });
  }

  dismissSnackbar(): void {
    this.showDryRunSuccessSnackbar.set(false);
  }

  switchToLiveAndImport(): void {
    this.dryRun = false;
    this.showDryRunSuccessSnackbar.set(false);
    this.runImport();
  }
}

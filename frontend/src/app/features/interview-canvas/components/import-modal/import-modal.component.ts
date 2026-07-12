import {
  ChangeDetectionStrategy, Component, computed, inject, output, signal
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { ImportPipelineService } from '../../services/import-pipeline.service';
import { CanvasStore } from '../../../../core/state/canvas.store';
import { ImportPipelineResult } from '../../models/canvas-import.models';

type ImportState = 'idle' | 'parsing' | 'done' | 'error';

@Component({
  selector: 'app-import-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4" (click)="onBackdrop($event)">
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden" (click)="$event.stopPropagation()">

        <!-- Header -->
        <div class="px-8 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div>
            <h2 class="text-lg font-bold text-slate-800">Import JD & Resume</h2>
            <p class="text-xs text-slate-500 mt-0.5">Paste text or upload a file · Pipeline runs locally in your browser</p>
          </div>
          <button (click)="close.emit()" class="text-slate-400 hover:text-slate-700 p-2 rounded-lg hover:bg-slate-100 transition-colors">
            <lucide-icon name="x" [size]="20" />
          </button>
        </div>

        <!-- Body -->
        <div class="flex-1 overflow-y-auto p-8">
          @if (state() === 'idle' || state() === 'error') {
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">

              <!-- JD Panel -->
              <div class="flex flex-col gap-3">
                <div class="flex items-center gap-2">
                  <div class="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                    <lucide-icon name="file-text" [size]="14" />
                  </div>
                  <h3 class="text-sm font-bold text-slate-700">Job Description</h3>
                </div>
                <!-- Drop zone -->
                <div class="border-2 border-dashed rounded-xl p-6 text-center transition-colors cursor-pointer"
                     [class.border-blue-400]="jdDragOver()"
                     [class.bg-blue-50]="jdDragOver()"
                     [class.border-slate-200]="!jdDragOver()"
                     (dragover)="$event.preventDefault(); jdDragOver.set(true)"
                     (dragleave)="jdDragOver.set(false)"
                     (drop)="onFileDrop($event, 'jd')"
                     (click)="jdFileInput.click()">
                  <lucide-icon name="upload" [size]="24" class="text-slate-300 mx-auto mb-2" />
                  <p class="text-xs text-slate-500">Drop PDF / DOCX / TXT or <span class="text-blue-600 font-semibold">click to browse</span></p>
                  @if (jdFileName()) {
                    <p class="text-xs text-emerald-600 font-semibold mt-1">📄 {{ jdFileName() }}</p>
                  }
                </div>
                <input #jdFileInput type="file" accept=".txt,.pdf,.docx,text/plain,application/pdf" class="hidden" (change)="onFileSelect($event, 'jd')">
                <textarea [(ngModel)]="jdText" placeholder="…or paste the job description text here" class="w-full h-40 px-4 py-3 border border-slate-200 rounded-xl text-sm font-sans resize-none focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-colors"></textarea>
              </div>

              <!-- Resume Panel -->
              <div class="flex flex-col gap-3">
                <div class="flex items-center gap-2">
                  <div class="w-7 h-7 rounded-lg bg-violet-50 text-violet-600 flex items-center justify-center">
                    <lucide-icon name="user" [size]="14" />
                  </div>
                  <h3 class="text-sm font-bold text-slate-700">Resume <span class="text-xs text-slate-400 font-normal ml-1">(optional — enables gap analysis)</span></h3>
                </div>
                <div class="border-2 border-dashed rounded-xl p-6 text-center transition-colors cursor-pointer"
                     [class.border-violet-400]="resumeDragOver()"
                     [class.bg-violet-50]="resumeDragOver()"
                     [class.border-slate-200]="!resumeDragOver()"
                     (dragover)="$event.preventDefault(); resumeDragOver.set(true)"
                     (dragleave)="resumeDragOver.set(false)"
                     (drop)="onFileDrop($event, 'resume')"
                     (click)="resumeFileInput.click()">
                  <lucide-icon name="upload" [size]="24" class="text-slate-300 mx-auto mb-2" />
                  <p class="text-xs text-slate-500">Drop PDF / DOCX / TXT or <span class="text-violet-600 font-semibold">click to browse</span></p>
                  @if (resumeFileName()) {
                    <p class="text-xs text-emerald-600 font-semibold mt-1">📄 {{ resumeFileName() }}</p>
                  }
                </div>
                <input #resumeFileInput type="file" accept=".txt,.pdf,.docx,text/plain,application/pdf" class="hidden" (change)="onFileSelect($event, 'resume')">
                <textarea [(ngModel)]="resumeText" placeholder="…or paste your resume text here" class="w-full h-40 px-4 py-3 border border-slate-200 rounded-xl text-sm font-sans resize-none focus:outline-none focus:border-violet-400 focus:ring-1 focus:ring-violet-400 transition-colors"></textarea>
              </div>
            </div>

            @if (state() === 'error') {
              <div class="mt-4 p-4 bg-red-50 rounded-xl text-sm text-red-700 font-medium">
                ⚠️ Something went wrong during parsing. Please check your input and try again.
              </div>
            }
          }

          @if (state() === 'parsing') {
            <div class="py-16 flex flex-col items-center gap-4">
              <div class="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center animate-pulse">
                <lucide-icon name="cpu" [size]="24" class="text-blue-500" />
              </div>
              <div class="space-y-2 w-full max-w-sm">
                @for (step of parsingSteps; track step) {
                  <div class="h-3 bg-slate-100 rounded-full animate-pulse" [style.width]="step"></div>
                }
              </div>
              <p class="text-sm text-slate-500 font-medium">Extracting keywords, detecting gaps…</p>
            </div>
          }

          @if (state() === 'done' && result()) {
            <div class="space-y-4">
              <!-- Summary Banner -->
              <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div class="bg-blue-50 rounded-xl p-4 text-center">
                  <div class="text-2xl font-black text-blue-700">{{ result()!.jdPointers.length }}</div>
                  <div class="text-xs text-blue-600 font-semibold mt-0.5">JD Pointers</div>
                </div>
                <div class="bg-violet-50 rounded-xl p-4 text-center">
                  <div class="text-2xl font-black text-violet-700">{{ result()!.resumePointers.length }}</div>
                  <div class="text-xs text-violet-600 font-semibold mt-0.5">Resume Pointers</div>
                </div>
                <div class="bg-amber-50 rounded-xl p-4 text-center">
                  <div class="text-2xl font-black text-amber-700">{{ result()!.keywords.length }}</div>
                  <div class="text-xs text-amber-600 font-semibold mt-0.5">Keywords Found</div>
                </div>
                <div class="rounded-xl p-4 text-center" [class.bg-rose-50]="missingCount() > 0" [class.bg-emerald-50]="missingCount() === 0">
                  <div class="text-2xl font-black" [class.text-rose-700]="missingCount() > 0" [class.text-emerald-700]="missingCount() === 0">{{ missingCount() }}</div>
                  <div class="text-xs font-semibold mt-0.5" [class.text-rose-600]="missingCount() > 0" [class.text-emerald-600]="missingCount() === 0">Skill Gaps</div>
                </div>
              </div>

              <!-- Gap score bar -->
              @if (result()!.gapAnalysis) {
                <div class="bg-slate-50 rounded-xl p-5">
                  <div class="flex items-center justify-between mb-2">
                    <span class="text-sm font-bold text-slate-700">Coverage Score</span>
                    <span class="text-sm font-black" [class.text-emerald-600]="coverageScore() >= 70" [class.text-amber-600]="coverageScore() >= 40 && coverageScore() < 70" [class.text-rose-600]="coverageScore() < 40">{{ coverageScore() }}%</span>
                  </div>
                  <div class="w-full bg-slate-200 rounded-full h-2.5">
                    <div class="h-2.5 rounded-full transition-all"
                         [class.bg-emerald-500]="coverageScore() >= 70"
                         [class.bg-amber-500]="coverageScore() >= 40 && coverageScore() < 70"
                         [class.bg-rose-500]="coverageScore() < 40"
                         [style.width.%]="coverageScore()"></div>
                  </div>
                  @if (result()!.gapAnalysis!.missingSkills.length) {
                    <div class="mt-3">
                      <p class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Missing Skills</p>
                      <div class="flex flex-wrap gap-1.5">
                        @for (skill of result()!.gapAnalysis!.missingSkills; track skill) {
                          <span class="px-2 py-0.5 bg-rose-100 text-rose-700 text-xs font-bold rounded-full">{{ skill }}</span>
                        }
                      </div>
                    </div>
                  }
                </div>
              }
            </div>
          }
        </div>

        <!-- Footer -->
        <div class="px-8 py-5 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <button (click)="close.emit()" class="px-5 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-200 rounded-lg transition-colors">
            Cancel
          </button>
          <div class="flex gap-3">
            @if (state() === 'done') {
              <button (click)="restart()" class="px-5 py-2 text-sm font-semibold text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors">
                ← Re-import
              </button>
              <button (click)="applyToCanvas()" class="px-6 py-2 text-sm font-bold text-white bg-[#1A73E8] hover:bg-blue-700 rounded-lg shadow-sm transition-colors flex items-center gap-2">
                <lucide-icon name="check" [size]="16" /> Apply to Canvas
              </button>
            } @else if (state() === 'idle' || state() === 'error') {
              <button (click)="runPipeline()" [disabled]="!hasInput()" class="px-6 py-2 text-sm font-bold text-white bg-[#1A73E8] hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg shadow-sm transition-colors flex items-center gap-2">
                <lucide-icon name="zap" [size]="16" /> Run Analysis
              </button>
            }
          </div>
        </div>
      </div>
    </div>
  `
})
export class ImportModalComponent {
  readonly close = output<void>();
  readonly applied = output<void>();

  private readonly pipeline = inject(ImportPipelineService);
  private readonly canvasStore = inject(CanvasStore);

  readonly state = signal<ImportState>('idle');
  readonly result = signal<ImportPipelineResult | null>(null);
  readonly jdDragOver = signal(false);
  readonly resumeDragOver = signal(false);
  readonly jdFileName = signal('');
  readonly resumeFileName = signal('');

  jdText = '';
  resumeText = '';
  jdFile: File | null = null;
  resumeFile: File | null = null;

  readonly parsingSteps = ['80%', '65%', '90%', '55%'];

  readonly missingCount = computed(() => this.result()?.gapAnalysis?.missingSkills.length ?? 0);
  readonly coverageScore = computed(() => this.result()?.gapAnalysis?.coverageScore ?? 0);
  readonly hasInput = computed(() => !!(this.jdText.trim() || this.jdFile));

  onBackdrop(e: MouseEvent) {
    if (e.target === e.currentTarget) this.close.emit();
  }

  onFileSelect(event: Event, type: 'jd' | 'resume') {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    if (type === 'jd') { this.jdFile = file; this.jdFileName.set(file.name); }
    else { this.resumeFile = file; this.resumeFileName.set(file.name); }
  }

  onFileDrop(event: DragEvent, type: 'jd' | 'resume') {
    event.preventDefault();
    const file = event.dataTransfer?.files?.[0];
    if (!file) return;
    if (type === 'jd') { this.jdFile = file; this.jdFileName.set(file.name); this.jdDragOver.set(false); }
    else { this.resumeFile = file; this.resumeFileName.set(file.name); this.resumeDragOver.set(false); }
  }

  runPipeline() {
    const jdInput = this.jdFile ?? (this.jdText.trim() || null);
    const resumeInput = this.resumeFile ?? (this.resumeText.trim() || null);
    if (!jdInput) return;

    this.state.set('parsing');
    this.pipeline.run(jdInput, resumeInput).subscribe({
      next: result => { this.result.set(result); this.state.set('done'); },
      error: () => this.state.set('error')
    });
  }

  applyToCanvas() {
    const r = this.result();
    if (!r) return;
    this.canvasStore.applyImportResult(r);
    this.applied.emit();
    this.close.emit();
  }

  restart() {
    this.state.set('idle');
    this.result.set(null);
    this.jdText = '';
    this.resumeText = '';
    this.jdFile = null;
    this.resumeFile = null;
    this.jdFileName.set('');
    this.resumeFileName.set('');
  }
}

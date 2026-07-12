import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';
import { FormsModule } from '@angular/forms';
import { ResumeService } from '../../services/resume.service';
import { Resume } from '../../models/opportunity.models';

@Component({
  selector: 'app-resume-vault',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="h-full flex flex-col">
      <!-- ── Header ── -->
      <div class="bg-white border-b border-slate-200 px-8 py-6 flex-shrink-0">
        <div class="flex items-start justify-between">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center flex-shrink-0">
              <lucide-icon name="file-text" [size]="20" class="text-indigo-600" />
            </div>
            <div>
              <h2 class="text-xl font-bold text-slate-800">Resume Vault</h2>
              <p class="text-sm text-slate-500 mt-0.5">
                Manage your master resumes. Pin a specific version to an opportunity.
              </p>
            </div>
          </div>
          
          <button (click)="isAdding.set(true)" class="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 shadow-sm transition-colors">
            <lucide-icon name="upload" [size]="14" /> Add Resume
          </button>
        </div>
      </div>

      <!-- ── Vault Content ── -->
      <div class="flex-1 overflow-y-auto p-8 bg-slate-50">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl">
          @for (resume of resumeService.resumes(); track resume.id) {
            <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-shadow">
              
              <div class="p-5 flex-1 border-b border-slate-100">
                <div class="flex items-start justify-between mb-3">
                  <div class="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400">
                    <lucide-icon name="file-text" [size]="20" />
                  </div>
                  @if (resume.isDefault) {
                    <span class="px-2 py-1 rounded bg-indigo-50 text-indigo-700 text-[10px] font-bold uppercase tracking-wider">
                      Default
                    </span>
                  }
                </div>
                
                <h3 class="text-sm font-bold text-slate-800 mb-1 line-clamp-1" [title]="resume.label">{{ resume.label }}</h3>
                @if (resume.notes) {
                  <p class="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-3">{{ resume.notes }}</p>
                }
                
                @if (resume.externalLink) {
                  <a [href]="resume.externalLink" target="_blank" class="inline-flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:underline">
                    <lucide-icon name="link" [size]="12" /> External Link
                  </a>
                } @else if (resume.fileName) {
                  <div class="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600">
                    <lucide-icon name="paperclip" [size]="12" /> {{ resume.fileName }}
                  </div>
                }
              </div>
              
              <div class="px-5 py-3 bg-slate-50 flex items-center justify-between mt-auto flex-shrink-0">
                <span class="text-[10px] font-medium text-slate-400 uppercase tracking-wider">
                  Added {{ formatDate(resume.createdAt) }}
                </span>
                <div class="flex gap-2">
                  @if (!resume.isDefault) {
                    <button (click)="makeDefault(resume.id)" class="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors" title="Make Default">
                      <lucide-icon name="star" [size]="14" />
                    </button>
                  }
                  <button (click)="deleteResume(resume.id)" class="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors" title="Delete">
                    <lucide-icon name="trash-2" [size]="14" />
                  </button>
                </div>
              </div>
            </div>
          } @empty {
            <div class="col-span-full bg-white rounded-2xl border border-dashed border-slate-300 py-16 flex flex-col items-center justify-center text-center">
              <div class="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mb-4">
                <lucide-icon name="file-text" [size]="24" class="text-slate-300" />
              </div>
              <h4 class="text-slate-600 font-bold mb-1">Vault is Empty</h4>
              <p class="text-sm text-slate-400 max-w-sm mb-4">
                Upload your resumes or link to your Google Docs to keep all versions organized.
              </p>
              <button (click)="isAdding.set(true)" class="text-sm font-semibold text-indigo-600 hover:text-indigo-700 hover:underline">
                Add your first resume
              </button>
            </div>
          }
        </div>
      </div>

      <!-- Add Resume Modal -->
      @if (isAdding()) {
        <div class="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div class="bg-white rounded-2xl shadow-xl w-full max-w-md border border-slate-200 overflow-hidden">
            <div class="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 class="text-sm font-bold text-slate-800">Add Resume</h3>
              <button (click)="cancelAdd()" class="text-slate-400 hover:text-slate-700">
                <lucide-icon name="x" [size]="16" />
              </button>
            </div>
            
            <div class="p-6 space-y-4">
              <div>
                <label class="block text-xs font-semibold text-slate-600 uppercase mb-1.5">Label (Version/Focus) *</label>
                <input [(ngModel)]="newLabel" type="text" placeholder="e.g. Frontend Engineer - May 2026" class="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 bg-slate-50">
              </div>
              
              <div>
                <label class="block text-xs font-semibold text-slate-600 uppercase mb-1.5">External Link</label>
                <input [(ngModel)]="newLink" type="url" placeholder="e.g. Google Docs URL" class="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 bg-slate-50">
                <p class="text-[10px] text-slate-400 mt-1">Alternatively, you can link to a hosted document.</p>
              </div>

              <div>
                <label class="block text-xs font-semibold text-slate-600 uppercase mb-1.5">Notes (Optional)</label>
                <textarea [(ngModel)]="newNotes" rows="2" placeholder="e.g. Tailored for product companies" class="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 bg-slate-50 resize-y"></textarea>
              </div>
            </div>
            
            <div class="px-6 py-4 border-t border-slate-100 flex items-center justify-end gap-3 bg-slate-50">
              <button (click)="cancelAdd()" class="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-200 rounded-lg">Cancel</button>
              <button (click)="saveResume()" [disabled]="!newLabel.trim()" class="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-lg shadow-sm">Save to Vault</button>
            </div>
          </div>
        </div>
      }
    </div>
  `
})
export class ResumeVaultComponent {
  readonly resumeService = inject(ResumeService);
  
  isAdding = signal(false);
  newLabel = '';
  newLink = '';
  newNotes = '';

  formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  cancelAdd() {
    this.isAdding.set(false);
    this.newLabel = '';
    this.newLink = '';
    this.newNotes = '';
  }

  saveResume() {
    if (!this.newLabel.trim()) return;

    this.resumeService.add({
      label: this.newLabel.trim(),
      externalLink: this.newLink.trim() || undefined,
      notes: this.newNotes.trim() || undefined,
      isDefault: false // Service handles setting the first one as default automatically
    });

    this.cancelAdd();
  }

  makeDefault(id: string) {
    this.resumeService.update(id, { isDefault: true });
  }

  deleteResume(id: string) {
    this.resumeService.delete(id);
  }
}

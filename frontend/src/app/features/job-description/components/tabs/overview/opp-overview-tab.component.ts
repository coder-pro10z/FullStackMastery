import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { OpportunityService } from '../../../services/opportunity.service';
import { ResumeService } from '../../../services/resume.service';
import { NoteService } from '../../../services/note.service';
import { PrepQuestionService } from '../../../services/prep-question.service';
import { OpportunityWorkspaceComponent } from '../../opportunity-workspace/opportunity-workspace.component';
import { LucideAngularModule } from 'lucide-angular';
import { FormsModule } from '@angular/forms';
import { NoteType } from '../../../models/opportunity.models';

@Component({
  selector: 'app-opp-overview-tab',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, FormsModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-6 max-w-5xl">
      
      <!-- ── Top Row: Pinned Resume & Attachments ── -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        <!-- Pinned Resume -->
        <div class="bg-indigo-50 rounded-2xl border border-indigo-100 p-6 flex flex-col justify-between">
          <div class="flex items-start gap-4 mb-4">
            <div class="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-indigo-600 flex-shrink-0">
              <lucide-icon name="file-text" [size]="20" />
            </div>
            <div>
              <h3 class="text-xs font-bold text-indigo-800 uppercase tracking-wider mb-1">Pinned Resume</h3>
              @if (pinnedResume()) {
                <div class="text-sm font-semibold text-slate-800 leading-snug">{{ pinnedResume()!.label }}</div>
                @if (pinnedResume()!.externalLink) {
                  <a [href]="pinnedResume()!.externalLink" target="_blank" class="text-xs font-medium text-blue-600 hover:underline mt-1 inline-flex items-center gap-1">
                    Open <lucide-icon name="external-link" [size]="10" />
                  </a>
                }
              } @else {
                <span class="text-sm text-slate-500">No resume pinned yet.</span>
              }
            </div>
          </div>
          <div class="relative">
            <button (click)="isSelectingResume.set(!isSelectingResume())" class="w-full py-2 bg-white border border-indigo-200 text-indigo-700 text-xs font-bold rounded-lg hover:bg-indigo-100 transition-colors shadow-sm">
              {{ pinnedResume() ? 'Change Resume' : 'Pin Resume' }}
            </button>
            @if (isSelectingResume()) {
              <div class="absolute left-0 right-0 top-full mt-2 bg-white rounded-xl shadow-xl border border-slate-200 z-50 overflow-hidden">
                <div class="max-h-48 overflow-y-auto p-2 space-y-1">
                  @for (resume of resumeService.resumes(); track resume.id) {
                    <button (click)="pinResume(resume.id)" class="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-50 text-sm font-semibold flex items-center justify-between">
                      {{ resume.label }}
                      @if (opp()?.pinnedResumeId === resume.id) { <lucide-icon name="check" [size]="14" class="text-indigo-600" /> }
                    </button>
                  } @empty {
                    <div class="p-3 text-center text-xs text-slate-500">No resumes found.</div>
                  }
                </div>
              </div>
            }
          </div>
        </div>

        <!-- Quick Attachments -->
        <div class="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-sm font-semibold text-slate-800 flex items-center gap-2">
              <lucide-icon name="paperclip" [size]="16" class="text-slate-400" />
              Attachments
            </h3>
            <button class="text-xs font-semibold text-blue-600 hover:underline" (click)="fileInput.click()">+ Upload File</button>
            <input #fileInput type="file" class="hidden" accept="image/*,.pdf" (change)="handleFileUpload($event)">
          </div>
          <div class="flex-1 grid grid-cols-2 gap-2 overflow-y-auto max-h-32">
            @for (att of opp()?.attachments; track att.id) {
              <div class="border border-slate-200 rounded-lg p-2 flex items-center gap-2 bg-slate-50 relative group">
                <lucide-icon [name]="att.type === 'screenshot' ? 'image' : 'file'" [size]="16" class="text-slate-400 flex-shrink-0" />
                <span class="text-xs font-medium text-slate-700 truncate" [title]="att.label">{{ att.label }}</span>
                <button (click)="deleteAttachment(att.id)" class="absolute right-1 opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-red-500 transition-opacity bg-slate-50"><lucide-icon name="trash-2" [size]="12"/></button>
              </div>
            } @empty {
              <div class="col-span-2 flex flex-col items-center justify-center text-slate-400 h-full border-2 border-dashed border-slate-100 rounded-lg p-2">
                <span class="text-xs">No screenshots or files added.</span>
              </div>
            }
          </div>
        </div>
      </div>

      <!-- ── Job Description Section ── -->
      <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div class="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h3 class="text-sm font-semibold text-slate-800 flex items-center gap-2">
            <lucide-icon name="file-text" [size]="16" class="text-slate-400" />
            Job Description
          </h3>
          <div class="flex gap-4">
            @if (opp()?.jdLink) {
              <a [href]="opp()!.jdLink" target="_blank" class="text-xs font-medium text-blue-600 hover:underline flex items-center gap-1">
                Original Posting <lucide-icon name="external-link" [size]="12" />
              </a>
            }
            <button (click)="parent.openEditModal()" class="text-xs font-semibold text-slate-500 hover:text-slate-800">Edit Details</button>
          </div>
        </div>
        
        <div class="p-6 max-h-96 overflow-y-auto">
          @if (opp()?.jdText) {
            <pre class="text-sm text-slate-600 font-sans whitespace-pre-wrap leading-relaxed">{{ opp()!.jdText }}</pre>
          } @else {
            <div class="py-8 text-center">
              <lucide-icon name="file-text" [size]="32" class="text-slate-200 mx-auto mb-3" />
              <p class="text-sm text-slate-500 mb-2">No job description text added.</p>
              <button (click)="parent.openEditModal()" class="text-sm px-4 py-2 bg-blue-50 text-blue-700 font-bold rounded-lg hover:bg-blue-100 transition-colors">Add Description</button>
            </div>
          }
        </div>
      </div>

      <!-- ── Unified Notes & Questions (Dashboard Style) ── -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        <!-- Recent Notes -->
        <div class="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col h-96">
          <div class="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h3 class="text-sm font-semibold text-slate-800 flex items-center gap-2">
              <lucide-icon name="book-open" [size]="16" class="text-slate-400" /> Notes
            </h3>
            <button (click)="isAddingNote.set(true)" class="text-xs font-bold text-blue-600 hover:underline">+ New Note</button>
          </div>
          
          <div class="flex-1 overflow-y-auto p-4 space-y-3">
            @if (isAddingNote()) {
              <div class="bg-slate-50 rounded-lg p-3 border border-slate-200">
                <input [(ngModel)]="newNoteTitle" placeholder="Note Title..." class="w-full px-2 py-1.5 text-sm font-semibold border border-slate-200 rounded mb-2">
                <textarea [(ngModel)]="newNoteContent" placeholder="Write your note here..." class="w-full px-2 py-1.5 text-sm border border-slate-200 rounded mb-2 h-20 resize-none"></textarea>
                <div class="flex justify-end gap-2">
                  <button (click)="isAddingNote.set(false)" class="text-xs font-semibold text-slate-500 px-2 py-1">Cancel</button>
                  <button (click)="saveNote()" class="text-xs font-bold text-white bg-blue-600 px-3 py-1 rounded hover:bg-blue-700">Save</button>
                </div>
              </div>
            }
            
            @for (note of recentNotes(); track note.id) {
              <div class="p-3 border border-slate-100 rounded-lg hover:bg-slate-50 transition-colors">
                <div class="flex items-center gap-2 mb-1">
                  <span class="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-slate-200 text-slate-700">{{ note.type }}</span>
                  <h4 class="text-sm font-bold text-slate-800 truncate">{{ note.title }}</h4>
                </div>
                <p class="text-xs text-slate-500 line-clamp-2 leading-relaxed">{{ note.content }}</p>
              </div>
            } @empty {
              @if (!isAddingNote()) {
                <div class="h-full flex flex-col items-center justify-center text-center p-4">
                  <span class="text-sm text-slate-400 mb-2">No notes added yet.</span>
                  <button (click)="isAddingNote.set(true)" class="text-xs font-semibold text-blue-600 border border-blue-200 px-3 py-1.5 rounded-lg hover:bg-blue-50">Create Note</button>
                </div>
              }
            }
          </div>
          <div class="px-6 py-3 border-t border-slate-100 bg-slate-50 text-center">
            <a [routerLink]="['../notes']" class="text-xs font-bold text-slate-600 hover:text-slate-900">View All Notes &rarr;</a>
          </div>
        </div>

        <!-- Recent Questions -->
        <div class="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col h-96">
          <div class="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h3 class="text-sm font-semibold text-slate-800 flex items-center gap-2">
              <lucide-icon name="circle-help" [size]="16" class="text-slate-400" /> Questions
            </h3>
            <button (click)="isAddingQuestion.set(true)" class="text-xs font-bold text-blue-600 hover:underline">+ New Question</button>
          </div>
          
          <div class="flex-1 overflow-y-auto p-4 space-y-3">
            @if (isAddingQuestion()) {
              <div class="bg-slate-50 rounded-lg p-3 border border-slate-200">
                <textarea [(ngModel)]="newQuestionText" placeholder="e.g. Tell me about a time you..." class="w-full px-2 py-1.5 text-sm border border-slate-200 rounded mb-2 h-16 resize-none"></textarea>
                <div class="flex items-center justify-between mb-2">
                  <select [(ngModel)]="newQuestionComplexity" class="text-xs border border-slate-200 rounded px-1 py-1">
                    <option value="simple">Simple</option>
                    <option value="medium">Medium</option>
                    <option value="complex">Complex</option>
                  </select>
                </div>
                <div class="flex justify-end gap-2">
                  <button (click)="isAddingQuestion.set(false)" class="text-xs font-semibold text-slate-500 px-2 py-1">Cancel</button>
                  <button (click)="saveQuestion()" class="text-xs font-bold text-white bg-blue-600 px-3 py-1 rounded hover:bg-blue-700">Add</button>
                </div>
              </div>
            }

            @for (q of recentQuestions(); track q.id) {
              <div class="p-3 border border-slate-100 rounded-lg hover:bg-slate-50 transition-colors flex flex-col">
                <div class="flex items-center gap-2 mb-1.5">
                  <span class="w-2 h-2 rounded-full" 
                        [class.bg-emerald-400]="q.complexity === 'simple'"
                        [class.bg-amber-400]="q.complexity === 'medium'"
                        [class.bg-rose-400]="q.complexity === 'complex'"></span>
                  <span class="text-[10px] font-bold uppercase tracking-wider text-slate-500">{{ q.status }}</span>
                </div>
                <h4 class="text-sm font-semibold text-slate-800 leading-snug">{{ q.text }}</h4>
              </div>
            } @empty {
              @if (!isAddingQuestion()) {
                <div class="h-full flex flex-col items-center justify-center text-center p-4">
                  <span class="text-sm text-slate-400 mb-2">No questions tracked.</span>
                  <button (click)="isAddingQuestion.set(true)" class="text-xs font-semibold text-blue-600 border border-blue-200 px-3 py-1.5 rounded-lg hover:bg-blue-50">Track Question</button>
                </div>
              }
            }
          </div>
          <div class="px-6 py-3 border-t border-slate-100 bg-slate-50 text-center">
            <a [routerLink]="['../questions']" class="text-xs font-bold text-slate-600 hover:text-slate-900">View All Questions &rarr;</a>
          </div>
        </div>
      </div>
      
    </div>
  `
})
export class OppOverviewTabComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly oppService = inject(OpportunityService);
  readonly resumeService = inject(ResumeService);
  readonly noteService = inject(NoteService);
  readonly questionService = inject(PrepQuestionService);
  
  // Inject parent to access its modal
  readonly parent = inject(OpportunityWorkspaceComponent);
  
  readonly oppId = computed(() => this.route.parent?.snapshot.paramMap.get('id') || '');
  readonly opp = computed(() => this.oppService.getById(this.oppId()));
  
  readonly pinnedResume = computed(() => {
    const o = this.opp();
    if (!o?.pinnedResumeId) return null;
    return this.resumeService.getById(o.pinnedResumeId);
  });

  // Derived dashboard data
  readonly recentNotes = computed(() => this.noteService.getByOpportunityId(this.oppId()).slice(0, 3));
  readonly recentQuestions = computed(() => this.questionService.getByOpportunityId(this.oppId()).slice(0, 3));

  readonly isSelectingResume = signal(false);

  // Quick Add State - Note
  readonly isAddingNote = signal(false);
  newNoteTitle = '';
  newNoteContent = '';

  // Quick Add State - Question
  readonly isAddingQuestion = signal(false);
  newQuestionText = '';
  newQuestionComplexity: 'simple'|'medium'|'complex' = 'medium';

  pinResume(resumeId: string) {
    if (this.oppId()) {
      this.oppService.update(this.oppId(), { pinnedResumeId: resumeId });
      this.isSelectingResume.set(false);
    }
  }

  saveNote() {
    if (!this.newNoteTitle.trim() || !this.newNoteContent.trim()) return;
    this.noteService.add({
      opportunityId: this.oppId(),
      title: this.newNoteTitle.trim(),
      type: 'general',
      content: this.newNoteContent.trim(),
      isPinned: false,
      attachments: [],
      sources: [],
      linkedKeywords: [],
      linkedQuestionIds: [],
      linkedTopicIds: []
    });
    this.isAddingNote.set(false);
    this.newNoteTitle = '';
    this.newNoteContent = '';
  }

  saveQuestion() {
    if (!this.newQuestionText.trim()) return;
    this.questionService.add({
      opportunityId: this.oppId(),
      source: 'custom',
      text: this.newQuestionText.trim(),
      complexity: this.newQuestionComplexity,
      status: 'todo',
      answerAttachments: [],
      resources: [],
      linkedKeywords: []
    });
    this.isAddingQuestion.set(false);
    this.newQuestionText = '';
    this.newQuestionComplexity = 'medium';
  }

  handleFileUpload(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      const reader = new FileReader();
      
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        const o = this.opp();
        if (o) {
          const newAtt = {
            id: crypto.randomUUID(),
            opportunityId: o.id,
            type: file.type.startsWith('image/') ? 'screenshot' : 'document',
            label: file.name,
            dataUrl: dataUrl,
            mimeType: file.type,
            sizeBytes: file.size,
            createdAt: new Date().toISOString()
          } as any; // Using any due to Attachment type cast strictness
          
          this.oppService.update(o.id, { attachments: [...(o.attachments || []), newAtt] });
        }
      };
      
      reader.readAsDataURL(file);
    }
  }

  deleteAttachment(attId: string) {
    const o = this.opp();
    if (o) {
      this.oppService.update(o.id, {
        attachments: (o.attachments || []).filter(a => a.id !== attId)
      });
    }
  }
}

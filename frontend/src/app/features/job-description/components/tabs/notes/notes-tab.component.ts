import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { FormsModule } from '@angular/forms';
import { NoteService } from '../../../services/note.service';
import { NoteType } from '../../../models/opportunity.models';

@Component({
  selector: 'app-notes-tab',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="h-full flex flex-col">
      <!-- ── Header & Action ── -->
      <div class="flex items-center justify-between mb-6">
        <h3 class="text-sm font-semibold text-slate-800 flex items-center gap-2">
          <lucide-icon name="book-open" [size]="16" class="text-slate-400" />
          Prep Notebook
        </h3>
        
        <button 
          (click)="isAdding.set(true)"
          class="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 shadow-sm transition-colors"
        >
          <lucide-icon name="plus" [size]="14" /> New Note
        </button>
      </div>

      <!-- ── Notes List ── -->
      <div class="flex-1 overflow-y-auto space-y-4 pb-12">
        @for (note of notes(); track note.id) {
          <div class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div class="px-5 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div class="flex items-center gap-3">
                <span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-200 text-slate-700">
                  {{ note.type }}
                </span>
                <h4 class="text-sm font-bold text-slate-800">{{ note.title }}</h4>
              </div>
              <div class="flex items-center gap-2">
                @if (note.isPinned) {
                  <lucide-icon name="pin" [size]="14" class="text-amber-500" />
                }
                <button (click)="deleteNote(note.id)" class="text-slate-400 hover:text-red-500 transition-colors p-1">
                  <lucide-icon name="trash-2" [size]="14" />
                </button>
              </div>
            </div>
            
            <div class="p-5">
              <pre class="text-sm text-slate-600 font-sans whitespace-pre-wrap leading-relaxed">{{ note.content }}</pre>
            </div>
            
            <div class="px-5 py-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400 bg-slate-50">
              <span>Last updated {{ formatDate(note.updatedAt) }}</span>
            </div>
          </div>
        } @empty {
          <div class="bg-white rounded-2xl border border-dashed border-slate-300 py-16 flex flex-col items-center justify-center text-center">
            <div class="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mb-4">
              <lucide-icon name="book-open" [size]="24" class="text-slate-300" />
            </div>
            <h4 class="text-slate-600 font-bold mb-1">Notebook is Empty</h4>
            <p class="text-sm text-slate-400 max-w-sm mb-4">
              Keep your research, interview prep, and follow-up notes perfectly organized for this role.
            </p>
            <button (click)="isAdding.set(true)" class="text-sm font-semibold text-blue-600 hover:text-blue-700 hover:underline">
              Create your first note
            </button>
          </div>
        }
      </div>

      <!-- ── Add Note Drawer ── -->
      @if (isAdding()) {
        <div class="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex justify-end">
          <div class="h-full w-full max-w-2xl bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
            <div class="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h3 class="text-sm font-bold text-slate-800">New Note</h3>
              <button (click)="cancelAdd()" class="text-slate-400 hover:text-slate-700 p-1">
                <lucide-icon name="x" [size]="18" />
              </button>
            </div>
            
            <div class="flex-1 overflow-y-auto p-6 space-y-5">
              <div>
                <label class="block text-xs font-semibold text-slate-600 uppercase mb-1.5">Title *</label>
                <input [(ngModel)]="newTitle" type="text" placeholder="e.g. Research: Chrome V8 Architecture" class="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500">
              </div>

              <div>
                <label class="block text-xs font-semibold text-slate-600 uppercase mb-1.5">Note Type</label>
                <select [(ngModel)]="newType" class="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500">
                  <option value="research">Company/Role Research</option>
                  <option value="interview-prep">Interview Prep</option>
                  <option value="follow-up">Follow-up Notes</option>
                  <option value="general">General</option>
                </select>
              </div>

              <div class="flex-1 flex flex-col">
                <label class="block text-xs font-semibold text-slate-600 uppercase mb-1.5">Content *</label>
                <textarea [(ngModel)]="newContent" placeholder="Write your notes here..." class="w-full h-64 px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none font-sans text-sm"></textarea>
              </div>
              
              <div class="flex items-center gap-2">
                <input type="checkbox" id="pinNote" [(ngModel)]="newIsPinned" class="rounded text-blue-600 focus:ring-blue-500 border-slate-300">
                <label for="pinNote" class="text-sm text-slate-700">Pin to top</label>
              </div>
            </div>
            
            <div class="px-6 py-4 border-t border-slate-200 bg-slate-50 flex justify-end gap-3">
              <button (click)="cancelAdd()" class="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-200 rounded-lg transition-colors">Cancel</button>
              <button (click)="saveNote()" [disabled]="!newTitle.trim() || !newContent.trim()" class="px-6 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg shadow-sm transition-colors">Save Note</button>
            </div>
          </div>
        </div>
      }
    </div>
  `
})
export class NotesTabComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly noteService = inject(NoteService);
  
  readonly oppId = computed(() => this.route.parent?.snapshot.paramMap.get('id') || '');
  
  readonly notes = computed(() => {
    return this.noteService.getByOpportunityId(this.oppId())
      .sort((a, b) => {
        // Pinned first, then by date desc
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      });
  });

  isAdding = signal(false);
  newTitle = '';
  newType: NoteType = 'research';
  newContent = '';
  newIsPinned = false;

  formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  cancelAdd() {
    this.isAdding.set(false);
    this.newTitle = '';
    this.newType = 'research';
    this.newContent = '';
    this.newIsPinned = false;
  }

  saveNote() {
    if (!this.newTitle.trim() || !this.newContent.trim()) return;

    this.noteService.add({
      opportunityId: this.oppId(),
      title: this.newTitle.trim(),
      type: this.newType,
      content: this.newContent.trim(),
      isPinned: this.newIsPinned,
      attachments: [],
      sources: [],
      linkedKeywords: [],
      linkedQuestionIds: [],
      linkedTopicIds: []
    });

    this.cancelAdd();
  }

  deleteNote(id: string) {
    if (confirm('Are you sure you want to delete this note?')) {
      this.noteService.delete(id);
    }
  }
}

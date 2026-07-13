import { Component, ChangeDetectionStrategy, signal, computed, inject, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { AdminInterviewStore } from '../../../core/state/admin-interview.store';
import { Question } from '../../../core/models/admin-interview.models';

@Component({
  selector: 'app-immersive-editor',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!-- Full screen overlay container for Immersive Editor -->
    <div class="fixed inset-0 z-50 bg-slate-950 flex flex-col overflow-hidden animate-fade-in font-sans">
      
      <!-- ── Top Toolbar ── -->
      <div class="h-14 border-b border-slate-800 bg-slate-900 flex items-center justify-between px-6 flex-shrink-0">
        <div class="flex items-center gap-4">
          <button (click)="closeEditor()" class="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">
            <lucide-icon name="arrow-left" [size]="20"></lucide-icon>
          </button>
          <div>
            <h1 class="text-white font-bold tracking-tight text-sm flex items-center gap-2">
              <lucide-icon name="pencil-ruler" [size]="16" class="text-indigo-400"></lucide-icon>
              Solution Editor
            </h1>
            <p class="text-xs text-slate-500">{{ store.activeQuestion()?.title || 'Editing Question' }}</p>
          </div>
        </div>
        
        <div class="flex items-center gap-3">
          <button (click)="activeTab.set('markdown')" 
                  class="px-3 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider transition-colors"
                  [class.bg-slate-800]="activeTab() === 'markdown'"
                  [class.text-white]="activeTab() === 'markdown'"
                  [class.text-slate-500]="activeTab() !== 'markdown'">
            Markdown
          </button>
          <button (click)="activeTab.set('diagram')" 
                  class="px-3 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider transition-colors"
                  [class.bg-slate-800]="activeTab() === 'diagram'"
                  [class.text-white]="activeTab() === 'diagram'"
                  [class.text-slate-500]="activeTab() !== 'diagram'">
            Mermaid Diagram
          </button>
          <div class="w-px h-5 bg-slate-800 mx-2"></div>
          <button (click)="saveChanges()" class="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-1.5 rounded-md text-sm font-semibold shadow-sm transition-colors flex items-center gap-2">
            <lucide-icon name="save" [size]="16"></lucide-icon>
            Save Changes
          </button>
        </div>
      </div>

      <!-- ── Split Screen ── -->
      <div class="flex-1 flex overflow-hidden">
        
        <!-- Left: Input Area -->
        <div class="w-1/2 border-r border-slate-800 bg-slate-950 flex flex-col">
          @if (activeTab() === 'markdown') {
            <div class="p-2 border-b border-slate-800 bg-slate-900 flex gap-2">
              <button class="p-1.5 text-slate-400 hover:text-white rounded"><lucide-icon name="bold" [size]="16"></lucide-icon></button>
              <button class="p-1.5 text-slate-400 hover:text-white rounded"><lucide-icon name="italic" [size]="16"></lucide-icon></button>
              <button class="p-1.5 text-slate-400 hover:text-white rounded"><lucide-icon name="list" [size]="16"></lucide-icon></button>
              <button class="p-1.5 text-slate-400 hover:text-white rounded"><lucide-icon name="code" [size]="16"></lucide-icon></button>
            </div>
            <textarea [(ngModel)]="markdownContent" 
                      placeholder="Write your detailed solution here using Markdown..."
                      class="flex-1 w-full bg-transparent text-slate-300 p-6 focus:outline-none resize-none font-mono text-sm leading-relaxed scrollbar-premium"></textarea>
          } @else {
            <div class="p-2 border-b border-slate-800 bg-slate-900">
              <span class="text-xs text-slate-400 font-mono pl-2">Mermaid.js Diagram Builder</span>
            </div>
            <textarea [(ngModel)]="diagramContent" 
                      placeholder="graph TD;\n    A-->B;"
                      class="flex-1 w-full bg-transparent text-indigo-300 p-6 focus:outline-none resize-none font-mono text-sm leading-relaxed scrollbar-premium"></textarea>
          }
        </div>

        <!-- Right: Live Preview Area (Dark Mode) -->
        <div class="w-1/2 bg-slate-900 overflow-y-auto p-8 scrollbar-premium">
          <div class="max-w-2xl mx-auto">
            <div class="flex items-center gap-3 mb-6">
              <span class="px-2.5 py-1 rounded text-xs font-bold uppercase tracking-wider bg-slate-800 text-emerald-400 border border-slate-700">
                Live Preview
              </span>
            </div>
            
            <article class="prose prose-invert max-w-none">
              <!-- In a real app, use ngx-markdown. Simulating rendered content here -->
              @if (activeTab() === 'markdown') {
                <div class="text-slate-300 whitespace-pre-wrap font-sans leading-loose">
                  {{ markdownContent() || '*Preview will appear here...*' }}
                </div>
              } @else {
                <div class="p-8 bg-slate-800 rounded-xl border border-slate-700 flex items-center justify-center">
                  <pre class="text-indigo-400 font-mono text-sm text-center">{{ diagramContent() || 'Mermaid graph will render here' }}</pre>
                </div>
              }
            </article>
          </div>
        </div>

      </div>
    </div>
  `
})
export class ImmersiveEditorComponent implements OnInit {
  store = inject(AdminInterviewStore);
  
  @Output() onClose = new EventEmitter<void>();
  @Output() onSave = new EventEmitter<string>();

  activeTab = signal<'markdown' | 'diagram'>('markdown');
  
  // Local state for editing
  markdownContent = signal<string>('');
  diagramContent = signal<string>('');

  ngOnInit(): void {
    const q = this.store.activeQuestion();
    if (q) {
      this.markdownContent.set(q.solutionMarkdown || '');
      this.diagramContent.set(q.diagramJSON || '');
    }
  }

  saveChanges() {
    this.onSave.emit(this.markdownContent());
  }

  closeEditor() {
    this.onClose.emit();
  }
}

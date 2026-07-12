import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { FormsModule } from '@angular/forms';
import { PrepQuestionService } from '../../../services/prep-question.service';
import { PrepQuestion } from '../../../models/opportunity.models';

@Component({
  selector: 'app-questions-tab',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="h-full flex flex-col">
      <!-- ── Header & Action ── -->
      <div class="flex items-center justify-between mb-6">
        <h3 class="text-sm font-semibold text-slate-800 flex items-center gap-2">
          <lucide-icon name="circle-help" [size]="16" class="text-slate-400" />
          Interview Questions
        </h3>
        
        <button 
          (click)="isAdding.set(true)"
          class="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 shadow-sm transition-colors"
        >
          <lucide-icon name="plus" [size]="14" /> Add Question
        </button>
      </div>

      <!-- ── Questions List ── -->
      <div class="flex-1 overflow-y-auto space-y-4 pb-12">
        @for (question of questions(); track question.id) {
          <div class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden group transition-all"
               [class.border-emerald-200]="question.status === 'confident'"
               [class.border-amber-200]="question.status === 'needs-review'">
            
            <div class="px-5 py-3 border-b border-slate-100 flex items-start justify-between bg-slate-50/50">
              <div class="flex-1 pr-4">
                <div class="flex items-center gap-2 mb-2">
                  <span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider"
                        [ngClass]="getComplexityClass(question.complexity)">
                    {{ question.complexity }}
                  </span>
                  @if (question.category) {
                    <span class="text-xs font-semibold text-slate-500">{{ question.category }}</span>
                  }
                </div>
                <h4 class="text-sm font-bold text-slate-800 leading-snug">{{ question.text }}</h4>
              </div>
              
              <div class="flex items-center gap-2 flex-shrink-0">
                <select [ngModel]="question.status" (ngModelChange)="updateStatus(question.id, $event)" class="text-xs font-semibold px-2 py-1 rounded border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer">
                  <option value="todo">To Do</option>
                  <option value="drafted">Drafted</option>
                  <option value="needs-review">Needs Review</option>
                  <option value="confident">Confident</option>
                </select>
                <button (click)="deleteQuestion(question.id)" class="text-slate-400 hover:text-red-500 transition-colors p-1">
                  <lucide-icon name="trash-2" [size]="14" />
                </button>
              </div>
            </div>
            
            <div class="p-0 border-t border-slate-100 bg-white relative">
              <textarea 
                [ngModel]="question.myAnswer" 
                (ngModelChange)="updateAnswer(question.id, $event)" 
                placeholder="Draft your answer here..." 
                class="w-full h-32 p-4 text-sm font-sans text-slate-600 focus:outline-none resize-y"
              ></textarea>
              <div class="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <span class="text-[10px] font-medium text-slate-400 bg-white px-2 py-1 rounded border border-slate-100">Auto-saved</span>
              </div>
            </div>
          </div>
        } @empty {
          <div class="bg-white rounded-2xl border border-dashed border-slate-300 py-16 flex flex-col items-center justify-center text-center">
            <div class="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mb-4">
              <lucide-icon name="circle-help" [size]="24" class="text-slate-300" />
            </div>
            <h4 class="text-slate-600 font-bold mb-1">No Questions Yet</h4>
            <p class="text-sm text-slate-400 max-w-sm mb-4">
              Add expected interview questions or behavioral prompts and draft your answers.
            </p>
            <button (click)="isAdding.set(true)" class="text-sm font-semibold text-blue-600 hover:text-blue-700 hover:underline">
              Add your first question
            </button>
          </div>
        }
      </div>

      <!-- ── Add Question Drawer ── -->
      @if (isAdding()) {
        <div class="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex justify-end">
          <div class="h-full w-full max-w-md bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
            <div class="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h3 class="text-sm font-bold text-slate-800">Add Question</h3>
              <button (click)="cancelAdd()" class="text-slate-400 hover:text-slate-700 p-1">
                <lucide-icon name="x" [size]="18" />
              </button>
            </div>
            
            <div class="flex-1 overflow-y-auto p-6 space-y-5">
              <div>
                <label class="block text-xs font-semibold text-slate-600 uppercase mb-1.5">Question Text *</label>
                <textarea [(ngModel)]="newText" rows="3" placeholder="e.g. Tell me about a time you had to resolve a conflict..." class="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm"></textarea>
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-xs font-semibold text-slate-600 uppercase mb-1.5">Complexity</label>
                  <select [(ngModel)]="newComplexity" class="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 text-sm">
                    <option value="simple">Simple</option>
                    <option value="medium">Medium</option>
                    <option value="complex">Complex</option>
                  </select>
                </div>
                <div>
                  <label class="block text-xs font-semibold text-slate-600 uppercase mb-1.5">Category</label>
                  <input [(ngModel)]="newCategory" type="text" placeholder="e.g. Behavioral" class="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 text-sm">
                </div>
              </div>
            </div>
            
            <div class="px-6 py-4 border-t border-slate-200 bg-slate-50 flex justify-end gap-3">
              <button (click)="cancelAdd()" class="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-200 rounded-lg transition-colors">Cancel</button>
              <button (click)="saveQuestion()" [disabled]="!newText.trim()" class="px-6 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg shadow-sm transition-colors">Add Question</button>
            </div>
          </div>
        </div>
      }
    </div>
  `
})
export class QuestionsTabComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly questionService = inject(PrepQuestionService);
  
  readonly oppId = computed(() => this.route.parent?.snapshot.paramMap.get('id') || '');
  
  readonly questions = computed(() => {
    return this.questionService.getByOpportunityId(this.oppId());
  });

  isAdding = signal(false);
  newText = '';
  newComplexity: 'simple' | 'medium' | 'complex' = 'medium';
  newCategory = '';

  getComplexityClass(complexity: string): string {
    switch (complexity) {
      case 'simple': return 'bg-emerald-100 text-emerald-700';
      case 'medium': return 'bg-amber-100 text-amber-700';
      case 'complex': return 'bg-rose-100 text-rose-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  }

  cancelAdd() {
    this.isAdding.set(false);
    this.newText = '';
    this.newComplexity = 'medium';
    this.newCategory = '';
  }

  saveQuestion() {
    if (!this.newText.trim()) return;

    this.questionService.add({
      opportunityId: this.oppId(),
      source: 'custom',
      text: this.newText.trim(),
      complexity: this.newComplexity,
      category: this.newCategory.trim() || undefined,
      status: 'todo',
      answerAttachments: [],
      resources: [],
      linkedKeywords: []
    });

    this.cancelAdd();
  }

  updateStatus(id: string, newStatus: any) {
    this.questionService.update(id, { status: newStatus });
  }

  updateAnswer(id: string, newAnswer: string) {
    this.questionService.update(id, { myAnswer: newAnswer });
  }

  deleteQuestion(id: string) {
    if (confirm('Are you sure you want to delete this question?')) {
      this.questionService.delete(id);
    }
  }
}

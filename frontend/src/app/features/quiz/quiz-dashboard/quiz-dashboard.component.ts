import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CategoryService } from '../../../core/services/category.service';
import { QuizService, CreateQuizAttemptDto, QuizMode } from '../../../core/services/quiz.service';
import { CategoryTreeDto } from '../../../core/models/category.models';
import { Difficulty } from '../../../core/models/question.models';

@Component({
  selector: 'app-quiz-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
  <div class="space-y-6 max-w-2xl mx-auto py-8">
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-white tracking-tight mb-2">Quiz Setup</h1>
      <p class="text-slate-400">Configure your quiz or assessment session.</p>
    </div>

    <div class="glass-panel p-6 rounded-2xl border border-white/5 shadow-2xl space-y-6 relative overflow-hidden">
      <!-- Decorator -->
      <div class="absolute -top-12 -right-12 w-40 h-40 bg-blue-500/10 blur-[50px] rounded-full pointer-events-none"></div>

      <!-- Mode Selection -->
      <div class="space-y-3">
        <label class="block text-sm font-medium text-slate-300">Mode</label>
        <div class="grid grid-cols-2 gap-4">
          <div (click)="form.mode = 'Practice'"
               class="p-4 rounded-xl border border-white/10 cursor-pointer transition-all form-radio-group hover:bg-white/5"
               [class.ring-2]="form.mode === 'Practice'" [class.ring-blue-500]="form.mode === 'Practice'">
            <div class="text-white font-medium mb-1">Practice Mode</div>
            <div class="text-xs text-slate-400">See answers immediately, self-mark correctness.</div>
          </div>
          <div (click)="form.mode = 'Assessment'"
               class="p-4 rounded-xl border border-white/10 cursor-pointer transition-all form-radio-group hover:bg-white/5"
               [class.ring-2]="form.mode === 'Assessment'" [class.ring-blue-500]="form.mode === 'Assessment'">
            <div class="text-white font-medium mb-1">Assessment Mode</div>
            <div class="text-xs text-slate-400">Answers are hidden until the end.</div>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-white/10">
        <!-- Category -->
        <div class="space-y-2">
          <label class="block text-sm font-medium text-slate-300">Category</label>
          <select [(ngModel)]="form.categoryId" class="input-dark w-full">
            <option [ngValue]="null">Any Category</option>
            <ng-container *ngFor="let cat of flatCategories()">
              <option [ngValue]="cat.id">
                {{ '&nbsp;&nbsp;&nbsp;&nbsp;'.repeat(cat.depth) }}{{ cat.name }}
              </option>
            </ng-container>
          </select>
        </div>

        <!-- Role -->
        <div class="space-y-2">
          <label class="block text-sm font-medium text-slate-300">Role Focus</label>
          <select [(ngModel)]="form.role" class="input-dark w-full">
            <option [ngValue]="null">Any Role</option>
            <option *ngFor="let r of roles" [ngValue]="r">{{ r }}</option>
          </select>
        </div>

        <!-- Difficulty -->
        <div class="space-y-2">
          <label class="block text-sm font-medium text-slate-300">Difficulty</label>
          <select [(ngModel)]="form.difficulty" class="input-dark w-full">
            <option [ngValue]="null">Any Difficulty</option>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>
        </div>

        <!-- Count -->
        <div class="space-y-2">
          <label class="block text-sm font-medium text-slate-300">Number of Questions</label>
          <input type="number" [(ngModel)]="form.questionCount" min="1" max="50" class="input-dark w-full">
        </div>
      </div>

      <div class="pt-6 border-t border-white/10 flex justify-end">
        <button (click)="startQuiz()" [disabled]="starting()"
                class="btn-primary w-full sm:w-auto px-8 py-2.5 flex items-center justify-center gap-2">
          @if (starting()) {
            <div class="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
            <span>Preparing...</span>
          } @else {
            <span>Start Quiz</span>
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
          }
        </button>
      </div>
    </div>
  </div>
  `
})
export class QuizDashboardComponent implements OnInit {
  private quizService = inject(QuizService);
  private categoryService = inject(CategoryService);
  private router = inject(Router);

  roles = ['Software Engineer', 'Frontend Developer', 'Backend Developer', 'Full Stack Developer', 'Data Scientist', 'DevOps', 'QA Engineer', 'Product Manager'];
  categories = signal<CategoryTreeDto[]>([]);
  starting = signal(false);

  form: CreateQuizAttemptDto = {
    mode: 'Practice',
    categoryId: null as any,
    role: null as any,
    difficulty: null as any,
    questionCount: 10
  };

  flatCategories = signal<{ id: number; name: string; depth: number }[]>([]);

  ngOnInit() {
    this.categoryService.getTree().subscribe(res => {
      this.categories.set(res);
      this.flatCategories.set(this.flattenCategories(res));
    });
  }

  startQuiz() {
    this.starting.set(true);
    const dto: CreateQuizAttemptDto = { ...this.form };
    if (!dto.categoryId) delete dto.categoryId;
    if (!dto.role) delete dto.role;
    if (!dto.difficulty) delete dto.difficulty;

    this.quizService.createAttempt(dto).subscribe({
      next: (attempt) => {
        this.router.navigate(['/quiz', attempt.id]);
      },
      error: (err) => {
        console.error('Failed to start quiz', err);
        this.starting.set(false);
      }
    });
  }

  private flattenCategories(cats: CategoryTreeDto[], depth = 0): { id: number; name: string; depth: number }[] {
    return cats.reduce((acc, cat) => {
      acc.push({ id: cat.id, name: cat.name, depth });
      if (cat.subCategories && cat.subCategories.length > 0) {
        acc.push(...this.flattenCategories(cat.subCategories, depth + 1));
      }
      return acc;
    }, [] as { id: number; name: string; depth: number }[]);
  }
}

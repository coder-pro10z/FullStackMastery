import { CommonModule } from '@angular/common';
import { Component, effect, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { QuizService, QuizAttemptDto, QuizAttemptQuestionDto } from '../../../core/services/quiz.service';

@Component({
  selector: 'app-quiz-player',
  standalone: true,
  imports: [CommonModule],
  template: `
  @if (loading()) {
    <div class="flex items-center justify-center min-h-[50vh]">
      <div class="w-8 h-8 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
    </div>
  } @else if (attempt()) {
    <div class="max-w-3xl mx-auto py-8">
      <!-- Header -->
      <div class="flex items-center justify-between mb-8">
        <div>
          <h1 class="text-2xl font-bold text-white tracking-tight">Quiz Session</h1>
          <p class="text-sm text-slate-400 mt-1">Mode: {{ attempt()!.mode }}</p>
        </div>
        <div class="flex gap-2 font-mono text-sm">
          <span class="px-3 py-1.5 rounded-lg bg-blue-500/10 text-blue-400 font-medium">
            {{ currentIndex() + 1 }} / {{ attempt()!.totalQuestions }}
          </span>
        </div>
      </div>

      <!-- Question Card -->
      @if (currentQuestion()) {
        <div class="glass-panel p-6 md:p-8 rounded-2xl border border-white/5 shadow-2xl space-y-8 animate-fade-in relative overflow-hidden">
          
          <div class="prose prose-invert prose-sm md:prose-base max-w-none">
            <h2 class="text-xl font-bold text-white mb-4">{{ currentQuestion()!.title }}</h2>
            <div [innerHTML]="currentQuestion()!.questionText"></div>
          </div>

          <!-- Answer Section -->
          @if (showingAnswer() || attempt()!.mode === 'Practice') {
            <div class="mt-8 pt-8 border-t border-white/10 space-y-4 animate-fade-in" 
                 [class.hidden]="!showingAnswer() && attempt()!.mode === 'Assessment'">
              
              <h3 class="text-sm font-medium text-slate-400 uppercase tracking-wider">Answer</h3>
              
              @if (currentQuestion()!.answerText) {
                <div class="prose prose-invert prose-sm md:prose-base max-w-none text-slate-300" 
                     [innerHTML]="currentQuestion()!.answerText"></div>
              } @else {
                <div class="text-slate-500 text-sm italic">Reveal your answer below or assess later.</div>
              }
              
              <!-- Self-Marking Controls -->
              @if (currentQuestion()!.answerText) {
                <div class="flex items-center gap-3 pt-6 border-t border-white/5">
                  <span class="text-sm text-slate-400 mr-2">How did you do?</span>
                  
                  <button (click)="markResponse(true)" 
                          class="px-4 py-2 rounded-xl text-sm font-medium transition-all"
                          [class.bg-green-500]="currentQuestion()!.response?.isSelfMarkedCorrect === true"
                          [class.text-white]="currentQuestion()!.response?.isSelfMarkedCorrect === true"
                          [class.bg-green-500.opacity-10]="currentQuestion()!.response?.isSelfMarkedCorrect !== true"
                          [class.text-green-500]="currentQuestion()!.response?.isSelfMarkedCorrect !== true"
                          [class.hover:bg-green-500.opacity-20]="currentQuestion()!.response?.isSelfMarkedCorrect !== true">
                    <span class="flex items-center gap-2">
                       <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                       Correct
                    </span>
                  </button>

                  <button (click)="markResponse(false)"
                          class="px-4 py-2 rounded-xl text-sm font-medium transition-all"
                          [class.bg-red-500]="currentQuestion()!.response?.isSelfMarkedCorrect === false"
                          [class.text-white]="currentQuestion()!.response?.isSelfMarkedCorrect === false"
                          [class.bg-red-500.opacity-10]="currentQuestion()!.response?.isSelfMarkedCorrect !== false"
                          [class.text-red-500]="currentQuestion()!.response?.isSelfMarkedCorrect !== false"
                          [class.hover:bg-red-500.opacity-20]="currentQuestion()!.response?.isSelfMarkedCorrect !== false">
                    <span class="flex items-center gap-2">
                       <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                       Incorrect
                    </span>
                  </button>
                </div>
              }
            </div>
          }

          <!-- Reveal Control for Practice Mode -->
          @if (!showingAnswer() && attempt()!.mode === 'Practice') {
            <div class="mt-8 pt-8 border-t border-white/10 text-center">
              <button (click)="revealAnswer()" class="btn-primary px-6 py-2">
                Reveal Answer
              </button>
            </div>
          }

        </div>
      }

      <!-- Footer Navigation -->
      <div class="flex items-center justify-between mt-6">
        <button (click)="prevQuestion()" [disabled]="currentIndex() === 0"
                class="px-4 py-2 rounded-xl text-sm font-medium border border-white/10 hover:bg-white/5 disabled:opacity-30 transition-colors flex items-center gap-2">
          &larr; Previous
        </button>

        @if (currentIndex() === attempt()!.totalQuestions - 1) {
          <button (click)="submitQuiz()" class="btn-primary px-6 py-2 flex items-center gap-2" [disabled]="submitting()">
            @if (submitting()) {
              <div class="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
            }
            Finish Quiz
          </button>
        } @else {
          <button (click)="nextQuestion()" 
                  class="px-6 py-2 rounded-xl text-sm font-medium bg-white/10 hover:bg-white/20 transition-colors flex items-center gap-2">
            Next &rarr;
          </button>
        }
      </div>
    </div>
  }
  `
})
export class QuizPlayerComponent {
  private quizService = inject(QuizService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  attempt = signal<QuizAttemptDto | null>(null);
  loading = signal(true);
  submitting = signal(false);

  currentIndex = signal(0);
  showingAnswer = signal(false);

  currentQuestion = signal<QuizAttemptQuestionDto | null>(null);

  constructor() {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.loadAttempt(+id);
      }
    });

    effect(() => {
      const state = this.attempt();
      const idx = this.currentIndex();
      if (state && state.questions && state.questions.length > 0) {
        this.currentQuestion.set(state.questions[idx] || null);
        // auto-hide answers when switching unless they already responded
        const hasResponded = this.currentQuestion()?.response != null;
        this.showingAnswer.set(hasResponded);
      }
    }, { allowSignalWrites: true });
  }

  loadAttempt(id: number) {
    this.quizService.getAttempt(id).subscribe({
      next: (res) => {
        if (res.status === 'Completed') {
            this.router.navigate(['/quiz', res.id, 'review']);
            return;
        }
        this.attempt.set(res);
        this.loading.set(false);
      },
      error: () => {
        this.router.navigate(['/dashboard']);
      }
    });
  }

  revealAnswer() {
    this.showingAnswer.set(true);
  }

  markResponse(isCorrect: boolean) {
    const q = this.currentQuestion();
    const att = this.attempt();
    if (!q || !att) return;

    // Optimistic update
    const currentResp = q.response;
    q.response = { id: currentResp?.id || 0, isSelfMarkedCorrect: isCorrect, answeredAtUtc: new Date().toISOString() };
    
    // Server payload
    this.quizService.saveResponse(att.id, q.id, { isSelfMarkedCorrect: isCorrect }).subscribe({
      next: (res) => {
        // Sync full state
        this.attempt.set(res);
      }
    });
  }

  prevQuestion() {
    if (this.currentIndex() > 0) {
      this.currentIndex.update(i => i - 1);
    }
  }

  nextQuestion() {
    if (this.currentIndex() < (this.attempt()?.totalQuestions || 0) - 1) {
      this.currentIndex.update(i => i + 1);
    }
  }

  submitQuiz() {
    const att = this.attempt();
    if (!att) return;
    
    if (!confirm('Are you sure you want to finish the quiz?')) return;

    this.submitting.set(true);
    this.quizService.submitAttempt(att.id).subscribe({
      next: () => {
        this.router.navigate(['/quiz', att.id, 'review']);
      },
      error: () => this.submitting.set(false)
    });
  }
}

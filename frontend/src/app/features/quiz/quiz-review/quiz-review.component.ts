import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { QuizService, QuizAttemptDto } from '../../../core/services/quiz.service';

@Component({
  selector: 'app-quiz-review',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
  @if (loading()) {
    <div class="flex items-center justify-center min-h-[50vh]">
      <div class="w-8 h-8 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
    </div>
  } @else if (attempt()) {
    <div class="max-w-4xl mx-auto py-8">
      
      <!-- Review Header -->
      <div class="glass-panel p-8 md:p-12 rounded-3xl border border-white/5 shadow-2xl relative overflow-hidden mb-8 text-center animate-fade-in text-white shadow-[0_0_80px_rgba(59,130,246,0.1)]">
        <h1 class="text-4xl font-extrabold mb-4 pb-0 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400">
          Quiz Completed
        </h1>
        <p class="text-slate-400 text-sm font-medium mb-8">
          Mode: <span class="text-white">{{ attempt()!.mode }}</span> &nbsp;|&nbsp; 
          Duration: <span class="text-white">{{ durationMinutes() }} min</span>
        </p>

        <div class="inline-flex flex-col items-center justify-center w-40 h-40 rounded-full border-4 shadow-inner"
             [class.border-green-500]="scorePercentage() >= 75"
             [class.text-green-400]="scorePercentage() >= 75"
             [class.border-yellow-500]="scorePercentage() >= 50 && scorePercentage() < 75"
             [class.text-yellow-400]="scorePercentage() >= 50 && scorePercentage() < 75"
             [class.border-red-500]="scorePercentage() < 50"
             [class.text-red-400]="scorePercentage() < 50">
          <span class="text-5xl font-black">{{ scorePercentage() }}%</span>
          <span class="text-xs uppercase tracking-widest mt-1 opacity-70">Score</span>
        </div>

        <div class="mt-8 text-slate-300">
          You got <span class="font-bold text-white">{{ attempt()!.correctCount }}</span> out of 
          <span class="font-bold text-white">{{ attempt()!.totalQuestions }}</span> correct.
        </div>
      </div>

      <!-- Question Review List -->
      <div class="space-y-4">
        <h2 class="text-xl font-bold text-white mb-4">Detailed Review</h2>

        @for (q of attempt()!.questions; track q.id) {
          <div class="glass-panel p-6 rounded-2xl border border-white/5 transition-all">
            <div class="flex items-start gap-4">
              
              <!-- Indicator -->
              <div class="flex-shrink-0 mt-1">
                @if (q.response?.isSelfMarkedCorrect === true) {
                  <div class="w-6 h-6 rounded-full bg-green-500/20 text-green-500 flex items-center justify-center">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                  </div>
                } @else if (q.response?.isSelfMarkedCorrect === false) {
                  <div class="w-6 h-6 rounded-full bg-red-500/20 text-red-500 flex items-center justify-center">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                  </div>
                } @else {
                  <div class="w-6 h-6 rounded-full bg-slate-500/20 text-slate-500 flex items-center justify-center">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4"></path></svg>
                  </div>
                }
              </div>

              <div class="flex-1 min-w-0 space-y-4">
                <h3 class="font-bold text-white text-lg">{{ q.orderIndex }}. {{ q.title }}</h3>
                <div class="prose prose-sm prose-invert" [innerHTML]="q.questionText"></div>

                <div class="p-4 rounded-xl bg-black/30 border border-white/5">
                  <h4 class="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Answer Sheet</h4>
                  <div class="prose prose-sm prose-invert text-slate-300" [innerHTML]="q.answerText || 'No answer generated.'"></div>
                </div>
              </div>

            </div>
          </div>
        }
      </div>

      <div class="mt-8 text-center pt-8 border-t border-white/10">
        <a routerLink="/quiz/new" class="btn-primary px-8 py-3 inline-flex items-center gap-2">
          Start Another Quiz
        </a>
        <a routerLink="/dashboard" class="ml-4 px-8 py-3 rounded-xl border border-white/10 text-white font-medium hover:bg-white/5 transition-colors">
          Return to Dashboard
        </a>
      </div>
    </div>
  }
  `
})
export class QuizReviewComponent {
  private quizService = inject(QuizService);
  private route = inject(ActivatedRoute);

  attempt = signal<QuizAttemptDto | null>(null);
  loading = signal(true);

  constructor() {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.loadAttempt(+id);
      }
    });
  }

  loadAttempt(id: number) {
    this.quizService.getAttempt(id).subscribe({
      next: (res) => {
        this.attempt.set(res);
        this.loading.set(false);
      }
    });
  }

  scorePercentage() {
    const a = this.attempt();
    if (!a || a.totalQuestions === 0) return 0;
    return Math.round((a.correctCount / a.totalQuestions) * 100);
  }

  durationMinutes() {
    const a = this.attempt();
    if (!a || !a.completedAt) return 0;
    const start = new Date(a.startedAt).getTime();
    const end = new Date(a.completedAt).getTime();
    return Math.max(1, Math.round((end - start) / 60000));
  }
}

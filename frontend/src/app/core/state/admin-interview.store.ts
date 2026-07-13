import { Injectable, signal, computed, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { tap, shareReplay } from 'rxjs/operators';
import { AdminInterviewService } from '../services/admin-interview.service';
import { Company, Interview, Round, Question } from '../models/admin-interview.models';

@Injectable({ providedIn: 'root' })
export class AdminInterviewStore {
  private readonly adminService = inject(AdminInterviewService);

  // ==========================================
  // Signals (State)
  // ==========================================
  
  // Companies
  readonly companies = signal<Company[]>([]);
  readonly isLoadingCompanies = signal<boolean>(false);
  
  // Deep Edit Tree State
  readonly activeCompany = signal<Company | null>(null);
  readonly activeInterview = signal<Interview | null>(null);
  readonly activeRound = signal<Round | null>(null);
  readonly activeQuestion = signal<Question | null>(null);

  // Collections for the Deep Edit Tree
  readonly companyInterviews = signal<Interview[]>([]);
  readonly interviewRounds = signal<Round[]>([]);
  readonly roundQuestions = signal<Question[]>([]);

  // ==========================================
  // Actions
  // ==========================================

  loadCompanies(): void {
    this.isLoadingCompanies.set(true);
    this.adminService.getCompanies().subscribe({
      next: (data) => {
        this.companies.set(data);
        this.isLoadingCompanies.set(false);
      },
      error: () => this.isLoadingCompanies.set(false)
    });
  }

  // --- Tree Selection ---

  selectCompany(company: Company): void {
    this.activeCompany.set(company);
    // Reset lower levels
    this.activeInterview.set(null);
    this.activeRound.set(null);
    this.activeQuestion.set(null);
    this.companyInterviews.set([]);
    this.interviewRounds.set([]);
    this.roundQuestions.set([]);

    // Load interviews for this company
    this.adminService.getInterviews(company.id).subscribe(data => {
      this.companyInterviews.set(data);
    });
  }

  selectInterview(interview: Interview): void {
    this.activeInterview.set(interview);
    this.activeRound.set(null);
    this.activeQuestion.set(null);
    this.interviewRounds.set([]);
    this.roundQuestions.set([]);

    // Load rounds for this interview
    this.adminService.getRounds(interview.id).subscribe(data => {
      this.interviewRounds.set(data);
    });
  }

  selectRound(round: Round): void {
    this.activeRound.set(round);
    this.activeQuestion.set(null);
    this.roundQuestions.set([]);

    // Load questions for this round
    this.adminService.getQuestions(round.id).subscribe(data => {
      this.roundQuestions.set(data);
    });
  }

  selectQuestion(question: Question): void {
    this.activeQuestion.set(question);
  }

  // --- Mutations ---

  addQuestion(roundId: string, data: Partial<Question>): void {
    this.adminService.addQuestion(roundId, data).subscribe({
      next: (newQuestion) => {
        this.roundQuestions.update(questions => [...questions, newQuestion]);
      }
    });
  }

  addCompany(data: Partial<Company>): Observable<Company> {
    const result$ = this.adminService.addCompany(data).pipe(
      tap((newCompany) => {
        this.companies.update(list => [...list, newCompany]);
      }),
      shareReplay(1)
    );
    result$.subscribe(); // trigger the pipeline
    return result$;
  }

  deleteCompany(companyId: string): void {
    this.adminService.deleteCompany(companyId).subscribe({
      next: () => {
        this.companies.update(list => list.filter(c => c.id !== companyId));
        if (this.activeCompany()?.id === companyId) {
          this.activeCompany.set(null);
        }
      }
    });
  }

  addInterview(companyId: string, data: Partial<Interview>): void {
    this.adminService.addInterview(companyId, data).subscribe({
      next: (newInterview) => {
        this.companyInterviews.update(list => [...list, newInterview]);
      }
    });
  }

  addRound(interviewId: string, data: Partial<Round>): void {
    this.adminService.addRound(interviewId, data).subscribe({
      next: (newRound) => {
        this.interviewRounds.update(list => [...list, newRound]);
      }
    });
  }

  bulkImportQuestions(roundId: string, file: File): Observable<{ imported: number; skipped: number; errors: string[] }> {
    const result$ = this.adminService.bulkImportQuestions(roundId, file);
    result$.subscribe({
      next: () => {
        // Reload round questions after import
        this.adminService.getQuestions(roundId).subscribe(data => {
          this.roundQuestions.set(data);
        });
      }
    });
    return result$;
  }

  updateCompany(id: string, patch: Partial<Company>): void {
    const current = this.activeCompany();
    const merged: Partial<Company> = { ...current, ...patch, id };
    this.adminService.updateCompany(id, merged).subscribe({
      next: (updated) => {
        this.activeCompany.set(updated);
        this.companies.update(list => list.map(c => c.id === id ? updated : c));
      }
    });
  }

  updateInterview(id: string, patch: Partial<Interview>): void {
    const current = this.activeInterview();
    const merged: Partial<Interview> = { ...current, ...patch, id };
    this.adminService.updateInterview(id, merged).subscribe({
      next: (updated) => {
        this.activeInterview.set(updated);
        this.companyInterviews.update(list => list.map(i => i.id === id ? updated : i));
      }
    });
  }

  updateRound(id: string, patch: Partial<Round>): void {
    const current = this.activeRound();
    const merged: Partial<Round> = { ...current, ...patch, id };
    this.adminService.updateRound(id, merged).subscribe({
      next: (updated) => {
        this.activeRound.set(updated);
        this.interviewRounds.update(list => list.map(r => r.id === id ? updated : r));
      }
    });
  }

  updateQuestion(id: string, patch: Partial<Question>): void {
    const current = this.activeQuestion();
    const merged: Partial<Question> = { ...current, ...patch, id };
    this.adminService.updateQuestion(id, merged).subscribe({
      next: (updated) => {
        this.activeQuestion.set(updated);
        this.roundQuestions.update(list => list.map(q => q.id === id ? updated : q));
      }
    });
  }
}

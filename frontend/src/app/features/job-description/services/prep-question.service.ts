import { inject, Injectable, signal } from '@angular/core';
import { LocalStorageService } from '../../../core/services/local-storage.service';
import { PrepQuestion } from '../models/opportunity.models';

const STORAGE_KEY = 'edudash_prep_questions_v1';

@Injectable({
  providedIn: 'root'
})
export class PrepQuestionService {
  private readonly storage = inject(LocalStorageService);
  
  private readonly questionsSignal = signal<PrepQuestion[]>(this.loadFromStorage());
  readonly questions = this.questionsSignal.asReadonly();

  private loadFromStorage(): PrepQuestion[] {
    return this.storage.getItem<PrepQuestion[]>(STORAGE_KEY) || [];
  }

  private saveToStorage(questions: PrepQuestion[]) {
    this.storage.setItem(STORAGE_KEY, questions);
    this.questionsSignal.set(questions);
  }

  getByOpportunityId(oppId: string): PrepQuestion[] {
    return this.questionsSignal().filter(q => q.opportunityId === oppId);
  }

  add(question: Omit<PrepQuestion, 'id' | 'createdAt'>): PrepQuestion {
    const newQuestion: PrepQuestion = {
      ...question,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString()
    };
    
    this.saveToStorage([...this.questionsSignal(), newQuestion]);
    return newQuestion;
  }

  update(id: string, updates: Partial<PrepQuestion>): PrepQuestion | undefined {
    const questions = this.questionsSignal();
    const index = questions.findIndex(q => q.id === id);
    
    if (index === -1) return undefined;

    const updatedQuestion = {
      ...questions[index],
      ...updates
    };

    const updatedQuestions = [...questions];
    updatedQuestions[index] = updatedQuestion;
    
    this.saveToStorage(updatedQuestions);
    return updatedQuestion;
  }

  delete(id: string): void {
    this.saveToStorage(this.questionsSignal().filter(q => q.id !== id));
  }
}

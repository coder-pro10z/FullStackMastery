import { Injectable, signal } from '@angular/core';

const STORAGE_KEY = 'edudash_completed_competencies';

@Injectable({ providedIn: 'root' })
export class CompetencyProgressService {
  /** Signal set containing canonical IDs of completed competencies (e.g. "C02", "SC01") */
  readonly completedCompetencyIds = signal<Set<string>>(new Set());

  constructor() {
    this.loadFromStorage();
  }

  /** Check if a competency ID is marked as completed/mastered */
  isCompleted(id: string): boolean {
    return this.completedCompetencyIds().has(id);
  }

  /** Toggle completion status for a competency ID */
  toggleCompetency(id: string): void {
    this.completedCompetencyIds.update(currentSet => {
      const nextSet = new Set(currentSet);
      if (nextSet.has(id)) {
        nextSet.delete(id);
      } else {
        nextSet.add(id);
      }
      this.saveToStorage(nextSet);
      return nextSet;
    });
  }

  /** Mark a competency as completed */
  markCompleted(id: string): void {
    if (this.isCompleted(id)) return;
    this.toggleCompetency(id);
  }

  /** Mark a competency as incomplete */
  markIncomplete(id: string): void {
    if (!this.isCompleted(id)) return;
    this.toggleCompetency(id);
  }

  private loadFromStorage(): void {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const arr = JSON.parse(raw);
        if (Array.isArray(arr)) {
          this.completedCompetencyIds.set(new Set(arr));
        }
      }
    } catch (e) {
      console.error('Failed to load completed competencies from LocalStorage', e);
    }
  }

  private saveToStorage(set: Set<string>): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(set)));
    } catch (e) {
      console.error('Failed to save completed competencies to LocalStorage', e);
    }
  }
}

import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  ChallengeDayModel,
  ChallengeSummaryModel,
  CompetencyCategory,
  CompetencyModel,
  MarkDayCompleteRequest,
  UserChallengeProgressModel,
} from '../models/challenge.models';

@Injectable({ providedIn: 'root' })
export class ChallengeService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/challenge`;

  // ── Competency Index ───────────────────────────────────────────────────────

  /** Returns all 75 permanent competency records. */
  getAllCompetencies(): Observable<CompetencyModel[]> {
    return this.http.get<CompetencyModel[]>(`${this.base}/competencies`);
  }

  /** Returns competencies for a single category. */
  getCompetenciesByCategory(category: CompetencyCategory): Observable<CompetencyModel[]> {
    return this.http.get<CompetencyModel[]>(`${this.base}/competencies`, {
      params: { category },
    });
  }

  // ── Day Tracker ────────────────────────────────────────────────────────────

  /** Returns all 30 challenge days with user-specific completion state. */
  getAllDays(): Observable<ChallengeDayModel[]> {
    return this.http.get<ChallengeDayModel[]>(`${this.base}/days`);
  }

  /** Returns a single day by its 1-indexed day number. */
  getDay(dayNumber: number): Observable<ChallengeDayModel> {
    return this.http.get<ChallengeDayModel>(`${this.base}/days/${dayNumber}`);
  }

  // ── Progress Toggles ───────────────────────────────────────────────────────

  /** Marks a day as complete. Body can include optional user notes. */
  markDayComplete(dayNumber: number, notes?: string | null): Observable<UserChallengeProgressModel> {
    const body: MarkDayCompleteRequest = { notes };
    return this.http.post<UserChallengeProgressModel>(`${this.base}/days/${dayNumber}/complete`, body);
  }

  /** Marks a day as incomplete (un-completes). */
  markDayIncomplete(dayNumber: number): Observable<UserChallengeProgressModel> {
    return this.http.delete<UserChallengeProgressModel>(`${this.base}/days/${dayNumber}/complete`);
  }

  // ── Summary ────────────────────────────────────────────────────────────────

  /** Returns the authenticated user's challenge summary (streak, completion %). */
  getSummary(): Observable<ChallengeSummaryModel> {
    return this.http.get<ChallengeSummaryModel>(`${this.base}/summary`);
  }
}

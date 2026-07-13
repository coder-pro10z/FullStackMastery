import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, delay } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { 
  Company, Interview, Round, Question,
  ApiCompany, ApiInterview, ApiRound, ApiQuestion 
} from '../models/admin-interview.models';

@Injectable({ providedIn: 'root' })
export class AdminInterviewService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/admin/interviews`; 

  // ==========================================
  // Adapter Shield Methods (Raw -> Strict)
  // ==========================================

  private mapToCompany(raw: ApiCompany): Company {
    return {
      id: raw.id,
      name: raw.name ?? 'Unknown Company',
      logo: raw.logo_url ?? 'bg-slate-200',
      industry: raw.industry_type ?? 'Technology'
    };
  }

  private mapToInterview(raw: ApiInterview): Interview {
    return {
      id: raw.id,
      companyId: raw.company_id,
      roleName: raw.role_name ?? 'Unknown Role',
      level: raw.level_tier ?? 'Mid-Level',
      date: raw.interview_date ?? new Date().toISOString().split('T')[0]
    };
  }

  private mapToRound(raw: ApiRound): Round {
    return {
      id: raw.id,
      interviewId: raw.interview_id,
      roundNumber: raw.round_number ?? 1,
      focusArea: raw.focus_area ?? 'General'
    };
  }

  private mapToQuestion(raw: ApiQuestion): Question {
    return {
      id: raw.id,
      roundId: raw.round_id,
      title: raw.title ?? 'Untitled Question',
      difficulty: raw.difficulty_level ?? 'Medium',
      category: raw.category_name ?? 'Uncategorized',
      solutionMarkdown: raw.solution_md ?? '',
      diagramJSON: raw.diagram_payload ?? ''
    };
  }

  // ==========================================
  // API Calls
  // ==========================================

  // Mock data for development phase (to allow UI testing before backend is ready)
  
  getCompanies(): Observable<Company[]> {
    return this.http.get<ApiCompany[]>(`${this.apiUrl}/companies`).pipe(
      map(rawList => rawList.map(raw => this.mapToCompany(raw)))
    );
  }

  addCompany(data: Partial<Company>): Observable<Company> {
    const payload = {
      name: data.name,
      logo_url: data.logo,
      industry_type: data.industry
    };
    return this.http.post<ApiCompany>(`${this.apiUrl}/companies`, payload).pipe(
      map(raw => this.mapToCompany(raw))
    );
  }

  deleteCompany(companyId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/companies/${companyId}`);
  }

  getInterviews(companyId: string): Observable<Interview[]> {
    return this.http.get<ApiInterview[]>(`${this.apiUrl}/roles?companyId=${companyId}`).pipe(
      map(rawList => rawList.map(raw => this.mapToInterview(raw)))
    );
  }

  getRounds(interviewId: string): Observable<Round[]> {
    return this.http.get<ApiRound[]>(`${this.apiUrl}/rounds?interviewId=${interviewId}`).pipe(
      map(rawList => rawList.map(raw => this.mapToRound(raw)))
    );
  }

  getQuestions(roundId: string): Observable<Question[]> {
    return this.http.get<ApiQuestion[]>(`${this.apiUrl}/rounds/${roundId}/questions`).pipe(
      map(rawList => rawList.map(raw => this.mapToQuestion(raw)))
    );
  }

  addQuestion(roundId: string, data: Partial<Question>): Observable<Question> {
    // Note: The UI is currently passing mock data. To properly implement this,
    // we would create a new Question globally and then link it to the round, 
    // or link an existing Question by ID.
    // For now, this is a placeholder since the full "select existing question" UI isn't built yet.
    return of(this.mapToQuestion({
      id: Math.random().toString(36).substr(2, 9),
      round_id: roundId,
      title: data.title || 'New Question',
      difficulty_level: data.difficulty || 'Medium',
      category_name: data.category || 'General',
      solution_md: data.solutionMarkdown || '',
      diagram_payload: data.diagramJSON || ''
    }));
  }

  addInterview(companyId: string, data: Partial<Interview>): Observable<Interview> {
    const payload = {
      company_id: companyId,
      role_name: data.roleName,
      level_tier: data.level,
      interview_date: data.date
    };
    return this.http.post<ApiInterview>(`${this.apiUrl}/roles`, payload).pipe(
      map(raw => this.mapToInterview(raw))
    );
  }

  addRound(interviewId: string, data: Partial<Round>): Observable<Round> {
    const payload = {
      interview_id: interviewId,
      round_number: data.roundNumber ?? 1,
      focus_area: data.focusArea
    };
    return this.http.post<ApiRound>(`${this.apiUrl}/rounds`, payload).pipe(
      map(raw => this.mapToRound(raw))
    );
  }

  bulkImportQuestions(roundId: string, file: File): Observable<{ imported: number; skipped: number; errors: string[] }> {
    // In production: return this.http.post(`${this.apiUrl}/rounds/${roundId}/bulk-import`, formData);
    return of({ imported: 5, skipped: 1, errors: [] }).pipe(delay(800));
  }

  updateCompany(id: string, patch: Partial<Company>): Observable<Company> {
    const payload = {
      name: patch.name,
      logo_url: patch.logo,
      industry_type: patch.industry
    };
    return this.http.put<ApiCompany>(`${this.apiUrl}/companies/${id}`, payload).pipe(
      map(raw => this.mapToCompany(raw))
    );
  }

  updateInterview(id: string, patch: Partial<Interview>): Observable<Interview> {
    const payload = {
      company_id: patch.companyId, // Might be undefined but handled by partial
      role_name: patch.roleName,
      level_tier: patch.level,
      interview_date: patch.date
    };
    return this.http.put<ApiInterview>(`${this.apiUrl}/roles/${id}`, payload).pipe(
      map(raw => this.mapToInterview(raw))
    );
  }

  updateRound(id: string, patch: Partial<Round>): Observable<Round> {
    const payload = {
      interview_id: patch.interviewId,
      round_number: patch.roundNumber,
      focus_area: patch.focusArea
    };
    return this.http.put<ApiRound>(`${this.apiUrl}/rounds/${id}`, payload).pipe(
      map(raw => this.mapToRound(raw))
    );
  }

  updateQuestion(id: string, patch: Partial<Question>): Observable<Question> {
    // Similar to addQuestion, this needs a global question edit implementation
    return of(this.mapToQuestion({
      id,
      round_id: patch.roundId || '',
      title: patch.title || 'Question',
      difficulty_level: patch.difficulty,
      category_name: patch.category,
      solution_md: patch.solutionMarkdown,
      diagram_payload: patch.diagramJSON
    }));
  }

  deleteInterview(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/roles/${id}`);
  }

  deleteRound(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/rounds/${id}`);
  }

  deleteQuestion(roundId: string, questionId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/rounds/${roundId}/questions/${questionId}`);
  }
}

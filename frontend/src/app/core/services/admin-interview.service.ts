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
  // private readonly apiUrl = `${environment.apiUrl}/admin/interviews`; 

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
    const mockData: ApiCompany[] = [
      { id: '1', name: 'Meta', logo_url: 'from-blue-600 to-blue-400', industry_type: 'Social Media' },
      { id: '2', name: 'Google', logo_url: 'from-red-500 to-yellow-500', industry_type: 'Search' }
    ];
    // return this.http.get<ApiCompany[]>(`${this.apiUrl}/companies`).pipe(
    return of(mockData).pipe(
      delay(400),
      map(rawList => rawList.map(raw => this.mapToCompany(raw)))
    );
  }

  addCompany(data: Partial<Company>): Observable<Company> {
    const mockResponse: ApiCompany = {
      id: Math.random().toString(36).substr(2, 9),
      name: data.name || 'New Company',
      logo_url: data.logo,
      industry_type: data.industry
    };
    return of(mockResponse).pipe(
      delay(300),
      map(raw => this.mapToCompany(raw))
    );
  }

  deleteCompany(companyId: string): Observable<void> {
    return of(void 0).pipe(delay(300));
  }

  getInterviews(companyId: string): Observable<Interview[]> {
    const mockData: ApiInterview[] = [
      { id: 'i1', company_id: companyId, role_name: 'Full Stack Developer', level_tier: 'L4', interview_date: '2025-11-15' },
      { id: 'i2', company_id: companyId, role_name: 'Frontend Engineer', level_tier: 'E4', interview_date: '2025-10-10' }
    ];
    return of(mockData).pipe(
      delay(300),
      map(rawList => rawList.map(raw => this.mapToInterview(raw)))
    );
  }

  getRounds(interviewId: string): Observable<Round[]> {
    const mockData: ApiRound[] = [
      { id: 'r1', interview_id: interviewId, round_number: 1, focus_area: 'Technical' },
      { id: 'r2', interview_id: interviewId, round_number: 2, focus_area: 'System Design' }
    ];
    return of(mockData).pipe(
      delay(200),
      map(rawList => rawList.map(raw => this.mapToRound(raw)))
    );
  }

  getQuestions(roundId: string): Observable<Question[]> {
    const mockData: ApiQuestion[] = [
      { id: 'q1', round_id: roundId, title: 'Explain Virtual DOM', difficulty_level: 'Medium', category_name: 'React', solution_md: '## Virtual DOM\nIt is a lightweight copy of the real DOM...' },
      { id: 'q2', round_id: roundId, title: 'System Design: News Feed', difficulty_level: 'Hard', category_name: 'System Design', solution_md: '' }
    ];
    return of(mockData).pipe(
      delay(200),
      map(rawList => rawList.map(raw => this.mapToQuestion(raw)))
    );
  }

  addQuestion(roundId: string, data: Partial<Question>): Observable<Question> {
    const mockResponse: ApiQuestion = {
      id: Math.random().toString(36).substr(2, 9),
      round_id: roundId,
      title: data.title || 'New Question',
      difficulty_level: data.difficulty || 'Medium',
      category_name: data.category || 'General',
      solution_md: data.solutionMarkdown || '',
      diagram_payload: data.diagramJSON || ''
    };
    
    // In production:
    // return this.http.post<ApiQuestion>(`${environment.apiUrl}/admin/rounds/${roundId}/questions`, data).pipe(
    //   map(raw => this.mapToQuestion(raw))
    // );
    
    return of(mockResponse).pipe(
      delay(300),
      map(raw => this.mapToQuestion(raw))
    );
  }

  addInterview(companyId: string, data: Partial<Interview>): Observable<Interview> {
    const mockResponse: ApiInterview = {
      id: Math.random().toString(36).substr(2, 9),
      company_id: companyId,
      role_name: data.roleName || 'New Role',
      level_tier: data.level || 'Mid-Level',
      interview_date: data.date || new Date().toISOString().split('T')[0]
    };
    return of(mockResponse).pipe(
      delay(300),
      map(raw => this.mapToInterview(raw))
    );
  }

  addRound(interviewId: string, data: Partial<Round>): Observable<Round> {
    const mockResponse: ApiRound = {
      id: Math.random().toString(36).substr(2, 9),
      interview_id: interviewId,
      round_number: data.roundNumber ?? 1,
      focus_area: data.focusArea || 'General'
    };
    return of(mockResponse).pipe(
      delay(200),
      map(raw => this.mapToRound(raw))
    );
  }

  bulkImportQuestions(roundId: string, file: File): Observable<{ imported: number; skipped: number; errors: string[] }> {
    // In production: return this.http.post(`${this.apiUrl}/rounds/${roundId}/bulk-import`, formData);
    return of({ imported: 5, skipped: 1, errors: [] }).pipe(delay(800));
  }
}

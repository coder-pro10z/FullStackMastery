import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { ProgressSummaryDto, UserProgressStateDto } from '../models/progress.models';

@Injectable({ providedIn: 'root' })
export class ProgressService {
  private readonly http = inject(HttpClient);

  getSummary() {
    return this.http.get<ProgressSummaryDto>(`${environment.apiUrl}/userprogress/summary`);
  }

  toggleSolved(questionId: number) {
    return this.http.post<UserProgressStateDto>(`${environment.apiUrl}/userprogress/${questionId}/toggle-solved`, {});
  }

  toggleRevision(questionId: number) {
    return this.http.post<UserProgressStateDto>(`${environment.apiUrl}/userprogress/${questionId}/toggle-revision`, {});
  }
}

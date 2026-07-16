import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ITechStackResponse, IDashboardStats } from '../models/dashboard.model';
import { environment } from '../../../environments/environment.staging';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private http = inject(HttpClient);

  // Uses the environment file to target either Render or Localhost
  private readonly API_URL = environment.apiUrl;

  getTechStack(): Observable<ITechStackResponse> {
    return this.http.get<ITechStackResponse>(`${this.API_URL}/dashboard/tech-stack`);
  }

  getDashboardStats(): Observable<IDashboardStats> {
    return this.http.get<IDashboardStats>(`${this.API_URL}/dashboard/stats`);
  }
}

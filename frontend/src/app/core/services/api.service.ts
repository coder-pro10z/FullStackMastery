import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ITechStackResponse, IDashboardStats } from '../models/dashboard.model';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private http = inject(HttpClient);

  // In a real application, this would come from an environment file
  private readonly API_URL = '/api';

  getTechStack(): Observable<ITechStackResponse> {
    return this.http.get<ITechStackResponse>(`${this.API_URL}/dashboard/tech-stack`);
  }

  getDashboardStats(): Observable<IDashboardStats> {
    return this.http.get<IDashboardStats>(`${this.API_URL}/dashboard/stats`);
  }
}

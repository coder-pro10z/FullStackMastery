import { Injectable, computed, inject, signal } from '@angular/core';
import { finalize, take } from 'rxjs';
import { ITechStackResponse } from '../models/dashboard.model';
import { ApiService } from '../services/api.service';

@Injectable({
  providedIn: 'root'
})
export class DashboardStore {
  private apiService = inject(ApiService);

  private techStackState = signal<ITechStackResponse | null>(null);
  private loadingState = signal(false);
  private errorState = signal<string | null>(null);

  readonly techStack = computed(() => this.techStackState());
  readonly devHexagon = computed(() => this.techStackState()?.dev_hexagon ?? null);
  readonly skills = computed(() => this.devHexagon()?.skills ?? []);
  readonly primaryMetrics = computed(() => this.devHexagon()?.primary_metrics ?? []);
  readonly isLoading = computed(() => this.loadingState());
  readonly errorMsg = computed(() => this.errorState());

  loadTechStack(): void {
    this.loadingState.set(true);
    this.errorState.set(null);

    this.apiService.getTechStack()
      .pipe(
        take(1),
        finalize(() => this.loadingState.set(false))
      )
      .subscribe({
        next: (techStack) => this.techStackState.set(techStack),
        error: (error: unknown) => {
          const message = error instanceof Error ? error.message : 'Failed to load tech stack data';
          this.errorState.set(message);
        }
      });
  }
}

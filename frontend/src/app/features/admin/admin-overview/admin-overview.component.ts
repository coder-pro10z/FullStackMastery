import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';
import {
  AdminApiService,
  DashboardStatsDto,
} from '../../../core/services/admin-api.service';

@Component({
  selector: 'app-admin-overview',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-6 animate-fade-in">

      <!-- Page Header -->
      <div class="mb-2">
        <h1 class="text-2xl font-semibold tracking-tight text-[#202124]">Overview</h1>
        <p class="text-sm text-[#5F6368] mt-1">Platform statistics and recent activity</p>
      </div>

      <!-- Stat Cards -->
      @if (loading()) {
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
          @for (i of [1,2,3,4]; track i) {
            <div class="edudash-card animate-pulse h-24"></div>
          }
        </div>
      } @else if (stats()) {
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <!-- Total Questions -->
          <div class="edudash-card flex flex-col gap-1">
            <div class="flex items-center justify-between mb-1">
              <p class="text-xs font-medium text-[#5F6368] uppercase tracking-wider">Questions</p>
              <div class="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                <lucide-icon name="database" [size]="16" class="text-blue-600" />
              </div>
            </div>
            <p class="text-3xl font-bold text-[#202124] tracking-tight">{{ stats()!.totalQuestions }}</p>
            <p class="text-xs text-[#1A73E8] font-medium">{{ stats()!.publishedQuestions }} published</p>
          </div>
          <!-- Total Users -->
          <div class="edudash-card flex flex-col gap-1">
            <div class="flex items-center justify-between mb-1">
              <p class="text-xs font-medium text-[#5F6368] uppercase tracking-wider">Users</p>
              <div class="w-8 h-8 rounded-lg bg-violet-50 flex items-center justify-center">
                <lucide-icon name="users" [size]="16" class="text-violet-600" />
              </div>
            </div>
            <p class="text-3xl font-bold text-[#202124] tracking-tight">{{ stats()!.totalUsers }}</p>
            <p class="text-xs text-[#5F6368]">Registered</p>
          </div>
          <!-- Categories -->
          <div class="edudash-card flex flex-col gap-1">
            <div class="flex items-center justify-between mb-1">
              <p class="text-xs font-medium text-[#5F6368] uppercase tracking-wider">Categories</p>
              <div class="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                <lucide-icon name="tag" [size]="16" class="text-emerald-600" />
              </div>
            </div>
            <p class="text-3xl font-bold text-[#202124] tracking-tight">{{ stats()!.totalCategories }}</p>
            <p class="text-xs text-[#5F6368]">Active</p>
          </div>
          <!-- Drafts / Deleted -->
          <div class="edudash-card flex flex-col gap-1">
            <div class="flex items-center justify-between mb-1">
              <p class="text-xs font-medium text-[#5F6368] uppercase tracking-wider">Drafts</p>
              <div class="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
                <lucide-icon name="file-edit" [size]="16" class="text-amber-600" />
              </div>
            </div>
            <p class="text-3xl font-bold text-[#202124] tracking-tight">{{ stats()!.draftQuestions }}</p>
            <p class="text-xs text-red-500 font-medium">{{ stats()!.deletedQuestions }} deleted</p>
          </div>
        </div>

        <!-- Difficulty Breakdown -->
        <div class="edudash-card">
          <h2 class="text-sm font-semibold text-[#202124] mb-4 flex items-center gap-2">
            <lucide-icon name="bar-chart-2" [size]="16" class="text-[#1A73E8]" />
            Questions by Difficulty
          </h2>
          <div class="space-y-4">
            <div>
              <div class="flex items-center justify-between mb-1.5">
                <span class="text-xs font-medium text-emerald-600">Easy</span>
                <span class="text-xs font-semibold text-[#202124]">{{ stats()!.countByDifficulty.easy }}</span>
              </div>
              <div class="h-2 bg-[#F8F9FA] rounded-full overflow-hidden border border-[#E0E0E0]">
                <div class="h-full bg-emerald-500 rounded-full transition-all duration-700"
                     [style.width.%]="difficultyPct(stats()!.countByDifficulty.easy)"></div>
              </div>
            </div>
            <div>
              <div class="flex items-center justify-between mb-1.5">
                <span class="text-xs font-medium text-amber-600">Medium</span>
                <span class="text-xs font-semibold text-[#202124]">{{ stats()!.countByDifficulty.medium }}</span>
              </div>
              <div class="h-2 bg-[#F8F9FA] rounded-full overflow-hidden border border-[#E0E0E0]">
                <div class="h-full bg-amber-500 rounded-full transition-all duration-700"
                     [style.width.%]="difficultyPct(stats()!.countByDifficulty.medium)"></div>
              </div>
            </div>
            <div>
              <div class="flex items-center justify-between mb-1.5">
                <span class="text-xs font-medium text-red-500">Hard</span>
                <span class="text-xs font-semibold text-[#202124]">{{ stats()!.countByDifficulty.hard }}</span>
              </div>
              <div class="h-2 bg-[#F8F9FA] rounded-full overflow-hidden border border-[#E0E0E0]">
                <div class="h-full bg-red-500 rounded-full transition-all duration-700"
                     [style.width.%]="difficultyPct(stats()!.countByDifficulty.hard)"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Recent Activity -->
        @if (stats()!.recentActivity.length) {
          <div class="edudash-card p-0 overflow-hidden">
            <div class="px-6 py-4 border-b border-[#E0E0E0] flex items-center gap-2">
              <lucide-icon name="activity" [size]="16" class="text-[#1A73E8]" />
              <h2 class="text-sm font-semibold text-[#202124]">Recent Activity</h2>
            </div>
            <div class="divide-y divide-[#E0E0E0]">
              @for (log of stats()!.recentActivity; track log.id) {
                <div class="flex items-center gap-3 px-6 py-3">
                  <span class="badge"
                    [class]="log.action === 'CREATED' || log.action === 'IMPORTED' ? 'badge-success' :
                              log.action === 'DELETED' ? 'bg-red-50 text-red-600 border-red-200' :
                              'badge-primary'">
                    {{ log.action }}
                  </span>
                  <span class="text-sm text-[#202124] flex-1">{{ log.entityType }}{{ log.entityId ? ' #' + log.entityId : '' }}</span>
                  <span class="text-xs text-[#5F6368]">{{ log.userEmail }}</span>
                  <span class="text-xs text-[#5F6368]">{{ log.timestamp | date:'MMM d, h:mm a' }}</span>
                </div>
              }
            </div>
          </div>
        }
      } @else {
        <div class="edudash-card py-16 text-center">
          <lucide-icon name="alert-circle" [size]="32" class="text-[#5F6368] mx-auto mb-3" />
          <p class="text-sm text-[#5F6368]">Failed to load stats. Please refresh.</p>
        </div>
      }
    </div>
  `,
})
export class AdminOverviewComponent implements OnInit {
  private readonly api = inject(AdminApiService);

  readonly stats = signal<DashboardStatsDto | null>(null);
  readonly loading = signal(true);

  ngOnInit(): void {
    this.api.getDashboardStats().subscribe({
      next: s => { this.stats.set(s); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  difficultyPct(count: number): number {
    const s = this.stats();
    if (!s) return 0;
    const total = s.countByDifficulty.easy + s.countByDifficulty.medium + s.countByDifficulty.hard;
    return total ? (count / total) * 100 : 0;
  }
}

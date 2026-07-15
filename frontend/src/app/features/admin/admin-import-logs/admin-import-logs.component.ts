import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';
import { AdminApiService, ImportLogDto, PagedAdminResult } from '../../../core/services/admin-api.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-admin-import-logs',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-6 animate-fade-in">
      
      <!-- Page Header -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-semibold tracking-tight text-[#202124]">Import History</h1>
          <p class="text-sm text-[#5F6368] mt-1">
            View the history of Question and Answer bulk imports.
          </p>
        </div>
        <button (click)="loadLogs()" class="btn btn-secondary flex items-center gap-2">
          <lucide-icon name="refresh-cw" [size]="16" [class.animate-spin]="loading()"></lucide-icon>
          Refresh
        </button>
      </div>

      <!-- Logs Table -->
      <div class="edudash-card !p-0 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left text-sm text-[#3C4043]">
            <thead class="bg-slate-50 text-xs uppercase text-[#5F6368] border-b border-[#E0E0E0]">
              <tr>
                <th class="px-6 py-4 font-semibold tracking-wider">Date & Time</th>
                <th class="px-6 py-4 font-semibold tracking-wider">Job Type</th>
                <th class="px-6 py-4 font-semibold tracking-wider">Status</th>
                <th class="px-6 py-4 font-semibold tracking-wider">File / User</th>
                <th class="px-6 py-4 font-semibold tracking-wider">Results</th>
                <th class="px-6 py-4 font-semibold tracking-wider text-right">Details</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-[#E0E0E0]">
              @if (loading() && logs().length === 0) {
                @for (i of [1,2,3,4,5]; track i) {
                  <tr>
                    <td colspan="6" class="px-6 py-4">
                      <div class="h-6 bg-slate-100 rounded animate-pulse w-full"></div>
                    </td>
                  </tr>
                }
              } @else if (logs().length === 0) {
                <tr>
                  <td colspan="6" class="px-6 py-12 text-center text-[#5F6368]">
                    <lucide-icon name="inbox" [size]="32" class="mx-auto mb-3 opacity-50"></lucide-icon>
                    <p class="font-medium">No import logs found.</p>
                  </td>
                </tr>
              } @else {
                @for (log of logs(); track log.id) {
                  <tr class="hover:bg-slate-50 transition-colors group">
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="text-[#202124] font-medium">{{ log.startedAt | date:'MMM d, yyyy' }}</div>
                      <div class="text-xs text-[#5F6368] mt-0.5">{{ log.startedAt | date:'shortTime' }}</div>
                    </td>
                    <td class="px-6 py-4">
                      <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold"
                            [ngClass]="log.type === 'Question' ? 'bg-blue-50 text-blue-700' : 'bg-purple-50 text-purple-700'">
                        <lucide-icon [name]="log.type === 'Question' ? 'circle-help' : 'message-square'" [size]="14"></lucide-icon>
                        {{ log.type }}s
                      </span>
                    </td>
                    <td class="px-6 py-4">
                      <div class="flex items-center gap-2">
                        @switch (log.status) {
                          @case ('Completed') {
                            <div class="w-2 h-2 rounded-full bg-emerald-500"></div>
                            <span class="text-emerald-700 font-medium">Completed</span>
                          }
                          @case ('Failed') {
                            <div class="w-2 h-2 rounded-full bg-red-500"></div>
                            <span class="text-red-700 font-medium">Failed</span>
                          }
                          @case ('InProgress') {
                            <div class="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></div>
                            <span class="text-amber-700 font-medium">In Progress</span>
                          }
                          @default {
                            <div class="w-2 h-2 rounded-full bg-slate-400"></div>
                            <span class="text-slate-700 font-medium">{{ log.status }}</span>
                          }
                        }
                      </div>
                    </td>
                    <td class="px-6 py-4 max-w-[200px] truncate">
                      <div class="text-[#202124] font-medium truncate" [title]="log.fileName">{{ log.fileName }}</div>
                      <div class="text-xs text-[#5F6368] mt-0.5 truncate" [title]="log.importedByEmail">{{ log.importedByEmail }}</div>
                    </td>
                    <td class="px-6 py-4">
                      <div class="flex items-center gap-3">
                        <span class="flex items-center gap-1 text-emerald-600" title="Imported">
                          <lucide-icon name="circle-check" [size]="14"></lucide-icon>
                          {{ log.inserted }}
                        </span>
                        @if (log.skipped > 0) {
                          <span class="flex items-center gap-1 text-amber-600" title="Skipped">
                            <lucide-icon name="skip-forward" [size]="14"></lucide-icon>
                            {{ log.skipped }}
                          </span>
                        }
                        @if (log.failed > 0) {
                          <span class="flex items-center gap-1 text-red-600" title="Failed">
                            <lucide-icon name="circle-x" [size]="14"></lucide-icon>
                            {{ log.failed }}
                          </span>
                        }
                      </div>
                    </td>
                    <td class="px-6 py-4 text-right">
                      @if (log.contentCompletenessSummaryJson || log.errorSummaryJson || log.warningSummaryJson) {
                        <button (click)="viewDetails(log)" class="text-[#1A73E8] hover:text-blue-800 font-medium text-xs flex items-center gap-1 ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
                          View details
                          <lucide-icon name="chevron-right" [size]="14"></lucide-icon>
                        </button>
                      }
                    </td>
                  </tr>
                }
              }
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        @if (totalPages() > 1) {
          <div class="px-6 py-4 border-t border-[#E0E0E0] flex items-center justify-between bg-slate-50">
            <span class="text-xs text-[#5F6368]">
              Showing page {{ page() }} of {{ totalPages() }}
            </span>
            <div class="flex gap-2">
              <button class="btn btn-ghost text-xs px-3" [disabled]="page() === 1" (click)="setPage(page() - 1)">Previous</button>
              <button class="btn btn-ghost text-xs px-3" [disabled]="page() === totalPages()" (click)="setPage(page() + 1)">Next</button>
            </div>
          </div>
        }
      </div>
      
    </div>

    <!-- Details Modal -->
    @if (selectedLog()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
        <div class="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col animate-slide-up">
          <div class="px-6 py-4 border-b border-[#E0E0E0] flex items-center justify-between bg-slate-50 rounded-t-2xl">
            <h3 class="font-semibold text-[#202124] flex items-center gap-2">
              <lucide-icon name="file-text" [size]="18" class="text-[#1A73E8]"></lucide-icon>
              Import Details
            </h3>
            <button (click)="closeDetails()" class="text-[#5F6368] hover:text-[#202124] transition-colors">
              <lucide-icon name="x" [size]="20"></lucide-icon>
            </button>
          </div>
          
          <div class="p-6 overflow-y-auto flex-1 space-y-6 text-sm">
            @if (selectedLog()?.errorSummaryJson) {
              <div class="p-4 bg-red-50 border border-red-200 rounded-xl">
                <h4 class="font-semibold text-red-800 mb-1 flex items-center gap-2">
                  <lucide-icon name="alert-triangle" [size]="16"></lucide-icon> Error Message
                </h4>
                <p class="text-red-700 whitespace-pre-wrap">{{ formatJson(selectedLog()?.errorSummaryJson) }}</p>
              </div>
            }

            @if (selectedLog()?.warningSummaryJson) {
              <div>
                <h4 class="font-semibold text-[#202124] mb-2 uppercase tracking-wider text-xs">Warnings</h4>
                <pre class="bg-slate-900 text-slate-300 p-4 rounded-xl text-xs overflow-x-auto whitespace-pre-wrap font-mono">{{ formatJson(selectedLog()?.warningSummaryJson) }}</pre>
              </div>
            }

            @if (selectedLog()?.contentCompletenessSummaryJson) {
              <div>
                <h4 class="font-semibold text-[#202124] mb-2 uppercase tracking-wider text-xs">Completeness Report</h4>
                <pre class="bg-slate-50 border border-slate-200 text-[#3C4043] p-4 rounded-xl text-xs overflow-x-auto whitespace-pre-wrap font-mono">{{ formatJson(selectedLog()?.contentCompletenessSummaryJson) }}</pre>
              </div>
            }
          </div>
          
          <div class="px-6 py-4 border-t border-[#E0E0E0] bg-slate-50 rounded-b-2xl flex justify-end">
            <button (click)="closeDetails()" class="btn btn-secondary">Close</button>
          </div>
        </div>
      </div>
    }
  `
})
export class AdminImportLogsComponent implements OnInit {
  private readonly api = inject(AdminApiService);

  readonly logs = signal<ImportLogDto[]>([]);
  readonly loading = signal(true);
  readonly page = signal(1);
  readonly totalPages = signal(1);
  readonly selectedLog = signal<ImportLogDto | null>(null);

  ngOnInit() {
    this.loadLogs();
  }

  loadLogs() {
    this.loading.set(true);
    this.api.getImportLogs(this.page(), 20).subscribe({
      next: (res) => {
        this.logs.set(res.data);
        this.totalPages.set(res.totalPages);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }

  setPage(p: number) {
    if (p < 1 || p > this.totalPages()) return;
    this.page.set(p);
    this.loadLogs();
  }

  viewDetails(log: ImportLogDto) {
    this.selectedLog.set(log);
  }

  closeDetails() {
    this.selectedLog.set(null);
  }

  formatJson(jsonStr: string | null | undefined): string {
    if (!jsonStr) return '';
    try {
      const parsed = JSON.parse(jsonStr);
      return JSON.stringify(parsed, null, 2);
    } catch {
      return jsonStr;
    }
  }
}

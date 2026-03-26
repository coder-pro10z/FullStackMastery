import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import {
  AdminApiService,
  AdminQuestionFilter,
  BulkImportResultDto,
  CategoryManageDto,
  CreateUpdateQuestionDto,
  DashboardStatsDto,
  PagedAdminResult,
  QuestionAdminDto
} from '../../../core/services/admin-api.service';

type AdminTab = 'dashboard' | 'questions' | 'categories' | 'import';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
<div class="min-h-screen bg-[#0a0f1e] text-white">

  <!-- ── Top Nav ─────────────────────────────────────────────────────────── -->
  <header class="sticky top-0 z-40 border-b border-white/5 bg-[#0a0f1e]/90 backdrop-blur-xl">
    <div class="flex items-center justify-between px-6 h-14">
      <div class="flex items-center gap-3">
        <div class="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
          <svg class="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
        <span class="font-semibold text-sm">Admin Workspace</span>
      </div>
      <div class="flex items-center gap-3">
        <a routerLink="/" class="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors px-3 py-1.5 rounded-lg hover:bg-white/5">
          <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          Dashboard
        </a>
      </div>
    </div>

    <!-- Tab bar -->
    <div class="flex gap-0 px-4 border-t border-white/5">
      @for (tab of tabs; track tab.id) {
        <button
          (click)="activeTab.set(tab.id)"
          class="px-4 py-2.5 text-xs font-medium transition-all border-b-2 -mb-px"
          [class]="activeTab() === tab.id
            ? 'border-blue-500 text-blue-400'
            : 'border-transparent text-slate-500 hover:text-slate-300'">
          {{ tab.label }}
        </button>
      }
    </div>
  </header>

  <!-- ── Content ──────────────────────────────────────────────────────────── -->
  <main class="p-6">

    <!-- DASHBOARD TAB -->
    @if (activeTab() === 'dashboard') {
      <div class="space-y-6 animate-fade-in">
        <div>
          <h1 class="text-lg font-bold text-white">Overview</h1>
          <p class="text-xs text-slate-500 mt-0.5">Platform statistics and recent activity</p>
        </div>

        @if (statsLoading()) {
          <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
            @for (i of [1,2,3,4]; track i) {
              <div class="glass-panel p-4 animate-pulse h-20 rounded-xl"></div>
            }
          </div>
        } @else if (stats()) {
          <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div class="glass-panel p-4 rounded-xl">
              <p class="text-xs text-slate-500">Total Questions</p>
              <p class="text-2xl font-bold text-white mt-1">{{ stats()!.totalQuestions }}</p>
              <p class="text-xs text-blue-400 mt-1">{{ stats()!.publishedQuestions }} published</p>
            </div>
            <div class="glass-panel p-4 rounded-xl">
              <p class="text-xs text-slate-500">Total Users</p>
              <p class="text-2xl font-bold text-white mt-1">{{ stats()!.totalUsers }}</p>
            </div>
            <div class="glass-panel p-4 rounded-xl">
              <p class="text-xs text-slate-500">Categories</p>
              <p class="text-2xl font-bold text-white mt-1">{{ stats()!.totalCategories }}</p>
            </div>
            <div class="glass-panel p-4 rounded-xl">
              <p class="text-xs text-slate-500">Drafts / Deleted</p>
              <p class="text-2xl font-bold text-white mt-1">{{ stats()!.draftQuestions }}</p>
              <p class="text-xs text-red-400 mt-1">{{ stats()!.deletedQuestions }} deleted</p>
            </div>
          </div>

          <!-- Difficulty Breakdown -->
          <div class="glass-panel p-5 rounded-xl">
            <h2 class="text-sm font-semibold text-white mb-4">By Difficulty</h2>
            <div class="space-y-3">
              <div class="flex items-center gap-3">
                <span class="w-14 text-xs text-green-400">Easy</span>
                <div class="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                  <div class="h-full bg-green-500 rounded-full transition-all" [style.width.%]="(stats()!.countByDifficulty.easy / ((stats()!.countByDifficulty.easy + stats()!.countByDifficulty.medium + stats()!.countByDifficulty.hard) || 1)) * 100"></div>
                </div>
                <span class="text-xs text-slate-400 w-8 text-right">{{ stats()!.countByDifficulty.easy }}</span>
              </div>
              <div class="flex items-center gap-3">
                <span class="w-14 text-xs text-yellow-400">Medium</span>
                <div class="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                  <div class="h-full bg-yellow-500 rounded-full transition-all" [style.width.%]="(stats()!.countByDifficulty.medium / ((stats()!.countByDifficulty.easy + stats()!.countByDifficulty.medium + stats()!.countByDifficulty.hard) || 1)) * 100"></div>
                </div>
                <span class="text-xs text-slate-400 w-8 text-right">{{ stats()!.countByDifficulty.medium }}</span>
              </div>
              <div class="flex items-center gap-3">
                <span class="w-14 text-xs text-red-400">Hard</span>
                <div class="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                  <div class="h-full bg-red-500 rounded-full transition-all" [style.width.%]="(stats()!.countByDifficulty.hard / ((stats()!.countByDifficulty.easy + stats()!.countByDifficulty.medium + stats()!.countByDifficulty.hard) || 1)) * 100"></div>
                </div>
                <span class="text-xs text-slate-400 w-8 text-right">{{ stats()!.countByDifficulty.hard }}</span>
              </div>
            </div>
          </div>

          <!-- Recent Activity -->
          @if (stats()!.recentActivity?.length) {
            <div class="glass-panel rounded-xl overflow-hidden">
              <div class="px-5 py-3 border-b border-white/5">
                <h2 class="text-sm font-semibold text-white">Recent Activity</h2>
              </div>
              <div class="divide-y divide-white/5">
                @for (log of stats()!.recentActivity; track log.id) {
                  <div class="px-5 py-3 flex items-center gap-3">
                    <span class="text-xs px-2 py-0.5 rounded-full font-medium"
                      [class]="log.action === 'CREATED' || log.action === 'IMPORTED' ? 'bg-green-500/10 text-green-400' :
                                log.action === 'DELETED' ? 'bg-red-500/10 text-red-400' :
                                'bg-blue-500/10 text-blue-400'">
                      {{ log.action }}
                    </span>
                    <span class="text-xs text-slate-400 flex-1">{{ log.entityType }}{{ log.entityId ? ' #' + log.entityId : '' }}</span>
                    <span class="text-xs text-slate-600">{{ log.userEmail }}</span>
                    <span class="text-xs text-slate-600">{{ log.timestamp | date:'short' }}</span>
                  </div>
                }
              </div>
            </div>
          }
        }
      </div>
    }

    <!-- QUESTIONS TAB -->
    @if (activeTab() === 'questions') {
      <div class="space-y-4 animate-fade-in">
        <!-- Header -->
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-lg font-bold text-white">Questions</h1>
            <p class="text-xs text-slate-500 mt-0.5">{{ questionsResult()?.totalRecords ?? 0 }} total</p>
          </div>
          <button (click)="openCreateModal()" class="btn-primary text-xs px-4 py-2 flex items-center gap-1.5">
            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            New Question
          </button>
        </div>

        <!-- Filters -->
        <div class="glass-panel p-3 rounded-xl flex flex-wrap items-center gap-2">
          <input type="text" [(ngModel)]="qFilter.searchTerm" (input)="applyFilter()"
            placeholder="Search questions..." class="input-dark text-xs flex-1 min-w-48 py-1.5">
          <select [(ngModel)]="qFilter.difficulty" (change)="applyFilter()" class="select-dark text-xs py-1.5 w-28">
            <option value="">All Levels</option>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>
          <select [(ngModel)]="qFilter.status" (change)="applyFilter()" class="select-dark text-xs py-1.5 w-28">
            <option value="">All Status</option>
            <option value="Published">Published</option>
            <option value="Draft">Draft</option>
          </select>
          <label class="flex items-center gap-1.5 text-xs text-slate-400 cursor-pointer">
            <input type="checkbox" [(ngModel)]="qFilter.includeDeleted" (change)="applyFilter()" class="w-3.5 h-3.5 accent-blue-500">
            Show Deleted
          </label>
        </div>

        <!-- Table -->
        @if (questionsLoading()) {
          <div class="space-y-2">
            @for (i of [1,2,3,4,5]; track i) {
              <div class="glass-panel rounded-xl h-16 animate-pulse"></div>
            }
          </div>
        } @else if (questionsResult()?.data?.length) {
          <div class="glass-panel rounded-xl overflow-hidden">
            <table class="w-full text-xs">
              <thead class="border-b border-white/5">
                <tr class="text-slate-500">
                  <th class="px-4 py-3 text-left font-medium">Title / Question</th>
                  <th class="px-4 py-3 text-left font-medium w-28">Category</th>
                  <th class="px-4 py-3 text-left font-medium w-20">Difficulty</th>
                  <th class="px-4 py-3 text-left font-medium w-20">Status</th>
                  <th class="px-4 py-3 text-right font-medium w-24">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-white/5">
                @for (q of questionsResult()!.data; track q.id) {
                  <tr class="hover:bg-white/2 transition-colors" [class.opacity-50]="q.isDeleted">
                    <td class="px-4 py-3">
                      <p class="font-medium text-white text-xs leading-tight line-clamp-1">
                        {{ q.title || q.questionText }}
                      </p>
                      @if (q.title) {
                        <p class="text-slate-600 text-xs leading-tight line-clamp-1 mt-0.5">{{ q.questionText }}</p>
                      }
                    </td>
                    <td class="px-4 py-3 text-slate-400">{{ q.categoryName }}</td>
                    <td class="px-4 py-3">
                      <span class="px-2 py-0.5 rounded-full text-xs font-medium"
                        [class]="q.difficulty === 'Easy' ? 'bg-green-500/10 text-green-400' :
                                  q.difficulty === 'Medium' ? 'bg-yellow-500/10 text-yellow-400' :
                                  'bg-red-500/10 text-red-400'">
                        {{ q.difficulty }}
                      </span>
                    </td>
                    <td class="px-4 py-3">
                      <span class="px-2 py-0.5 rounded-full text-xs font-medium"
                        [class]="q.isDeleted ? 'bg-red-500/10 text-red-400' :
                                  q.status === 'Published' ? 'bg-blue-500/10 text-blue-400' :
                                  'bg-slate-500/10 text-slate-400'">
                        {{ q.isDeleted ? 'Deleted' : q.status }}
                      </span>
                    </td>
                    <td class="px-4 py-3">
                      <div class="flex items-center justify-end gap-1">
                        @if (!q.isDeleted) {
                          <button (click)="openEditModal(q)"
                            class="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
                            title="Edit">
                            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                              <path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button (click)="deleteQuestion(q.id)"
                            class="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/5 transition-colors"
                            title="Delete">
                            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                              <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        } @else {
                          <button (click)="restoreQuestion(q.id)"
                            class="px-2.5 py-1 rounded-lg text-xs text-green-400 hover:bg-green-500/10 transition-colors border border-green-500/20">
                            Restore
                          </button>
                        }
                      </div>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>

          <!-- Pagination -->
          @if (questionsResult()!.totalPages > 1) {
            <div class="flex items-center justify-between text-xs text-slate-500">
              <span>Page {{ questionsResult()!.pageNumber }} of {{ questionsResult()!.totalPages }} ({{ questionsResult()!.totalRecords }} total)</span>
              <div class="flex gap-1">
                <button (click)="changePage(questionsResult()!.pageNumber - 1)" [disabled]="questionsResult()!.pageNumber <= 1"
                  class="px-3 py-1.5 rounded-lg border border-white/10 hover:bg-white/5 disabled:opacity-30 transition-colors">← Prev</button>
                <button (click)="changePage(questionsResult()!.pageNumber + 1)" [disabled]="questionsResult()!.pageNumber >= questionsResult()!.totalPages"
                  class="px-3 py-1.5 rounded-lg border border-white/10 hover:bg-white/5 disabled:opacity-30 transition-colors">Next →</button>
              </div>
            </div>
          }
        } @else {
          <div class="glass-panel rounded-xl py-12 text-center">
            <p class="text-slate-500 text-sm">No questions found</p>
          </div>
        }
      </div>
    }

    <!-- CATEGORIES TAB -->
    @if (activeTab() === 'categories') {
      <div class="space-y-4 animate-fade-in">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-lg font-bold text-white">Categories</h1>
            <p class="text-xs text-slate-500 mt-0.5">Hierarchical category management</p>
          </div>
          <button (click)="showCatForm.set(true)" class="btn-primary text-xs px-4 py-2 flex items-center gap-1.5">
            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            New Category
          </button>
        </div>

        @if (showCatForm()) {
          <div class="glass-panel p-4 rounded-xl flex items-end gap-3">
            <div class="flex-1">
              <label class="text-xs text-slate-400 mb-1 block">Name</label>
              <input type="text" [(ngModel)]="newCatName" placeholder="Category name" class="input-dark text-xs w-full">
            </div>
            <div class="flex-1">
              <label class="text-xs text-slate-400 mb-1 block">Slug (optional)</label>
              <input type="text" [(ngModel)]="newCatSlug" placeholder="auto-generated" class="input-dark text-xs w-full">
            </div>
            <button (click)="createCategory()" class="btn-primary text-xs px-4 py-2">Add</button>
            <button (click)="showCatForm.set(false)" class="text-xs px-3 py-2 text-slate-400 hover:text-white transition-colors">Cancel</button>
          </div>
        }

        @if (categoriesLoading()) {
          <div class="glass-panel rounded-xl h-40 animate-pulse"></div>
        } @else if (categories()?.length) {
          <div class="glass-panel rounded-xl overflow-hidden divide-y divide-white/5">
            @for (cat of categories()!; track cat.id) {
              <ng-container *ngTemplateOutlet="categoryRow; context: { $implicit: cat, depth: 0 }"></ng-container>
            }
          </div>
        }

        <ng-template #categoryRow let-cat let-depth="depth">
          <div class="flex items-center gap-3 px-4 py-2.5 hover:bg-white/2 transition-colors"
               [style.padding-left.px]="16 + depth * 16">
            <svg class="w-3.5 h-3.5 text-blue-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
            <span class="text-xs font-medium text-white flex-1">{{ cat.name }}</span>
            <span class="text-xs text-slate-600 font-mono">{{ cat.slug }}</span>
            <span class="text-xs text-slate-500">{{ cat.questionCount }} questions</span>
            @if (cat.questionCount === 0) {
              <button (click)="deleteCategory(cat.id)"
                class="p-1 rounded text-slate-600 hover:text-red-400 transition-colors" title="Delete">
                <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            }
          </div>
          @if (cat.subCategories?.length) {
            @for (sub of cat.subCategories; track sub.id) {
              <ng-container *ngTemplateOutlet="categoryRow; context: { $implicit: sub, depth: depth + 1 }"></ng-container>
            }
          }
        </ng-template>
      </div>
    }

    <!-- IMPORT TAB -->
    @if (activeTab() === 'import') {
      <div class="space-y-6 animate-fade-in">
        <div>
          <h1 class="text-lg font-bold text-white">Import Questions</h1>
          <p class="text-xs text-slate-500 mt-0.5">Upload .xlsx, .json, or .csv files. Supports dry-run preview.</p>
        </div>
        <div class="glass-panel p-6 rounded-xl max-w-2xl space-y-5">
          <!-- Category picker -->
          <div>
            <label class="text-xs font-medium text-slate-400 mb-1.5 block">Default Category</label>
            <select [(ngModel)]="importCategoryId" class="select-dark text-sm">
              <option [ngValue]="0" disabled>Select a category...</option>
              @for (cat of flatCategories(); track cat.id) {
                <option [ngValue]="cat.id">{{ cat.name }}</option>
              }
            </select>
          </div>

          <!-- Dry run toggle -->
          <label class="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" [(ngModel)]="importDryRun" class="w-4 h-4 accent-blue-500">
            <span class="text-xs text-slate-400">Dry run (validate only, don't save)</span>
          </label>

          <!-- Drop zone -->
          <div
            class="border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all"
            [class]="importDragging()
              ? 'border-blue-500/60 bg-blue-500/5'
              : importFile()
                ? 'border-green-500/40 bg-green-500/5'
                : 'border-white/10 hover:border-white/20'"
            (dragover)="onImportDragOver($event)"
            (dragleave)="importDragging.set(false)"
            (drop)="onImportDrop($event)"
            (click)="importFileInput.click()">
            <input #importFileInput type="file" accept=".xlsx,.xls,.json,.csv"
              (change)="onImportFileChange($event)" class="hidden">
            @if (importFile()) {
              <div class="flex flex-col items-center gap-2">
                <svg class="w-8 h-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p class="text-sm font-medium text-white">{{ importFile()!.name }}</p>
                <p class="text-xs text-slate-500">Click or drag to replace</p>
              </div>
            } @else {
              <div class="flex flex-col items-center gap-2">
                <svg class="w-8 h-8 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <p class="text-sm text-slate-300"><span class="text-blue-400 font-medium">Click to upload</span> or drag & drop</p>
                <p class="text-xs text-slate-600">.xlsx .xls .json .csv</p>
              </div>
            }
          </div>

          <!-- Import result -->
          @if (importResult()) {
            <div class="space-y-2 text-xs">
              <div class="flex gap-4 p-3 rounded-xl bg-white/3 border border-white/5">
                <span class="text-green-400">✓ {{ importResult()!.imported }} imported</span>
                @if (importResult()!.skipped) { <span class="text-yellow-400">⚠ {{ importResult()!.skipped }} skipped</span> }
                @if (importResult()!.failed)  { <span class="text-red-400">✗ {{ importResult()!.failed }} failed</span> }
                @if (importResult()!.isDryRun){ <span class="text-blue-400">(Dry Run)</span> }
              </div>
              @if (importResult()!.warnings?.length) {
                <div class="space-y-1">
                  @for (w of importResult()!.warnings; track $index) {
                    <p class="text-yellow-400/80">⚠ {{ w }}</p>
                  }
                </div>
              }
              @if (importResult()!.errors?.length) {
                <div class="space-y-1">
                  @for (e of importResult()!.errors; track $index) {
                    <p class="text-red-400/80">✗ {{ e }}</p>
                  }
                </div>
              }
            </div>
          }

          @if (importUploading()) {
            <div class="progress-track">
              <div class="progress-fill bg-gradient-to-r from-blue-500 to-indigo-500 animate-pulse-slow" style="width:75%"></div>
            </div>
          }

          <button (click)="runImport()" [disabled]="!importFile() || importUploading()"
            class="btn-primary w-full py-3 text-sm flex items-center justify-center gap-2 disabled:opacity-50">
            @if (importUploading()) {
              <svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
              </svg>
              Processing...
            } @else {
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              {{ importDryRun ? 'Validate File' : 'Import Questions' }}
            }
          </button>
        </div>
      </div>
    }
  </main>
</div>

<!-- ── Question Edit Modal ──────────────────────────────────────────────────── -->
@if (showModal()) {
  <div class="fixed inset-0 z-50 flex items-center justify-center p-4"
    (click)="closeModal()" role="dialog" aria-modal="true">
    <div class="absolute inset-0 bg-black/70 backdrop-blur-sm"></div>
    <div class="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto glass-panel rounded-2xl p-6 shadow-2xl animate-scale-in"
      (click)="$event.stopPropagation()">

      <div class="flex items-center justify-between mb-5">
        <h2 class="text-base font-semibold text-white">
          {{ editingQuestion() ? 'Edit Question #' + editingQuestion()!.id : 'New Question' }}
        </h2>
        <button (click)="closeModal()" class="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors">
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <form class="space-y-4" (ngSubmit)="saveQuestion()">
        <div>
          <label class="text-xs font-medium text-slate-400 mb-1 block">Title (optional)</label>
          <input type="text" [(ngModel)]="form.title" name="title" placeholder="Short descriptive title..."
            class="input-dark text-sm w-full">
        </div>

        <div class="grid grid-cols-3 gap-3">
          <div>
            <label class="text-xs font-medium text-slate-400 mb-1 block">Difficulty</label>
            <select [(ngModel)]="form.difficulty" name="difficulty" class="select-dark text-sm w-full">
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
          </div>
          <div>
            <label class="text-xs font-medium text-slate-400 mb-1 block">Role</label>
            <input type="text" [(ngModel)]="form.role" name="role" placeholder="Backend, Frontend..."
              class="input-dark text-sm w-full">
          </div>
          <div>
            <label class="text-xs font-medium text-slate-400 mb-1 block">Status</label>
            <select [(ngModel)]="form.status" name="status" class="select-dark text-sm w-full">
              <option value="Published">Published</option>
              <option value="Draft">Draft</option>
            </select>
          </div>
        </div>

        <div>
          <label class="text-xs font-medium text-slate-400 mb-1 block">Category</label>
          <select [(ngModel)]="form.categoryId" name="categoryId" class="select-dark text-sm w-full">
            <option [ngValue]="0" disabled>Select category...</option>
            @for (cat of flatCategories(); track cat.id) {
              <option [ngValue]="cat.id">{{ cat.name }}</option>
            }
          </select>
        </div>

        <div>
          <label class="text-xs font-medium text-slate-400 mb-1 block">Question *</label>
          <textarea [(ngModel)]="form.questionText" name="questionText" rows="3"
            placeholder="Enter the interview question..."
            class="input-dark text-sm w-full resize-none"></textarea>
        </div>

        <div>
          <div class="flex items-center justify-between mb-1">
            <label class="text-xs font-medium text-slate-400">Answer (Markdown)</label>
            <button type="button" (click)="previewMode.set(!previewMode())"
              class="text-xs text-blue-400 hover:text-blue-300 transition-colors">
              {{ previewMode() ? 'Edit' : 'Preview' }}
            </button>
          </div>
          @if (!previewMode()) {
            <textarea [(ngModel)]="form.answerMarkdown" name="answerMarkdown" rows="8"
              placeholder="Enter answer here..."
              class="input-dark text-sm w-full resize-none font-mono text-xs leading-relaxed"></textarea>
          } @else {
            <div class="input-dark min-h-40 prose prose-invert prose-sm max-w-none p-3 text-xs leading-relaxed whitespace-pre-wrap text-slate-300">
              {{ form.answerMarkdown || 'Nothing to preview yet...' }}
            </div>
          }
        </div>

        @if (modalError()) {
          <p class="text-xs text-red-400 bg-red-500/10 border border-red-500/20 px-3 py-2 rounded-lg">{{ modalError() }}</p>
        }

        <div class="flex items-center justify-end gap-3 pt-2 border-t border-white/5">
          <button type="button" (click)="closeModal()" class="text-xs px-4 py-2 text-slate-400 hover:text-white transition-colors">Cancel</button>
          <button type="submit" [disabled]="modalSaving()"
            class="btn-primary text-xs px-5 py-2 flex items-center gap-1.5 disabled:opacity-50">
            @if (modalSaving()) {
              <svg class="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
              </svg>
            }
            {{ editingQuestion() ? 'Save Changes' : 'Create Question' }}
          </button>
        </div>
      </form>
    </div>
  </div>
}
  `
})
export class AdminDashboardComponent implements OnInit {
  private readonly api = inject(AdminApiService);

  readonly tabs = [
    { id: 'dashboard' as AdminTab, label: '📊 Dashboard' },
    { id: 'questions' as AdminTab, label: '❓ Questions' },
    { id: 'categories' as AdminTab, label: '🏷 Categories' },
    { id: 'import' as AdminTab, label: '📥 Import' },
  ];

  readonly activeTab = signal<AdminTab>('dashboard');

  // ── Dashboard state ────────────────────────────────────────────────────────
  readonly stats = signal<DashboardStatsDto | null>(null);
  readonly statsLoading = signal(true);

  // ── Questions state ────────────────────────────────────────────────────────
  readonly questionsResult = signal<PagedAdminResult<QuestionAdminDto> | null>(null);
  readonly questionsLoading = signal(false);
  qFilter: AdminQuestionFilter = { page: 1, pageSize: 20 };

  // ── Categories state ───────────────────────────────────────────────────────
  readonly categories = signal<CategoryManageDto[] | null>(null);
  readonly categoriesLoading = signal(false);
  readonly showCatForm = signal(false);
  newCatName = '';
  newCatSlug = '';

  readonly flatCategories = computed(() => {
    const flatten = (cats: CategoryManageDto[], depth = 0): { id: number; name: string }[] =>
      cats.flatMap(c => [
        { id: c.id, name: ('  '.repeat(depth)) + c.name },
        ...flatten(c.subCategories ?? [], depth + 1)
      ]);
    return flatten(this.categories() ?? []);
  });

  // ── Import state ───────────────────────────────────────────────────────────
  readonly importFile = signal<File | null>(null);
  readonly importDragging = signal(false);
  readonly importUploading = signal(false);
  readonly importResult = signal<BulkImportResultDto | null>(null);
  importCategoryId = 0;
  importDryRun = false;

  // ── Modal state ────────────────────────────────────────────────────────────
  readonly showModal = signal(false);
  readonly editingQuestion = signal<QuestionAdminDto | null>(null);
  readonly modalSaving = signal(false);
  readonly modalError = signal('');
  readonly previewMode = signal(false);
  form: CreateUpdateQuestionDto = this.emptyForm();

  ngOnInit() {
    this.loadStats();
    this.loadQuestions();
    this.loadCategories();
  }

  // ── Dashboard ──────────────────────────────────────────────────────────────
  loadStats() {
    this.statsLoading.set(true);
    this.api.getDashboardStats().subscribe({
      next: s => { this.stats.set(s); this.statsLoading.set(false); },
      error: () => this.statsLoading.set(false)
    });
  }

  // ── Questions ──────────────────────────────────────────────────────────────
  loadQuestions() {
    this.questionsLoading.set(true);
    this.api.getQuestions(this.qFilter).subscribe({
      next: r => { this.questionsResult.set(r); this.questionsLoading.set(false); },
      error: () => this.questionsLoading.set(false)
    });
  }

  applyFilter() {
    this.qFilter.page = 1;
    this.loadQuestions();
  }

  changePage(page: number) {
    this.qFilter.page = page;
    this.loadQuestions();
  }

  openCreateModal() {
    this.editingQuestion.set(null);
    this.form = this.emptyForm();
    this.modalError.set('');
    this.previewMode.set(false);
    this.showModal.set(true);
  }

  openEditModal(q: QuestionAdminDto) {
    this.editingQuestion.set(q);
    this.form = {
      title: q.title ?? '',
      questionText: q.questionText,
      answerMarkdown: q.answerMarkdown ?? '',
      difficulty: q.difficulty,
      role: q.role,
      categoryId: q.categoryId,
      status: q.status
    };
    this.modalError.set('');
    this.previewMode.set(false);
    this.showModal.set(true);
  }

  closeModal() { this.showModal.set(false); }

  saveQuestion() {
    if (!this.form.questionText?.trim()) {
      this.modalError.set('Question text is required.');
      return;
    }
    if (!this.form.categoryId) {
      this.modalError.set('Please select a category.');
      return;
    }
    this.modalSaving.set(true);
    this.modalError.set('');

    const obs = this.editingQuestion()
      ? this.api.updateQuestion(this.editingQuestion()!.id, this.form)
      : this.api.createQuestion(this.form);

    obs.subscribe({
      next: () => {
        this.modalSaving.set(false);
        this.closeModal();
        this.loadQuestions();
        this.loadStats();
      },
      error: () => {
        this.modalSaving.set(false);
        this.modalError.set('Failed to save. Please try again.');
      }
    });
  }

  deleteQuestion(id: number) {
    if (!confirm('Soft-delete this question?')) return;
    this.api.deleteQuestion(id).subscribe(() => {
      this.loadQuestions();
      this.loadStats();
    });
  }

  restoreQuestion(id: number) {
    this.api.restoreQuestion(id).subscribe(() => {
      this.loadQuestions();
      this.loadStats();
    });
  }

  // ── Categories ─────────────────────────────────────────────────────────────
  loadCategories() {
    this.categoriesLoading.set(true);
    this.api.getCategoryTree().subscribe({
      next: c => { this.categories.set(c); this.categoriesLoading.set(false); },
      error: () => this.categoriesLoading.set(false)
    });
  }

  createCategory() {
    if (!this.newCatName.trim()) return;
    this.api.createCategory({ name: this.newCatName, slug: this.newCatSlug || undefined }).subscribe(() => {
      this.newCatName = '';
      this.newCatSlug = '';
      this.showCatForm.set(false);
      this.loadCategories();
    });
  }

  deleteCategory(id: number) {
    if (!confirm('Delete this category?')) return;
    this.api.deleteCategory(id).subscribe(() => this.loadCategories());
  }

  // ── Import ─────────────────────────────────────────────────────────────────
  onImportDragOver(e: DragEvent) { e.preventDefault(); this.importDragging.set(true); }
  onImportDrop(e: DragEvent) {
    e.preventDefault();
    this.importDragging.set(false);
    const file = e.dataTransfer?.files[0];
    if (file) { this.importFile.set(file); this.importResult.set(null); }
  }
  onImportFileChange(e: Event) {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (file) { this.importFile.set(file); this.importResult.set(null); }
  }

  runImport() {
    if (!this.importFile()) return;
    this.importUploading.set(true);
    this.importResult.set(null);
    this.api.importFile(this.importFile()!, this.importCategoryId || 1, this.importDryRun).subscribe({
      next: r => { this.importResult.set(r); this.importUploading.set(false); if (!this.importDryRun) this.loadStats(); },
      error: () => { this.importUploading.set(false); }
    });
  }

  private emptyForm(): CreateUpdateQuestionDto {
    return { title: '', questionText: '', answerMarkdown: '', difficulty: 'Easy', role: 'Backend', categoryId: 0, status: 'Published' };
  }
}

import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import {
  AdminApiService,
  AdminQuestionFilter,
  CategoryManageDto,
  PagedAdminResult,
  QuestionAdminDto,
} from '../../../core/services/admin-api.service';
import { QuestionModalComponent } from './components/question-modal/question-modal.component';

@Component({
  selector: 'app-admin-questions',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule, QuestionModalComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-6 animate-fade-in">

      <!-- Page Header -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-semibold tracking-tight text-[#202124]">Questions</h1>
          <p class="text-sm text-[#5F6368] mt-1">{{ result()?.totalRecords ?? 0 }} total questions</p>
        </div>
        <button id="q-new-btn" (click)="openCreate()" class="btn btn-primary flex items-center gap-2">
          <lucide-icon name="plus" [size]="16" />
          New Question
        </button>
      </div>

      <!-- Filters -->
      <div class="edudash-card flex flex-wrap items-center gap-3">
        <div class="flex-1 min-w-48 relative">
          <lucide-icon name="search" [size]="16" class="absolute left-3 top-1/2 -translate-y-1/2 text-[#5F6368]" />
          <input type="text" [(ngModel)]="filter.searchTerm" (input)="applyFilter()"
            placeholder="Search questions…"
            class="edudash-input pl-9 py-2 text-sm" />
        </div>
        <select [(ngModel)]="filter.difficulty" (change)="applyFilter()" class="edudash-input w-32 py-2 text-sm">
          <option value="">All Levels</option>
          <option value="Easy">Easy</option>
          <option value="Medium">Medium</option>
          <option value="Hard">Hard</option>
        </select>
        <select [(ngModel)]="filter.status" (change)="applyFilter()" class="edudash-input w-32 py-2 text-sm">
          <option value="">All Status</option>
          <option value="Published">Published</option>
          <option value="Draft">Draft</option>
        </select>
        <label class="flex items-center gap-2 text-sm text-[#5F6368] cursor-pointer select-none">
          <input type="checkbox" [(ngModel)]="filter.includeDeleted" (change)="applyFilter()"
            class="w-4 h-4 accent-[#1A73E8] rounded" />
          Show Deleted
        </label>
      </div>

      <!-- Table -->
      @if (loading()) {
        <div class="edudash-card p-0 overflow-hidden space-y-0 divide-y divide-[#E0E0E0]">
          @for (i of [1,2,3,4,5]; track i) {
            <div class="flex items-center gap-4 px-6 py-4 animate-pulse">
              <div class="flex-1 space-y-2">
                <div class="h-4 bg-slate-200 rounded w-2/3"></div>
                <div class="h-3 bg-slate-100 rounded w-1/2"></div>
              </div>
              <div class="h-5 bg-slate-200 rounded-full w-16"></div>
              <div class="h-5 bg-slate-200 rounded-full w-16"></div>
              <div class="h-5 bg-slate-200 rounded-full w-20"></div>
              <div class="flex gap-1">
                <div class="w-7 h-7 bg-slate-200 rounded-lg"></div>
                <div class="w-7 h-7 bg-slate-200 rounded-lg"></div>
              </div>
            </div>
          }
        </div>
      } @else if (result()?.data?.length) {
        <div class="edudash-card p-0 overflow-hidden">
          <table class="w-full text-sm">
            <thead class="border-b border-[#E0E0E0] bg-[#F8F9FA]">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-semibold text-[#5F6368] uppercase tracking-wider">Question</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-[#5F6368] uppercase tracking-wider w-32">Category</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-[#5F6368] uppercase tracking-wider w-24">Level</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-[#5F6368] uppercase tracking-wider w-24">Status</th>
                <th class="px-4 py-3 text-right text-xs font-semibold text-[#5F6368] uppercase tracking-wider w-24">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-[#E0E0E0]">
              @for (q of result()!.data; track q.id) {
                <tr class="hover:bg-[#F8F9FA] transition-colors" [class.opacity-50]="q.isDeleted">
                  <td class="px-6 py-3">
                    <p class="font-medium text-[#202124] text-sm leading-tight truncate max-w-xs">
                      {{ q.title || q.questionText }}
                    </p>
                    @if (q.title) {
                      <p class="text-xs text-[#5F6368] leading-tight truncate max-w-xs mt-0.5">{{ q.questionText }}</p>
                    }
                  </td>
                  <td class="px-4 py-3">
                    <span class="text-xs text-[#5F6368]">{{ q.categoryName }}</span>
                  </td>
                  <td class="px-4 py-3">
                    <span class="badge text-[11px]" [class]="difficultyBadge(q.difficulty)">{{ q.difficulty }}</span>
                  </td>
                  <td class="px-4 py-3">
                    <span class="badge text-[11px]" [class]="statusBadge(q)">{{ q.isDeleted ? 'Deleted' : q.status }}</span>
                  </td>
                  <td class="px-4 py-3">
                    <div class="flex items-center justify-end gap-1">
                      @if (!q.isDeleted) {
                        <button
                          id="q-edit-{{ q.id }}"
                          (click)="openEdit(q)"
                          class="p-1.5 rounded-lg text-[#5F6368] hover:text-[#1A73E8] hover:bg-blue-50 transition-colors"
                          title="Edit">
                          <lucide-icon name="pencil" [size]="14" />
                        </button>
                        <button
                          id="q-delete-{{ q.id }}"
                          (click)="softDelete(q.id)"
                          class="p-1.5 rounded-lg text-[#5F6368] hover:text-red-600 hover:bg-red-50 transition-colors"
                          title="Soft delete">
                          <lucide-icon name="trash-2" [size]="14" />
                        </button>
                      } @else {
                        <button
                          id="q-restore-{{ q.id }}"
                          (click)="restore(q.id)"
                          class="px-3 py-1 rounded-lg text-xs font-medium text-emerald-600 hover:bg-emerald-50 border border-emerald-200 transition-colors">
                          Restore
                        </button>
                      }
                    </div>
                  </td>
                </tr>
              }
            </tbody>
          </table>

          <!-- Pagination -->
          @if (result()!.totalPages > 1) {
            <div class="flex items-center justify-between px-6 py-3 border-t border-[#E0E0E0] bg-[#F8F9FA]">
              <span class="text-xs text-[#5F6368]">
                Page {{ result()!.pageNumber }} of {{ result()!.totalPages }} &middot; {{ result()!.totalRecords }} total
              </span>
              <div class="flex gap-2">
                <button
                  (click)="page(result()!.pageNumber - 1)"
                  [disabled]="result()!.pageNumber <= 1"
                  class="btn btn-secondary px-3 py-1.5 text-xs disabled:opacity-40">
                  ← Prev
                </button>
                <button
                  (click)="page(result()!.pageNumber + 1)"
                  [disabled]="result()!.pageNumber >= result()!.totalPages"
                  class="btn btn-secondary px-3 py-1.5 text-xs disabled:opacity-40">
                  Next →
                </button>
              </div>
            </div>
          }
        </div>

      } @else {
        <div class="edudash-card py-16 text-center">
          <lucide-icon name="inbox" [size]="40" class="text-[#E0E0E0] mx-auto mb-4" />
          <p class="text-sm text-[#5F6368]">No questions found. Try adjusting your filters.</p>
        </div>
      }
    </div>

    <!-- Question Modal -->
    @if (showModal()) {
      <app-question-modal
        [question]="editingQuestion()"
        [categories]="categories()"
        (saved)="onSaved()"
        (cancelled)="showModal.set(false)">
      </app-question-modal>
    }
  `,
})
export class AdminQuestionsComponent implements OnInit {
  private readonly api = inject(AdminApiService);

  readonly result = signal<PagedAdminResult<QuestionAdminDto> | null>(null);
  readonly loading = signal(false);
  readonly categories = signal<CategoryManageDto[]>([]);
  readonly showModal = signal(false);
  readonly editingQuestion = signal<QuestionAdminDto | null>(null);

  filter: AdminQuestionFilter = { page: 1, pageSize: 20 };

  ngOnInit(): void {
    this.loadQuestions();
    this.loadCategories();
  }

  loadQuestions(): void {
    this.loading.set(true);
    this.api.getQuestions(this.filter).subscribe({
      next: r => { this.result.set(r); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  loadCategories(): void {
    this.api.getCategoryTree().subscribe({
      next: cats => this.categories.set(cats),
    });
  }

  applyFilter(): void {
    this.filter.page = 1;
    this.loadQuestions();
  }

  page(p: number): void {
    this.filter.page = p;
    this.loadQuestions();
  }

  openCreate(): void {
    this.editingQuestion.set(null);
    this.showModal.set(true);
  }

  openEdit(q: QuestionAdminDto): void {
    this.editingQuestion.set(q);
    this.showModal.set(true);
  }

  onSaved(): void {
    this.showModal.set(false);
    this.loadQuestions();
  }

  softDelete(id: number): void {
    if (!confirm('Soft-delete this question?')) return;
    this.api.deleteQuestion(id).subscribe(() => this.loadQuestions());
  }

  restore(id: number): void {
    this.api.restoreQuestion(id).subscribe(() => this.loadQuestions());
  }

  difficultyBadge(d: string): string {
    return d === 'Easy' ? 'badge-success' : d === 'Medium' ? 'badge-warning' : 'bg-red-50 text-red-600 border-red-200';
  }

  statusBadge(q: QuestionAdminDto): string {
    if (q.isDeleted) return 'bg-red-50 text-red-600 border-red-200';
    return q.status === 'Published' ? 'badge-primary' : 'badge-neutral';
  }
}

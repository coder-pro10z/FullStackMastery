import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  inject,
  Input,
  OnChanges,
  Output,
  signal,
  SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import {
  AdminApiService,
  CategoryManageDto,
  CreateUpdateQuestionDto,
  QuestionAdminDto,
} from '../../../../../core/services/admin-api.service';

@Component({
  selector: 'app-question-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="qmodal-title"
      (click)="onBackdropClick($event)">

      <!-- Backdrop -->
      <div class="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>

      <!-- Panel -->
      <div
        class="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl border border-[#E0E0E0] animate-fade-in"
        (click)="$event.stopPropagation()">

        <!-- Header -->
        <div class="flex items-center justify-between px-6 py-4 border-b border-[#E0E0E0]">
          <h2 id="qmodal-title" class="text-base font-semibold text-[#202124]">
            {{ question ? 'Edit Question #' + question.id : 'New Question' }}
          </h2>
          <button
            id="qmodal-close"
            (click)="cancelled.emit()"
            class="p-1.5 rounded-lg text-[#5F6368] hover:bg-[#F8F9FA] hover:text-[#202124] transition-colors"
            aria-label="Close modal">
            <lucide-icon name="x" [size]="18" />
          </button>
        </div>

        <!-- Form -->
        <form class="px-6 py-5 space-y-4" (ngSubmit)="save()">

          <!-- Title -->
          <div>
            <label class="edudash-label" for="qm-title">Title <span class="text-[#5F6368] font-normal">(optional)</span></label>
            <input id="qm-title" type="text" [(ngModel)]="form.title" name="title"
              placeholder="Short descriptive title…" class="edudash-input" />
          </div>

          <!-- Row: Difficulty / Role / Status -->
          <div class="grid grid-cols-3 gap-4">
            <div>
              <label class="edudash-label" for="qm-difficulty">Difficulty *</label>
              <select id="qm-difficulty" [(ngModel)]="form.difficulty" name="difficulty" class="edudash-input">
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>
            <div>
              <label class="edudash-label" for="qm-role">Role *</label>
              <input id="qm-role" type="text" [(ngModel)]="form.role" name="role"
                placeholder="Backend, Frontend…" class="edudash-input" />
            </div>
            <div>
              <label class="edudash-label" for="qm-status">Status *</label>
              <select id="qm-status" [(ngModel)]="form.status" name="status" class="edudash-input">
                <option value="Published">Published</option>
                <option value="Draft">Draft</option>
              </select>
            </div>
          </div>

          <!-- Category -->
          <div>
            <label class="edudash-label" for="qm-category">Category *</label>
            <select id="qm-category" [(ngModel)]="form.categoryId" name="categoryId" class="edudash-input">
              <option [ngValue]="0" disabled>Select category…</option>
              @for (cat of flatCategories; track cat.id) {
                <option [ngValue]="cat.id">{{ cat.indent }}{{ cat.name }}</option>
              }
            </select>
          </div>

          <!-- Question Text -->
          <div>
            <label class="edudash-label" for="qm-question">Question *</label>
            <textarea id="qm-question" [(ngModel)]="form.questionText" name="questionText"
              rows="3" placeholder="Enter the interview question…"
              class="edudash-input resize-none"></textarea>
          </div>

          <!-- Answer Markdown -->
          <div>
            <div class="flex items-center justify-between mb-1.5">
              <label class="edudash-label mb-0" for="qm-answer">Answer (Markdown)</label>
              <button type="button" (click)="preview.set(!preview())"
                class="text-xs text-[#1A73E8] hover:text-[#1557B0] transition-colors">
                {{ preview() ? 'Edit' : 'Preview' }}
              </button>
            </div>
            @if (!preview()) {
              <textarea id="qm-answer" [(ngModel)]="form.answerMarkdown" name="answerMarkdown"
                rows="8" placeholder="Write answer in Markdown…"
                class="edudash-input resize-none font-mono text-xs leading-relaxed"></textarea>
            } @else {
              <div class="edudash-input min-h-[160px] text-xs leading-relaxed text-[#5F6368] whitespace-pre-wrap">
                {{ form.answerMarkdown || 'Nothing to preview yet…' }}
              </div>
            }
          </div>

          <!-- Error -->
          @if (error()) {
            <div class="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-600">
              <lucide-icon name="alert-circle" [size]="16" />
              {{ error() }}
            </div>
          }

          <!-- Footer -->
          <div class="flex items-center justify-end gap-3 pt-4 border-t border-[#E0E0E0]">
            <button type="button" (click)="cancelled.emit()" class="btn btn-ghost">Cancel</button>
            <button
              id="qmodal-save"
              type="submit"
              [disabled]="saving()"
              class="btn btn-primary disabled:opacity-50 flex items-center gap-2">
              @if (saving()) { <lucide-icon name="loader" [size]="14" class="animate-spin" /> }
              {{ question ? 'Save Changes' : 'Create Question' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
})
export class QuestionModalComponent implements OnChanges {
  private readonly api = inject(AdminApiService);

  @Input() question: QuestionAdminDto | null = null;
  @Input() categories: CategoryManageDto[] = [];
  @Output() saved = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  readonly saving = signal(false);
  readonly error = signal('');
  readonly preview = signal(false);

  form: CreateUpdateQuestionDto = this.empty();

  get flatCategories(): { id: number; name: string; indent: string }[] {
    const result: { id: number; name: string; indent: string }[] = [];
    const flatten = (cats: CategoryManageDto[], depth: number) => {
      for (const c of cats) {
        result.push({ id: c.id, name: c.name, indent: '\u00a0\u00a0'.repeat(depth) });
        if (c.subCategories?.length) flatten(c.subCategories, depth + 1);
      }
    };
    flatten(this.categories, 0);
    return result;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['question']) {
      const q = this.question;
      this.form = q
        ? { title: q.title ?? '', questionText: q.questionText,
            answerMarkdown: q.answerMarkdown ?? '', difficulty: q.difficulty,
            role: q.role, categoryId: q.categoryId, status: q.status }
        : this.empty();
      this.error.set('');
      this.preview.set(false);
    }
  }

  save(): void {
    if (!this.form.questionText?.trim()) { this.error.set('Question text is required.'); return; }
    if (!this.form.categoryId) { this.error.set('Please select a category.'); return; }
    this.saving.set(true);
    this.error.set('');
    const obs = this.question
      ? this.api.updateQuestion(this.question.id, this.form)
      : this.api.createQuestion(this.form);
    obs.subscribe({
      next: () => { this.saving.set(false); this.saved.emit(); },
      error: () => { this.saving.set(false); this.error.set('Failed to save. Please try again.'); },
    });
  }

  onBackdropClick(e: MouseEvent): void {
    if (e.target === e.currentTarget) this.cancelled.emit();
  }

  private empty(): CreateUpdateQuestionDto {
    return { title: '', questionText: '', answerMarkdown: '',
             difficulty: 'Easy', role: 'Backend', categoryId: 0, status: 'Published' };
  }
}

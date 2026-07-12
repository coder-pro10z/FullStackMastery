import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import {
  AdminApiService,
  CategoryManageDto,
} from '../../../core/services/admin-api.service';

@Component({
  selector: 'app-admin-categories',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-6 animate-fade-in">

      <!-- Page Header -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-semibold tracking-tight text-[#202124]">Categories</h1>
          <p class="text-sm text-[#5F6368] mt-1">Manage the hierarchical question taxonomy</p>
        </div>
        <button id="cat-new-btn" (click)="showForm.set(!showForm())" class="btn btn-primary flex items-center gap-2">
          <lucide-icon name="plus" [size]="16" />
          New Category
        </button>
      </div>

      <!-- Inline Create Form -->
      @if (showForm()) {
        <div class="edudash-card animate-slide-down">
          <h3 class="text-sm font-semibold text-[#202124] mb-4">Add Category</h3>
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div class="sm:col-span-1">
              <label class="edudash-label" for="cat-name">Name *</label>
              <input id="cat-name" type="text" [(ngModel)]="newName" placeholder="e.g. System Design"
                class="edudash-input" />
            </div>
            <div>
              <label class="edudash-label" for="cat-slug">Slug</label>
              <input id="cat-slug" type="text" [(ngModel)]="newSlug" placeholder="auto-generated"
                class="edudash-input" />
            </div>
            <div>
              <label class="edudash-label" for="cat-parent">Parent (optional)</label>
              <select id="cat-parent" [(ngModel)]="newParentId" class="edudash-input">
                <option [ngValue]="null">— Root category —</option>
                @for (cat of flatList(); track cat.id) {
                  <option [ngValue]="cat.id">{{ cat.indent }}{{ cat.name }}</option>
                }
              </select>
            </div>
          </div>
          <div class="flex items-center gap-3 mt-4 pt-4 border-t border-[#E0E0E0]">
            <button id="cat-save-btn" (click)="create()" [disabled]="saving() || !newName.trim()"
              class="btn btn-primary disabled:opacity-50">
              @if (saving()) { <lucide-icon name="loader" [size]="14" class="animate-spin" /> }
              Add Category
            </button>
            <button (click)="cancelForm()" class="btn btn-ghost">Cancel</button>
          </div>
        </div>
      }

      <!-- Category Tree -->
      @if (loading()) {
        <div class="edudash-card p-0 overflow-hidden">
          <div class="space-y-0 divide-y divide-[#E0E0E0]">
            @for (i of [1,2,3,4,5,6]; track i) {
              <div class="flex items-center gap-3 px-6 py-4 animate-pulse">
                <div class="w-4 h-4 bg-slate-200 rounded"></div>
                <div class="h-4 bg-slate-200 rounded w-40"></div>
                <div class="h-3 bg-slate-100 rounded w-24 ml-auto"></div>
              </div>
            }
          </div>
        </div>
      } @else if (categories().length) {
        <div class="edudash-card p-0 overflow-hidden">
          <div class="divide-y divide-[#E0E0E0]">
            @for (cat of categories(); track cat.id) {
              <ng-container
                *ngTemplateOutlet="catRow; context: { $implicit: cat, depth: 0 }">
              </ng-container>
            }
          </div>
        </div>

        <ng-template #catRow let-cat let-depth="depth">
          <div
            class="flex items-center gap-3 px-6 py-3 hover:bg-[#F8F9FA] transition-colors group"
            [style.padding-left.px]="24 + depth * 20">
            <lucide-icon
              [name]="depth === 0 ? 'folder' : 'folder-open'"
              [size]="16"
              [class]="depth === 0 ? 'text-[#1A73E8] flex-shrink-0' : 'text-violet-500 flex-shrink-0'" />
            <span class="text-sm font-medium text-[#202124] flex-1">{{ cat.name }}</span>
            <span class="text-xs font-mono text-[#5F6368] bg-[#F8F9FA] border border-[#E0E0E0] px-2 py-0.5 rounded">{{ cat.slug }}</span>
            <span class="badge badge-neutral text-[10px]">{{ cat.questionCount }} Q</span>
            @if (cat.questionCount === 0) {
              <button
                id="cat-delete-{{ cat.id }}"
                (click)="remove(cat.id)"
                class="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-[#5F6368] hover:text-red-600 hover:bg-red-50 transition-all"
                title="Delete category">
                <lucide-icon name="trash-2" [size]="14" />
              </button>
            } @else {
              <div class="w-7"></div>
            }
          </div>
          @if (cat.subCategories?.length) {
            @for (sub of cat.subCategories; track sub.id) {
              <ng-container
                *ngTemplateOutlet="catRow; context: { $implicit: sub, depth: depth + 1 }">
              </ng-container>
            }
          }
        </ng-template>

      } @else {
        <div class="edudash-card py-16 text-center">
          <lucide-icon name="tag" [size]="40" class="text-[#E0E0E0] mx-auto mb-4" />
          <p class="text-sm text-[#5F6368]">No categories yet. Add one to get started.</p>
        </div>
      }
    </div>
  `,
})
export class AdminCategoriesComponent implements OnInit {
  private readonly api = inject(AdminApiService);

  readonly categories = signal<CategoryManageDto[]>([]);
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly showForm = signal(false);

  newName = '';
  newSlug = '';
  newParentId: number | null = null;

  readonly flatList = (): { id: number; name: string; indent: string }[] => {
    const result: { id: number; name: string; indent: string }[] = [];
    const flatten = (cats: CategoryManageDto[], depth: number) => {
      for (const c of cats) {
        result.push({ id: c.id, name: c.name, indent: '\u00a0\u00a0'.repeat(depth) });
        if (c.subCategories?.length) flatten(c.subCategories, depth + 1);
      }
    };
    flatten(this.categories(), 0);
    return result;
  };

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.api.getCategoryTree().subscribe({
      next: cats => { this.categories.set(cats); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  create(): void {
    if (!this.newName.trim() || this.saving()) return;
    this.saving.set(true);
    this.api.createCategory({
      name: this.newName.trim(),
      slug: this.newSlug.trim() || undefined,
      parentId: this.newParentId ?? undefined,
    }).subscribe({
      next: () => { this.saving.set(false); this.cancelForm(); this.load(); },
      error: () => this.saving.set(false),
    });
  }

  remove(id: number): void {
    if (!confirm('Delete this category?')) return;
    this.api.deleteCategory(id).subscribe(() => this.load());
  }

  cancelForm(): void {
    this.newName = '';
    this.newSlug = '';
    this.newParentId = null;
    this.showForm.set(false);
  }
}

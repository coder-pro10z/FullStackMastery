import { AsyncPipe, NgFor } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../core/services/admin.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [AsyncPipe, FormsModule, NgFor],
  template: `
    <section class="panel topbar">
      <div>
        <h1>Admin Import</h1>
        <p>Upload Excel content and route questions into the correct category.</p>
      </div>
    </section>

    <section class="panel auth-card" style="max-width: 100%;">
      <form class="form-grid" (ngSubmit)="submit()">
        <label class="field">
          <span>Default category</span>
          <select [(ngModel)]="defaultCategoryId" name="defaultCategoryId" required>
            <option [ngValue]="0" disabled>Select category</option>
            <option *ngFor="let category of categories$ | async" [ngValue]="category.id">
              {{ category.name }}
            </option>
          </select>
        </label>

        <label class="field">
          <span>Excel file</span>
          <input type="file" (change)="onFileSelected($event)" accept=".xlsx,.xls" required />
        </label>

        @if (message()) {
          <div>{{ message() }}</div>
        }

        <button class="button button-primary" type="submit">Import questions</button>
      </form>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminDashboardComponent {
  private readonly adminService = inject(AdminService);

  readonly categories$ = this.adminService.getCategoriesForDropdown();
  readonly message = signal('');

  defaultCategoryId = 0;
  private selectedFile: File | null = null;

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    this.selectedFile = input.files?.[0] ?? null;
  }

  submit() {
    if (!this.selectedFile || !this.defaultCategoryId) {
      this.message.set('Select a file and default category before importing.');
      return;
    }

    this.adminService.importQuestions({
      file: this.selectedFile,
      defaultCategoryId: this.defaultCategoryId
    }).subscribe({
      next: () => this.message.set('Import completed successfully.'),
      error: () => this.message.set('Import failed. Check the file format and API status.')
    });
  }
}

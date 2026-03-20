import { AsyncPipe, NgFor } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../core/services/admin.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [AsyncPipe, FormsModule, NgFor],
  template: `
    <div class="space-y-6 animate-fade-in">
      <!-- Page Header -->
      <section>
        <h1 class="text-xl font-bold text-white">Import Questions</h1>
        <p class="text-sm text-slate-500 mt-1">Upload Excel content and route questions into the correct category.</p>
      </section>

      <!-- Upload Form -->
      <section class="glass-panel p-6">
        <form class="space-y-5" (ngSubmit)="submit()">
          <!-- Category Dropdown -->
          <div>
            <label class="text-xs font-medium text-slate-400 mb-1.5 block">Default category</label>
            <select [(ngModel)]="defaultCategoryId" name="defaultCategoryId" required class="select-dark">
              <option [ngValue]="0" disabled>Select a category</option>
              <option *ngFor="let category of categories$ | async" [ngValue]="category.id">
                {{ category.name }}
              </option>
            </select>
          </div>

          <!-- Drag & Drop Zone -->
          <div>
            <label class="text-xs font-medium text-slate-400 mb-1.5 block">Excel file</label>
            <div
              class="relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer group transition-all duration-200"
              [class]="isDragging()
                ? 'border-accent-blue bg-accent-blue/5'
                : selectedFile
                  ? 'border-green-500/50 bg-green-500/5'
                  : 'border-dark-border-light hover:border-slate-500 hover:bg-dark-surface-light/30'"
              (dragover)="onDragOver($event)"
              (dragleave)="onDragLeave($event)"
              (drop)="onDrop($event)"
              (click)="fileInput.click()">

              <input
                #fileInput
                type="file"
                (change)="onFileSelected($event)"
                accept=".xlsx,.xls"
                class="hidden" />

              @if (selectedFile) {
                <!-- File selected state -->
                <div class="flex flex-col items-center gap-3">
                  <div class="w-12 h-12 rounded-2xl bg-green-500/10 flex items-center justify-center">
                    <svg class="w-6 h-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p class="text-sm font-medium text-white">{{ selectedFile.name }}</p>
                    <p class="text-xs text-slate-500 mt-0.5">{{ formatFileSize(selectedFile.size) }} — Click or drag to replace</p>
                  </div>
                </div>
              } @else {
                <!-- Empty state -->
                <div class="flex flex-col items-center gap-3">
                  <div class="w-12 h-12 rounded-2xl bg-dark-surface-hover flex items-center justify-center group-hover:bg-dark-surface-light transition-colors">
                    <svg class="w-6 h-6 text-slate-500 group-hover:text-slate-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  </div>
                  <div>
                    <p class="text-sm text-slate-300">
                      <span class="text-accent-blue font-medium">Click to upload</span> or drag and drop
                    </p>
                    <p class="text-xs text-slate-600 mt-1">.xlsx or .xls files only</p>
                  </div>
                </div>
              }
            </div>
          </div>

          <!-- Upload Progress -->
          @if (uploading()) {
            <div class="space-y-2">
              <div class="flex items-center justify-between">
                <span class="text-xs font-medium text-slate-400">Importing questions...</span>
                <span class="text-xs text-accent-blue">Processing</span>
              </div>
              <div class="progress-track">
                <div class="progress-fill bg-gradient-to-r from-accent-blue to-accent-purple animate-pulse-slow" style="width: 80%"></div>
              </div>
            </div>
          }

          <!-- Status Messages -->
          @if (message()) {
            <div
              class="flex items-center gap-2 px-4 py-3 rounded-xl text-sm"
              [class]="messageType() === 'success'
                ? 'bg-green-500/10 border border-green-500/20 text-green-400'
                : 'bg-red-500/10 border border-red-500/20 text-red-400'">
              @if (messageType() === 'success') {
                <svg class="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              } @else {
                <svg class="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              }
              <span>{{ message() }}</span>
            </div>
          }

          <!-- Submit -->
          <button
            class="btn-primary w-full py-3 text-sm"
            type="submit"
            [disabled]="uploading()">
            @if (uploading()) {
              <svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
              </svg>
              Importing...
            } @else {
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              Import Questions
            }
          </button>
        </form>
      </section>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminDashboardComponent {
  private readonly adminService = inject(AdminService);

  readonly categories$ = this.adminService.getCategoriesForDropdown();
  readonly message = signal('');
  readonly messageType = signal<'success' | 'error'>('success');
  readonly uploading = signal(false);
  readonly isDragging = signal(false);

  defaultCategoryId = 0;
  selectedFile: File | null = null;

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    this.selectedFile = input.files?.[0] ?? null;
    this.message.set('');
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(true);
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(false);
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(false);

    const file = event.dataTransfer?.files[0];
    if (file && (file.name.endsWith('.xlsx') || file.name.endsWith('.xls'))) {
      this.selectedFile = file;
      this.message.set('');
    } else {
      this.message.set('Invalid file type. Please upload an .xlsx or .xls file.');
      this.messageType.set('error');
    }
  }

  formatFileSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
  }

  submit() {
    if (!this.selectedFile || !this.defaultCategoryId) {
      this.message.set('Select a file and default category before importing.');
      this.messageType.set('error');
      return;
    }

    this.uploading.set(true);
    this.message.set('');

    this.adminService.importQuestions({
      file: this.selectedFile,
      defaultCategoryId: this.defaultCategoryId
    }).subscribe({
      next: () => {
        this.message.set('Import completed successfully! Questions are now available for candidates.');
        this.messageType.set('success');
        this.uploading.set(false);
        this.selectedFile = null;
      },
      error: () => {
        this.message.set('Import failed. Check the file format and API status.');
        this.messageType.set('error');
        this.uploading.set(false);
      }
    });
  }
}

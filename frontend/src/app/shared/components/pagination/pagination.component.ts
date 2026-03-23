import { NgClass, NgIf } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [NgIf, NgClass],
  template: `
    <div class="flex items-center justify-between px-4 py-3 sm:px-6">
      <div class="flex flex-1 justify-between sm:hidden">
        <button
          [disabled]="pageNumber <= 1"
          (click)="onPageChange(pageNumber - 1)"
          class="relative inline-flex items-center rounded-md border border-slate-700 bg-dark-surface px-4 py-2 text-sm font-medium text-slate-300 hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Previous
        </button>
        <button
          [disabled]="pageNumber >= totalPages"
          (click)="onPageChange(pageNumber + 1)"
          class="relative ml-3 inline-flex items-center rounded-md border border-slate-700 bg-dark-surface px-4 py-2 text-sm font-medium text-slate-300 hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Next
        </button>
      </div>
      <div class="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
        <div>
          <p class="text-sm text-slate-400">
            Showing
            <span class="font-medium text-slate-200">{{ Math.min((pageNumber - 1) * pageSize + 1, totalRecords) }}</span>
            to
            <span class="font-medium text-slate-200">{{ Math.min(pageNumber * pageSize, totalRecords) }}</span>
            of
            <span class="font-medium text-slate-200">{{ totalRecords }}</span>
            results
          </p>
        </div>
        <div>
          <nav class="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
            <button
              [disabled]="pageNumber <= 1"
              (click)="onPageChange(pageNumber - 1)"
              class="relative inline-flex items-center rounded-l-md px-2 py-2 text-slate-400 ring-1 ring-inset ring-slate-700 hover:bg-slate-800 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <span class="sr-only">Previous</span>
              <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fill-rule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clip-rule="evenodd" />
              </svg>
            </button>

            <!-- Quick jump text info -->
            <span class="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-slate-300 ring-1 ring-inset ring-slate-700 focus:z-20 focus:outline-offset-0">
              Page {{ pageNumber }} of {{ totalPages }}
            </span>

            <button
              [disabled]="pageNumber >= totalPages"
              (click)="onPageChange(pageNumber + 1)"
              class="relative inline-flex items-center rounded-r-md px-2 py-2 text-slate-400 ring-1 ring-inset ring-slate-700 hover:bg-slate-800 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <span class="sr-only">Next</span>
              <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fill-rule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clip-rule="evenodd" />
              </svg>
            </button>
          </nav>
        </div>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PaginationComponent {
  Math = Math;

  @Input() pageNumber = 1;
  @Input() pageSize = 10;
  @Input() totalRecords = 0;
  @Input() totalPages = 1;

  @Output() pageChanged = new EventEmitter<number>();

  onPageChange(newPage: number) {
    if (newPage >= 1 && newPage <= this.totalPages && newPage !== this.pageNumber) {
      this.pageChanged.emit(newPage);
    }
  }
}

import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [LucideAngularModule, NgClass],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between p-4 bg-white border rounded-xl border-[#E2E8F0]">
      <span class="text-sm text-[#5F6368]">{{ paginationSummary }}</span>
      
      <div class="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
        
        <!-- Page Size Options -->
        <div class="flex items-center gap-2">
            <span class="text-xs uppercase tracking-wider text-[#5F6368]">Per Page</span>
            @for (size of pageSizeOptions; track size) {
                <button type="button"
                    class="px-2.5 py-1 rounded-md text-xs border transition-colors"
                    [ngClass]="{
                        'bg-[#1A73E8]/10 text-[#1A73E8] border-[#1A73E8]/30 font-semibold': pageSize === size,
                        'text-[#5F6368] border-[#E0E0E0] hover:bg-slate-50': pageSize !== size
                    }"
                    (click)="onPageSizeChange(size)">
                    {{ size }}
                </button>
            }
        </div>

        <!-- Page Jump Input & Nav Buttons -->
        <div class="flex items-center gap-4">
            <div class="flex items-center gap-2 text-sm font-medium">
            <span class="text-slate-500">Page</span>
            <input type="number" 
                    class="w-14 h-8 text-center text-sm font-semibold border border-slate-200 rounded-md focus:ring-2 focus:ring-[#1A73E8]/30 focus:border-[#1A73E8] outline-none transition-all"
                    [value]="currentPage"
                    (keyup.enter)="onPageJump($event)"
                    min="1"
                    [max]="totalPages">
            <span class="text-slate-400">of {{ totalPages }}</span>
            </div>

            <div class="flex gap-2">
            <button class="p-1.5 border border-slate-200 rounded-lg text-slate-500 hover:bg-slate-50 hover:text-slate-800 disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
                    [disabled]="currentPage <= 1"
                    (click)="onPrev()">
                <lucide-icon name="chevron-left" [size]="18"></lucide-icon>
            </button>
            <button class="p-1.5 border border-slate-200 rounded-lg text-slate-500 hover:bg-slate-50 hover:text-slate-800 disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
                    [disabled]="currentPage >= totalPages"
                    (click)="onNext()">
                <lucide-icon name="chevron-right" [size]="18"></lucide-icon>
            </button>
            </div>
        </div>
      </div>
    </div>
  `
})
export class PaginationComponent {
  @Input({ required: true }) totalItems = 0;
  @Input({ required: true }) pageSize = 12;
  @Input({ required: true }) currentPage = 1;
  @Input({ required: true }) totalPages = 1;
  @Input() pageSizeOptions: number[] = [12, 24, 48];

  @Output() pageChange = new EventEmitter<number>();
  @Output() pageSizeChange = new EventEmitter<number>();

  get paginationSummary(): string {
    if (this.totalItems === 0) return '0 items';
    const start = (this.currentPage - 1) * this.pageSize + 1;
    const end = Math.min(start + this.pageSize - 1, this.totalItems);
    return `${start}-${end} of ${this.totalItems} items`;
  }

  onPageJump(event: Event) {
    const input = event.target as HTMLInputElement;
    let page = parseInt(input.value, 10);
    
    if (isNaN(page)) {
      input.value = this.currentPage.toString();
      return;
    }
    
    if (page < 1) page = 1;
    if (page > this.totalPages) page = this.totalPages;
    
    input.value = page.toString();
    
    if (page !== this.currentPage) {
      this.pageChange.emit(page);
    }
  }

  onPrev() {
    if (this.currentPage > 1) {
      this.pageChange.emit(this.currentPage - 1);
    }
  }

  onNext() {
    if (this.currentPage < this.totalPages) {
      this.pageChange.emit(this.currentPage + 1);
    }
  }

  onPageSizeChange(size: number) {
    if (size !== this.pageSize) {
      this.pageSizeChange.emit(size);
    }
  }
}

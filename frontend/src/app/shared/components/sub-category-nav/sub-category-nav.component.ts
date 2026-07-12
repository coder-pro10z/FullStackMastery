import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CategoryTreeDto } from '../../../core/models/category.models';

@Component({
  selector: 'app-sub-category-nav',
  standalone: true,
  imports: [NgFor, NgIf, RouterLink],
  template: `
    <section class="edudash-card p-3" *ngIf="rootCategory">
      <!-- Header -->
      <div class="flex items-center gap-2 mb-2.5">
        <svg class="w-3.5 h-3.5 text-[#5F6368]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
        </svg>
        <span class="text-xs font-semibold text-[#5F6368] uppercase tracking-wider">{{ rootCategory.name }}</span>
      </div>

      <!-- Scrollable pills -->
      <div class="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        <!-- All pill -->
        <a
          class="flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 whitespace-nowrap"
          [class]="selectedCategoryId === rootCategory.id
            ? 'bg-[#1A73E8]/10 text-[#1A73E8] border border-[#1A73E8]/30 font-semibold'
            : 'bg-slate-50 text-[#5F6368] border border-[#E0E0E0] hover:text-[#202124] hover:bg-slate-100'"
          [routerLink]="['/']"
          [queryParams]="{ categoryId: rootCategory.id }">
          All {{ rootCategory.name }}
        </a>

        <a
          *ngFor="let category of rootCategory.subCategories"
          class="flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 whitespace-nowrap"
          [class]="selectedCategoryId === category.id
            ? 'bg-[#1A73E8]/10 text-[#1A73E8] border border-[#1A73E8]/30 font-semibold'
            : 'bg-slate-50 text-[#5F6368] border border-[#E0E0E0] hover:text-[#202124] hover:bg-slate-100'"
          [routerLink]="['/']"
          [queryParams]="{ categoryId: category.id }">
          {{ category.name }}
        </a>
      </div>
    </section>
  `,
  styles: [`
    .scrollbar-hide::-webkit-scrollbar { display: none; }
    .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SubCategoryNavComponent {
  @Input() rootCategory: CategoryTreeDto | null = null;
  @Input() selectedCategoryId: number | null = null;
}

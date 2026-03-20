import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CategoryTreeDto } from '../../../core/models/category.models';

@Component({
  selector: 'app-sub-category-nav',
  standalone: true,
  imports: [NgFor, NgIf, RouterLink],
  template: `
    <section class="glass-panel p-3" *ngIf="rootCategory">
      <!-- Header -->
      <div class="flex items-center gap-2 mb-2.5">
        <svg class="w-3.5 h-3.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
        </svg>
        <span class="text-xs font-semibold text-slate-500 uppercase tracking-wider">{{ rootCategory.name }}</span>
      </div>

      <!-- Scrollable pills -->
      <div class="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        <!-- All pill -->
        <a
          class="flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 whitespace-nowrap"
          [class]="selectedCategoryId === rootCategory.id
            ? 'bg-accent-blue/15 text-accent-blue border border-accent-blue/30'
            : 'bg-dark-surface-light text-slate-400 border border-transparent hover:text-slate-200 hover:bg-dark-surface-hover'"
          [routerLink]="['/']"
          [queryParams]="{ categoryId: rootCategory.id }">
          All {{ rootCategory.name }}
        </a>

        <a
          *ngFor="let category of rootCategory.subCategories"
          class="flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 whitespace-nowrap"
          [class]="selectedCategoryId === category.id
            ? 'bg-accent-blue/15 text-accent-blue border border-accent-blue/30'
            : 'bg-dark-surface-light text-slate-400 border border-transparent hover:text-slate-200 hover:bg-dark-surface-hover'"
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

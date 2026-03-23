import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CategoryTreeDto } from '../../../core/models/category.models';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [NgFor, NgIf, RouterLink, RouterLinkActive],
  template: `
    <nav class="px-2">
      <!-- "All" link -->
      <a
        class="group flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-150 mb-1"
        [class]="selectedCategoryId === null
          ? 'bg-accent-blue/10 text-accent-blue border-l-2 border-accent-blue'
          : 'text-slate-400 hover:text-slate-200 hover:bg-dark-surface-hover border-l-2 border-transparent'"
        [routerLink]="['/']">
        <svg class="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
        @if (!collapsed) {
          <span class="truncate animate-fade-in">All Questions</span>
        }
      </a>
      
      <!-- Quiz link -->
      <a
        class="group flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-150 mb-1"
        [routerLink]="['/quiz/new']"
        routerLinkActive="bg-accent-blue/10 text-accent-blue border-l-2 border-accent-blue"
        [routerLinkActiveOptions]="{exact: false}"
        [class.text-slate-400]="true"
        [class.border-transparent]="true"
        [class.hover:text-slate-200]="true"
        [class.hover:bg-dark-surface-hover]="true">
        <svg class="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
        @if (!collapsed) {
          <span class="truncate animate-fade-in">Practice Quiz</span>
        }
      </a>

      <!-- Section Label -->
      @if (!collapsed) {
        <div class="px-3 mt-4 mb-2 animate-fade-in">
          <span class="text-[10px] font-semibold uppercase tracking-wider text-slate-600">Tracks</span>
        </div>
      }

      <!-- Category Tree -->
      <div class="space-y-0.5">
        <ng-container *ngFor="let category of categories">
          <a
            class="group flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-all duration-150"
            [class]="isCategoryActive(category)
              ? 'bg-accent-blue/10 text-accent-blue font-semibold border-l-2 border-accent-blue'
              : 'text-slate-400 hover:text-slate-200 hover:bg-dark-surface-hover font-medium border-l-2 border-transparent'"
            [routerLink]="['/']"
            [queryParams]="{ categoryId: category.id }"
            [title]="category.name">

            <!-- Category icon -->
            <div class="w-4 h-4 flex-shrink-0 flex items-center justify-center">
              <div
                class="w-2 h-2 rounded-full transition-colors duration-150"
                [class]="isCategoryActive(category) ? 'bg-accent-blue' : 'bg-slate-600 group-hover:bg-slate-400'">
              </div>
            </div>

            @if (!collapsed) {
              <span class="truncate animate-fade-in">{{ category.name }}</span>

              <!-- Subcategory count -->
              <span
                *ngIf="category.subCategories?.length"
                class="ml-auto text-[10px] font-medium px-1.5 py-0.5 rounded-md bg-dark-surface-hover text-slate-500 animate-fade-in">
                {{ category.subCategories.length }}
              </span>
            }
          </a>
        </ng-container>
      </div>
    </nav>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SidebarComponent {
  @Input({ required: true }) categories: CategoryTreeDto[] = [];
  @Input() selectedCategoryId: number | null = null;
  @Input() collapsed = false;

  isCategoryActive(category: CategoryTreeDto): boolean {
    return category.id === this.selectedCategoryId ||
      this.containsCategory(category.subCategories, this.selectedCategoryId);
  }

  private containsCategory(categories: CategoryTreeDto[], targetId: number | null): boolean {
    if (targetId === null) return false;
    return categories.some((category) =>
      category.id === targetId || this.containsCategory(category.subCategories, targetId));
  }
}

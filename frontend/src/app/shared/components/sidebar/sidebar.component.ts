import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { NgFor } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CategoryTreeDto } from '../../../core/models/category.models';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [NgFor, RouterLink],
  template: `
    <aside class="panel sidebar">
      <h2 class="sidebar-heading">Tracks</h2>

      <nav class="sidebar-list">
        <a
          class="sidebar-link"
          [class.sidebar-link-active]="selectedCategoryId === null"
          [routerLink]="['/']">
          All
        </a>

        <a
          *ngFor="let category of categories"
          class="sidebar-link"
          [class.sidebar-link-active]="isCategoryActive(category)"
          [routerLink]="['/']"
          [queryParams]="{ categoryId: category.id }">
          {{ category.name }}
        </a>
      </nav>
    </aside>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SidebarComponent {
  @Input({ required: true }) categories: CategoryTreeDto[] = [];
  @Input() selectedCategoryId: number | null = null;

  isCategoryActive(category: CategoryTreeDto): boolean {
    return category.id === this.selectedCategoryId ||
      this.containsCategory(category.subCategories, this.selectedCategoryId);
  }

  private containsCategory(categories: CategoryTreeDto[], targetId: number | null): boolean {
    if (targetId === null) {
      return false;
    }

    return categories.some((category) =>
      category.id === targetId || this.containsCategory(category.subCategories, targetId));
  }
}

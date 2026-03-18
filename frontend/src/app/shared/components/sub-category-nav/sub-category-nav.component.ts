import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CategoryTreeDto } from '../../../core/models/category.models';

@Component({
  selector: 'app-sub-category-nav',
  standalone: true,
  imports: [NgFor, NgIf, RouterLink],
  template: `
    <section class="panel subnav-panel" *ngIf="rootCategory">
      <div class="subnav-header">
        <span class="muted">{{ rootCategory.name }}</span>
      </div>

      <div class="subnav-scroll">
        <a
          class="subnav-pill"
          [class.subnav-pill-active]="selectedCategoryId === rootCategory.id"
          [routerLink]="['/']"
          [queryParams]="{ categoryId: rootCategory.id }">
          All {{ rootCategory.name }}
        </a>

        <a
          *ngFor="let category of rootCategory.subCategories"
          class="subnav-pill"
          [class.subnav-pill-active]="selectedCategoryId === category.id"
          [routerLink]="['/']"
          [queryParams]="{ categoryId: category.id }">
          {{ category.name }}
        </a>
      </div>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SubCategoryNavComponent {
  @Input() rootCategory: CategoryTreeDto | null = null;
  @Input() selectedCategoryId: number | null = null;
}

import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { AsyncPipe, NgFor, NgIf, NgTemplateOutlet } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink, RouterOutlet } from '@angular/router';
import { map } from 'rxjs';
import { CategoryTreeDto } from '../../core/models/category.models';
import { CategoryService } from '../../core/services/category.service';

@Component({
  selector: 'app-app-layout',
  standalone: true,
  imports: [AsyncPipe, NgFor, NgIf, NgTemplateOutlet, RouterLink, RouterOutlet],
  template: `
    <div class="shell">
      <div class="layout-grid">
        <aside class="panel sidebar">
          <h2>Categories</h2>

          <ul class="sidebar-list">
            <li>
              <a
                class="sidebar-link"
                [class.sidebar-link-active]="selectedCategoryId() === null"
                [routerLink]="['/']">
                All Questions
              </a>
            </li>
          </ul>

          <ng-container *ngIf="categories$ | async as categories">
            <ng-container
              *ngTemplateOutlet="categoryTree; context: { $implicit: categories, depth: 0 }" />
          </ng-container>
        </aside>

        <main class="content">
          <router-outlet />
        </main>
      </div>
    </div>

    <ng-template #categoryTree let-categories let-depth="depth">
      <ul class="sidebar-list" [style.padding-left.px]="depth * 16">
        <li *ngFor="let category of categories">
          <a
            class="sidebar-link"
            [class.sidebar-link-active]="selectedCategoryId() === category.id"
            [routerLink]="['/']"
            [queryParams]="{ categoryId: category.id }">
            {{ category.name }}
          </a>

          <ng-container *ngIf="category.subCategories.length > 0">
            <ng-container
              *ngTemplateOutlet="categoryTree; context: { $implicit: category.subCategories, depth: depth + 1 }" />
          </ng-container>
        </li>
      </ul>
    </ng-template>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppLayoutComponent {
  private readonly categoryService = inject(CategoryService);
  private readonly route = inject(ActivatedRoute);

  readonly categories$ = this.categoryService.getTree().pipe(
    map((categories) => categories ?? [])
  );

  readonly selectedCategoryId = toSignal(
    this.route.queryParamMap.pipe(
      map((queryParams) => {
        const rawCategoryId = queryParams.get('categoryId');

        if (!rawCategoryId) {
          return null;
        }

        const categoryId = Number(rawCategoryId);
        return Number.isNaN(categoryId) ? null : categoryId;
      })
    ),
    { initialValue: null }
  );
}

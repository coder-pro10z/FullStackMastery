import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterOutlet } from '@angular/router';
import { map } from 'rxjs';
import { CategoryService } from '../../core/services/category.service';
import { SidebarComponent } from '../../shared/components/sidebar/sidebar.component';

@Component({
  selector: 'app-app-layout',
  standalone: true,
  imports: [AsyncPipe, RouterOutlet, SidebarComponent],
  template: `
    <div class="shell">
      <div class="layout-grid">
        <app-sidebar
          [categories]="(categories$ | async) ?? []"
          [selectedCategoryId]="selectedCategoryId()" />

        <main class="content">
          <router-outlet />
        </main>
      </div>
    </div>
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

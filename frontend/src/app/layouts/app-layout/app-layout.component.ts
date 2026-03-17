import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { AsyncPipe, NgFor } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { map } from 'rxjs';
import { CategoryService } from '../../core/services/category.service';

@Component({
  selector: 'app-app-layout',
  standalone: true,
  imports: [AsyncPipe, NgFor, RouterOutlet],
  template: `
    <div class="shell">
      <div class="layout-grid">
        <aside class="panel sidebar">
          <h2>Categories</h2>
          <ul>
            <li *ngFor="let category of categories$ | async">{{ category.name }}</li>
          </ul>
        </aside>

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

  readonly categories$ = this.categoryService.getTree().pipe(
    map((categories) => categories ?? [])
  );
}

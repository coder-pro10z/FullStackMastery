import { AsyncPipe, NgIf } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject, combineLatest, map } from 'rxjs';
import { CategoryTreeDto } from '../../core/models/category.models';
import { ProgressSummaryDto } from '../../core/models/progress.models';
import { CategoryService } from '../../core/services/category.service';
import { ProgressService } from '../../core/services/progress.service';
import { ProgressCardComponent } from '../../shared/components/progress-card/progress-card.component';
import { SubCategoryNavComponent } from '../../shared/components/sub-category-nav/sub-category-nav.component';

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [AsyncPipe, NgIf, ProgressCardComponent, SubCategoryNavComponent],
  template: `
    <div class="space-y-5 animate-fade-in" *ngIf="vm$ | async as vm">
      <!-- Page Header -->
      <section class="flex items-center justify-between">
        <div>
          <h1 class="text-xl font-bold text-[#202124]">
            @if (vm.selectedCategoryName) {
              {{ vm.selectedCategoryName }}
            } @else {
              Dashboard
            }
          </h1>
          <p class="text-sm text-[#5F6368] mt-1">
            @if (vm.selectedCategoryName) {
              Viewing <span class="font-medium text-[#202124]">{{ vm.selectedCategoryName }}</span> questions
            } @else {
              Track progress, review questions, and master your next interview.
            }
          </p>
        </div>
      </section>

      <!-- Progress Cards -->
      @if (vm.summary) {
        <section class="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <app-progress-card
            label="Overall"
            [solved]="vm.summary.totalSolved"
            [total]="vm.summary.totalQuestions"
            variant="default" />
          <app-progress-card
            label="Easy"
            [solved]="vm.summary.easySolved"
            [total]="vm.summary.easyTotal"
            variant="easy" />
          <app-progress-card
            label="Medium"
            [solved]="vm.summary.mediumSolved"
            [total]="vm.summary.mediumTotal"
            variant="medium" />
          <app-progress-card
            label="Hard"
            [solved]="vm.summary.hardSolved"
            [total]="vm.summary.hardTotal"
            variant="hard" />
        </section>
      } @else {
        <!-- Skeleton loading for progress cards -->
        <section class="grid grid-cols-2 lg:grid-cols-4 gap-4">
          @for (i of [1,2,3,4]; track i) {
            <div class="edudash-card p-4 animate-pulse">
              <div class="h-3 w-16 bg-slate-200 rounded mb-3"></div>
              <div class="h-7 w-20 bg-slate-200 rounded mb-3"></div>
              <div class="h-1.5 w-full bg-slate-200 rounded"></div>
            </div>
          }
        </section>
      }

      <!-- Sub-Category Navigation -->
      <app-sub-category-nav
        [rootCategory]="vm.selectedRootCategory"
        [selectedCategoryId]="vm.selectedCategoryId" />
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardPageComponent {
  private readonly destroyRef = inject(DestroyRef);
  private readonly route = inject(ActivatedRoute);
  private readonly categoryService = inject(CategoryService);
  private readonly progressService = inject(ProgressService);

  private readonly summary$ = new BehaviorSubject<ProgressSummaryDto | null>(null);
  private readonly categories$ = new BehaviorSubject<CategoryTreeDto[]>([]);

  private readonly selectedCategoryId$ = this.route.queryParamMap.pipe(
    map((queryParams) => {
      const rawCategoryId = queryParams.get('categoryId');
      if (!rawCategoryId) return null;
      const categoryId = Number(rawCategoryId);
      return Number.isNaN(categoryId) ? null : categoryId;
    })
  );

  readonly vm$ = combineLatest([
    this.summary$,
    this.categories$,
    this.selectedCategoryId$
  ]).pipe(
    map(([summary, categories, selectedCategoryId]) => {
      const selectedRootCategory = this.findRootCategory(categories, selectedCategoryId);
      const selectedCategory = this.findCategory(categories, selectedCategoryId);

      return {
        summary,
        selectedCategoryId,
        selectedCategoryName: selectedCategory?.name ?? null,
        selectedRootCategory
      };
    })
  );

  constructor() {
    this.progressService.getSummary()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((summary) => this.summary$.next(summary));

    this.categoryService.getTree()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((categories) => this.categories$.next(categories));
  }

  private findRootCategory(categories: CategoryTreeDto[], selectedCategoryId: number | null): CategoryTreeDto | null {
    if (selectedCategoryId === null) return null;
    return categories.find((category) =>
      category.id === selectedCategoryId || this.findCategory(category.subCategories, selectedCategoryId)) ?? null;
  }

  private findCategory(categories: CategoryTreeDto[], targetId: number | null): CategoryTreeDto | null {
    if (targetId === null) return null;
    for (const category of categories) {
      if (category.id === targetId) return category;
      const match = this.findCategory(category.subCategories, targetId);
      if (match) return match;
    }
    return null;
  }
}

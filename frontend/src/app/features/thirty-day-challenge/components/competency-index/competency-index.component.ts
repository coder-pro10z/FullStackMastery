import { ChangeDetectionStrategy, Component, Input, inject } from '@angular/core';
import { CATEGORY_COLORS, CATEGORY_LABELS, CompetencyCategory, CompetencyModel } from '../../../../core/models/challenge.models';
import { CompetencyBadgeComponent } from '../competency-badge/competency-badge.component';
import { LucideAngularModule } from 'lucide-angular';
import { AnswerSheetService } from '../../../../core/services/answer-sheet.service';

interface GroupedCategory {
  key: CompetencyCategory;
  label: string;
  competencies: CompetencyModel[];
}

@Component({
  selector: 'app-competency-index',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CompetencyBadgeComponent, LucideAngularModule],
  template: `
    <div class="space-y-8">

      <!-- Legend -->
      <div class="flex flex-wrap gap-3">
        @for (cat of categoryOrder; track cat) {
          <div class="flex items-center gap-2">
            <span class="w-2.5 h-2.5 rounded-full flex-shrink-0" [class]="getCategoryColors(cat).dot"></span>
            <span class="text-xs font-medium text-slate-600">{{ CATEGORY_LABELS[cat] }}</span>
          </div>
        }
      </div>

      <!-- Category groups -->
      @for (group of groupedCompetencies; track group.key) {
        <div class="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">

          <!-- Category header -->
          <div class="px-5 py-3.5 border-b border-slate-100 flex items-center gap-3"
               [class]="getCategoryColors(group.key).bg">
            <div class="w-2 h-8 rounded-full" [class]="getCategoryColors(group.key).dot"></div>
            <div>
              <h3 class="text-sm font-bold" [class]="getCategoryColors(group.key).text">
                {{ group.label }}
              </h3>
              <p class="text-xs text-slate-400">{{ group.competencies.length }} competencies</p>
            </div>
            <div class="ml-auto">
              <span class="text-xs font-semibold px-2.5 py-1 rounded-full border"
                    [class]="getCategoryColors(group.key).bg + ' ' + getCategoryColors(group.key).text + ' ' + getCategoryColors(group.key).border">
                {{ group.key === 'SqlCoding' ? 'SC' : group.key.substring(0,2).toUpperCase() }}01-{{ group.key === 'SqlCoding' ? 'SC' : group.key.substring(0,2).toUpperCase() }}15
              </span>
            </div>
          </div>

          <!-- Competency rows -->
          <div class="divide-y divide-slate-50">
            @for (comp of group.competencies; track comp.id) {
              <div class="flex items-center gap-3 px-5 py-3 hover:bg-slate-50 transition-colors duration-150 group">
                <app-competency-badge [competency]="comp" />
                <p class="text-sm text-slate-700 group-hover:text-slate-900 transition-colors flex-1">
                  {{ comp.title }}
                </p>
                <button
                  type="button"
                  (click)="sheetService.openSheet(comp.competencyId)"
                  class="opacity-0 group-hover:opacity-100 transition-opacity px-2 py-1 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-600 text-xs font-medium flex items-center gap-1"
                  [title]="'View Answer Sheet for ' + comp.title"
                >
                  <lucide-icon name="file-text" [size]="13" />
                  <span>Sheet</span>
                </button>
                <span class="text-xs text-slate-300 font-mono flex-shrink-0">#{{ comp.sortOrder }}</span>
              </div>
            }
          </div>

        </div>
      }

      <!-- Footer count -->
      <div class="text-center py-4 border-t border-slate-100">
        <p class="text-sm text-slate-400">
          <span class="font-bold text-slate-700">{{ competencies.length }}</span> permanent competency IDs · Never changes
        </p>
      </div>

    </div>
  `,
})
export class CompetencyIndexComponent {
  @Input({ required: true }) competencies: CompetencyModel[] = [];
  sheetService = inject(AnswerSheetService);

  readonly CATEGORY_LABELS = CATEGORY_LABELS;
  readonly categoryOrder: CompetencyCategory[] = ['CSharpCore', 'AspNetCore', 'SqlTheory', 'SqlCoding', 'Angular'];

  get groupedCompetencies(): GroupedCategory[] {
    return this.categoryOrder.map(key => ({
      key,
      label: CATEGORY_LABELS[key],
      competencies: this.competencies.filter(c => c.category === key),
    })).filter(g => g.competencies.length > 0);
  }

  getCategoryColors(cat: CompetencyCategory) {
    return CATEGORY_COLORS[cat] ?? CATEGORY_COLORS['CSharpCore'];
  }
}

import { NgFor } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Difficulty, QuestionQueryParams } from '../../../core/models/question.models';

@Component({
  selector: 'app-filter-bar',
  standalone: true,
  imports: [NgFor, FormsModule],
  template: `
    <section class="glass-panel p-3">
      <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <!-- Search -->
        <div class="relative flex-1">
          <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            [(ngModel)]="searchTerm"
            name="searchTerm"
            placeholder="Search questions or answers..."
            class="input-dark pl-10 text-sm"
            (keyup.enter)="apply()" />
        </div>

        <!-- Difficulty -->
        <select [(ngModel)]="difficulty" name="difficulty" class="select-dark w-full sm:w-36 text-sm">
          <option value="">All Levels</option>
          <option value="Easy">Easy</option>
          <option value="Medium">Medium</option>
          <option value="Hard">Hard</option>
        </select>

        <!-- Role -->
        <select [(ngModel)]="role" name="role" class="select-dark w-full sm:w-36 text-sm">
          <option value="">All Roles</option>
          <option *ngFor="let roleOption of roles" [value]="roleOption">{{ roleOption }}</option>
        </select>

        <!-- Actions -->
        <div class="flex items-center gap-2">
          <button class="btn-primary text-xs py-2 px-4 whitespace-nowrap" type="button" (click)="apply()">
            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            Filter
          </button>
          <button class="btn-ghost text-xs py-2 whitespace-nowrap" type="button" (click)="reset()">
            Reset
          </button>
        </div>
      </div>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FilterBarComponent {
  @Input() roles: string[] = [];
  @Input() searchTerm = '';
  @Input() difficulty: Difficulty | '' = '';
  @Input() role = '';
  @Output() filtersChanged = new EventEmitter<QuestionQueryParams>();

  apply() {
    this.filtersChanged.emit({
      ...(this.searchTerm ? { searchTerm: this.searchTerm.trim() } : {}),
      ...(this.difficulty ? { difficulty: this.difficulty } : {}),
      ...(this.role ? { role: this.role } : {})
    });
  }

  reset() {
    this.searchTerm = '';
    this.difficulty = '';
    this.role = '';
    this.filtersChanged.emit({});
  }
}

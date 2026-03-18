import { NgFor } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Difficulty, QuestionQueryParams } from '../../../core/models/question.models';

@Component({
  selector: 'app-filter-bar',
  standalone: true,
  imports: [NgFor, FormsModule],
  template: `
    <section class="panel filter-panel">
      <div class="filter-grid">
        <label class="field">
          <span>Search</span>
          <input
            [(ngModel)]="searchTerm"
            name="searchTerm"
            type="text"
            placeholder="Search question or answer" />
        </label>

        <label class="field">
          <span>Difficulty</span>
          <select [(ngModel)]="difficulty" name="difficulty">
            <option value="">All</option>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>
        </label>

        <label class="field">
          <span>Role</span>
          <select [(ngModel)]="role" name="role">
            <option value="">All</option>
            <option *ngFor="let roleOption of roles" [value]="roleOption">{{ roleOption }}</option>
          </select>
        </label>

        <div class="filter-actions">
          <button class="button button-primary" type="button" (click)="apply()">Apply</button>
          <button class="button button-secondary" type="button" (click)="reset()">Reset</button>
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

import { NgFor } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, OnChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Difficulty, QuestionQueryParams } from '../../../core/models/question.models';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-filter-bar',
  standalone: true,
  imports: [NgFor, FormsModule, LucideAngularModule],
  template: `
    <section class="flex flex-col gap-3 w-full">
      <!-- Command Bar -->
      <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 bg-white/90 backdrop-blur-xl rounded-2xl p-2 border border-slate-200/50 shadow-sm transition-all focus-within:border-[#1A73E8]/50 focus-within:shadow-md focus-within:ring-4 focus-within:ring-[#1A73E8]/10">
        
        <!-- Command Search -->
        <div class="relative flex-1 flex items-center">
          <div class="absolute left-3 top-1/2 -translate-y-1/2 flex items-center justify-center text-slate-400">
            <lucide-icon name="search" [size]="18"></lucide-icon>
          </div>
          <input
            type="text"
            [(ngModel)]="searchTerm"
            name="searchTerm"
            placeholder="Search questions or answers (Press Enter)..."
            class="w-full pl-10 pr-4 py-2 bg-transparent border-none outline-none text-[15px] text-[#202124] placeholder:text-slate-400"
            (keyup.enter)="apply()" />
        </div>

        <div class="hidden sm:block w-px h-6 bg-slate-200 mx-1"></div>

        <!-- Filters Group -->
        <div class="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 scrollbar-hide">
          <select [(ngModel)]="difficulty" name="difficulty" class="bg-transparent border border-slate-200 rounded-xl px-3 py-1.5 text-sm font-medium text-[#5F6368] hover:bg-slate-50 transition-colors focus:outline-none focus:ring-2 focus:ring-[#1A73E8]/20 cursor-pointer">
            <option value="">Difficulty</option>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>

          <select [(ngModel)]="role" name="role" class="bg-transparent border border-slate-200 rounded-xl px-3 py-1.5 text-sm font-medium text-[#5F6368] hover:bg-slate-50 transition-colors focus:outline-none focus:ring-2 focus:ring-[#1A73E8]/20 cursor-pointer max-w-[120px]">
            <option value="">Role</option>
            <option *ngFor="let roleOption of roles" [value]="roleOption">{{ roleOption }}</option>
          </select>
          
          <button class="flex items-center gap-1.5 bg-transparent border border-[#1A73E8]/30 text-[#1A73E8] hover:bg-[#1A73E8] hover:text-white rounded-xl px-4 py-1.5 text-sm font-semibold transition-all duration-300 ml-1" type="button" (click)="apply()">
            <lucide-icon name="filter" [size]="14"></lucide-icon>
            Apply
          </button>
        </div>
      </div>

      <!-- Active Filter Tags -->
      @if (appliedSearch || appliedDifficulty || appliedRole) {
        <div class="flex flex-wrap items-center gap-2 px-2 animate-fade-in">
          <span class="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">Active:</span>
          
          @if (appliedSearch) {
            <span class="inline-flex items-center gap-1 bg-white text-slate-700 px-2.5 py-1 rounded-lg text-xs font-medium border border-slate-200 shadow-sm">
              Search: {{ appliedSearch }}
              <button (click)="removeFilter('search')" class="text-slate-400 hover:text-red-500 transition-colors"><lucide-icon name="x" [size]="12"></lucide-icon></button>
            </span>
          }

          @if (appliedDifficulty) {
            <span class="inline-flex items-center gap-1 bg-white text-slate-700 px-2.5 py-1 rounded-lg text-xs font-medium border border-slate-200 shadow-sm">
              Diff: {{ appliedDifficulty }}
              <button (click)="removeFilter('difficulty')" class="text-slate-400 hover:text-red-500 transition-colors"><lucide-icon name="x" [size]="12"></lucide-icon></button>
            </span>
          }

          @if (appliedRole) {
            <span class="inline-flex items-center gap-1 bg-white text-slate-700 px-2.5 py-1 rounded-lg text-xs font-medium border border-slate-200 shadow-sm">
              Role: {{ appliedRole }}
              <button (click)="removeFilter('role')" class="text-slate-400 hover:text-red-500 transition-colors"><lucide-icon name="x" [size]="12"></lucide-icon></button>
            </span>
          }

          <button class="text-xs text-[#1A73E8] hover:underline font-medium ml-2" (click)="reset()">Clear all</button>
        </div>
      }
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FilterBarComponent implements OnChanges {
  @Input() roles: string[] = [];
  @Input() searchTerm = '';
  @Input() difficulty: Difficulty | '' = '';
  @Input() role = '';
  @Output() filtersChanged = new EventEmitter<QuestionQueryParams>();

  appliedSearch = '';
  appliedDifficulty: Difficulty | '' = '';
  appliedRole = '';

  ngOnChanges() {
    this.appliedSearch = this.searchTerm;
    this.appliedDifficulty = this.difficulty;
    this.appliedRole = this.role;
  }

  apply() {
    this.appliedSearch = this.searchTerm.trim();
    this.appliedDifficulty = this.difficulty;
    this.appliedRole = this.role;
    
    this.filtersChanged.emit({
      ...(this.appliedSearch ? { searchTerm: this.appliedSearch } : {}),
      ...(this.appliedDifficulty ? { difficulty: this.appliedDifficulty } : {}),
      ...(this.appliedRole ? { role: this.appliedRole } : {})
    });
  }

  removeFilter(type: 'search' | 'difficulty' | 'role') {
    if (type === 'search') { this.searchTerm = ''; this.appliedSearch = ''; }
    if (type === 'difficulty') { this.difficulty = ''; this.appliedDifficulty = ''; }
    if (type === 'role') { this.role = ''; this.appliedRole = ''; }
    this.apply();
  }

  reset() {
    this.searchTerm = '';
    this.difficulty = '';
    this.role = '';
    this.appliedSearch = '';
    this.appliedDifficulty = '';
    this.appliedRole = '';
    this.filtersChanged.emit({});
  }
}

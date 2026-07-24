import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';
import { IndexNode } from '../../../../core/models/knowledge-index.models';
import { Difficulty } from '../../../../core/models/question.models';

const DIFFICULTY_STYLES: Record<Difficulty, string> = {
  Easy:   'bg-emerald-50 text-emerald-700 border-emerald-200',
  Medium: 'bg-amber-50 text-amber-700 border-amber-200',
  Hard:   'bg-rose-50 text-rose-700 border-rose-200',
};

@Component({
  selector: 'app-tree-node',
  standalone: true,
  imports: [LucideAngularModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [`:host { display: block; }`],
  template: `
    <div>
      <!-- Node Row -->
      <div
        class="flex items-center gap-1.5 py-1.5 px-2 rounded-lg cursor-pointer group transition-all duration-100
               hover:bg-slate-50"
        [class.bg-blue-50]="selectedId() === node().id"
        [class.text-blue-700]="selectedId() === node().id"
        [style.padding-left.px]="(depth() * 18) + 8"
        (click)="onRowClick()"
        [attr.role]="node().children.length > 0 ? 'button' : 'option'"
        [attr.aria-expanded]="node().children.length > 0 ? isExpanded() : null"
        [attr.aria-selected]="selectedId() === node().id"
        [attr.aria-level]="depth() + 1"
      >
        <!-- Expand/Collapse Toggle -->
        @if (node().children.length > 0) {
          <lucide-icon
            [name]="isExpanded() ? 'chevron-down' : 'chevron-right'"
            [size]="13"
            class="flex-shrink-0 text-slate-400 group-hover:text-slate-600 transition-transform duration-150"
          />
        } @else {
          <!-- Leaf spacer -->
          <span class="w-[13px] flex-shrink-0"></span>
        }

        <!-- Node Icon -->
        @if (node().type === 'question') {
          <div class="w-2 h-2 rounded-full flex-shrink-0 mt-px"
               [class.bg-emerald-500]="node().isSolved"
               [class.bg-slate-300]="!node().isSolved">
          </div>
        } @else {
          <lucide-icon
            [name]="node().children.length > 0 ? (isExpanded() ? 'folder-open' : 'folder') : 'file-text'"
            [size]="14"
            class="flex-shrink-0 text-slate-400"
            [class.text-blue-500]="selectedId() === node().id"
          />
        }

        <!-- Label -->
        <span
          class="flex-1 min-w-0 truncate text-sm text-[#202124] group-hover:text-[#202124]"
          [class.font-medium]="node().type !== 'question'"
          [class.font-normal]="node().type === 'question'"
          [class.text-blue-700]="selectedId() === node().id"
        >{{ node().label }}</span>

        <!-- Question Count Badge -->
        @if (node().type !== 'question' && node().questionCount > 0) {
          <span class="text-[10px] text-slate-400 flex-shrink-0">{{ node().questionCount }}</span>
        }

        <!-- Difficulty Badge (questions only) -->
        @if (node().type === 'question' && node().difficulty) {
          <span class="text-[10px] px-1.5 py-0.5 rounded-full border font-medium flex-shrink-0"
                [class]="difficultyStyle(node().difficulty!)">
            {{ node().difficulty }}
          </span>
        }

        <!-- Solved check -->
        @if (node().type === 'question' && node().isSolved) {
          <lucide-icon name="check-circle-2" [size]="13" class="text-emerald-500 flex-shrink-0" />
        }
      </div>

      <!-- Children (recursive) -->
      @if (isExpanded() && node().children.length > 0 && depth() < 9) {
        <div class="animate-fade-in">
          @for (child of node().children; track child.id) {
            <app-tree-node
              [node]="child"
              [depth]="depth() + 1"
              [isExpanded]="expandedIds().has(child.id)"
              [expandedIds]="expandedIds()"
              [selectedId]="selectedId()"
              (selected)="selected.emit($event)"
              (toggled)="toggled.emit($event)"
            />
          }
        </div>
      }
    </div>
  `
})
export class TreeNodeComponent {
  readonly node = input.required<IndexNode>();
  readonly depth = input<number>(0);
  readonly isExpanded = input<boolean>(false);
  readonly expandedIds = input<Set<string>>(new Set());
  readonly selectedId = input<string | null>(null);

  readonly selected = output<IndexNode>();
  readonly toggled = output<string>();

  onRowClick(): void {
    if (this.node().children.length > 0) {
      this.toggled.emit(this.node().id);
    } else {
      this.selected.emit(this.node());
    }
  }

  difficultyStyle(diff: Difficulty): string {
    return DIFFICULTY_STYLES[diff] ?? '';
  }
}

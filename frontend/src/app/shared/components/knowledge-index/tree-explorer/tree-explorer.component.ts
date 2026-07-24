import { ChangeDetectionStrategy, Component, input, output, signal, computed } from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';
import { IndexNode } from '../../../../core/models/knowledge-index.models';
import { TreeNodeComponent } from '../tree-node/tree-node.component';

@Component({
  selector: 'app-tree-explorer',
  standalone: true,
  imports: [LucideAngularModule, TreeNodeComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [`:host { display: block; }`],
  template: `
    @if (roots().length === 0) {
      <div class="flex flex-col items-center justify-center py-12 text-center">
        <lucide-icon name="search-x" [size]="40" class="text-slate-300 mb-3" />
        <p class="text-sm font-medium text-slate-500">No topics found</p>
        <p class="text-xs text-slate-400 mt-1">Try a different search term</p>
      </div>
    } @else {
      <div
        role="tree"
        aria-label="Knowledge Index Tree"
        class="space-y-0.5"
      >
        @for (root of roots(); track root.id) {
          <app-tree-node
            [node]="root"
            [depth]="0"
            [isExpanded]="expandedIds().has(root.id)"
            [expandedIds]="expandedIds()"
            [selectedId]="selectedId()"
            (selected)="nodeSelected.emit($event)"
            (toggled)="onToggle($event)"
          />
        }
      </div>
    }
  `
})
export class TreeExplorerComponent {
  readonly roots = input<IndexNode[]>([]);
  readonly expandedIds = input<Set<string>>(new Set());
  readonly selectedId = input<string | null>(null);

  readonly nodeSelected = output<IndexNode>();
  readonly nodeToggled = output<string>();

  onToggle(id: string): void {
    this.nodeToggled.emit(id);
  }
}

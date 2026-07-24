import {
  Component,
  Input,
  OnInit,
  AfterViewInit,
  HostListener,
  Inject,
  PLATFORM_ID,
  ElementRef,
  ViewChild,
  ChangeDetectionStrategy
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';
import { FlowNode } from '../../../core/models/answer-sheet.models';

@Component({
  selector: 'app-flow-diagram',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="relative w-full p-4 rounded-2xl border bg-slate-50/60 overflow-hidden my-4"
         [class]="containerThemeClasses">
      <!-- Background SVG Bezier Connectors Layer -->
      <svg #connectorSvg class="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-visible"></svg>

      <!-- Node Elements Layer -->
      <div
        class="relative z-10 flex gap-6"
        [class.flex-col]="direction === 'vertical'"
        [class.flex-row]="direction === 'horizontal'"
        [class.items-center]="direction === 'horizontal'"
        [class.justify-between]="direction === 'horizontal'"
      >
        @for (node of nodes; track node.id; let idx = $index) {
          <div
            [id]="'flownode-' + node.id"
            class="flex items-center gap-3 p-3.5 rounded-xl border bg-white shadow-xs transition-all duration-300
                   hover:shadow-md hover:scale-[1.02] cursor-pointer select-none group min-w-[200px]"
            [class.border-emerald-300]="node.status === 'completed'"
            [class.bg-emerald-50]="node.status === 'completed'"
            [class.border-blue-300]="node.status === 'active' || !node.status"
            [class.ring-2]="node.status === 'active'"
            [class.ring-blue-400]="node.status === 'active'"
          >
            <!-- Step Badge / Icon -->
            <div
              class="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs flex-shrink-0 transition-transform group-hover:scale-110"
              [class]="node.status === 'completed'
                ? 'bg-emerald-600 text-white'
                : 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white'"
            >
              @if (node.icon) {
                <lucide-icon [name]="node.icon" [size]="16" />
              } @else {
                {{ idx + 1 }}
              }
            </div>

            <!-- Content -->
            <div class="flex-1 min-w-0">
              <h4 class="text-xs font-bold text-slate-800 leading-snug group-hover:text-blue-600 transition-colors">
                {{ node.label }}
              </h4>
              @if (node.sublabel) {
                <p class="text-[11px] text-slate-500 font-medium leading-tight mt-0.5 truncate">
                  {{ node.sublabel }}
                </p>
              }
            </div>

            <!-- Arrow Indicator for Sequence -->
            @if (idx < nodes.length - 1) {
              <div class="text-slate-300 group-hover:text-blue-500 transition-colors flex-shrink-0 ml-1">
                <lucide-icon [name]="direction === 'horizontal' ? 'arrow-right' : 'arrow-down'" [size]="14" />
              </div>
            }
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; width: 100%; }
    .connector-path {
      stroke-dasharray: 6;
      animation: dash 30s linear infinite;
    }
    @keyframes dash {
      to { stroke-dashoffset: -1000; }
    }
  `]
})
export class FlowDiagramComponent implements OnInit, AfterViewInit {
  @Input() nodes: FlowNode[] = [];
  @Input() direction: 'horizontal' | 'vertical' = 'horizontal';
  @Input() theme: 'blue' | 'emerald' | 'amber' | 'violet' = 'blue';

  @ViewChild('connectorSvg') connectorSvg!: ElementRef<SVGElement>;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  get containerThemeClasses(): string {
    switch (this.theme) {
      case 'emerald': return 'border-emerald-200 bg-emerald-50/30';
      case 'amber': return 'border-amber-200 bg-amber-50/30';
      case 'violet': return 'border-purple-200 bg-purple-50/30';
      default: return 'border-blue-200 bg-blue-50/30';
    }
  }

  ngOnInit() {}

  ngAfterViewInit() {
    if (isPlatformBrowser(this.platformId)) {
      setTimeout(() => this.drawConnectors(), 150);
    }
  }

  @HostListener('window:resize')
  onResize() {
    if (isPlatformBrowser(this.platformId)) {
      window.requestAnimationFrame(() => this.drawConnectors());
    }
  }

  drawConnectors() {
    if (!isPlatformBrowser(this.platformId) || !this.connectorSvg) return;

    const svg = this.connectorSvg.nativeElement;
    svg.innerHTML = ''; // Clear existing paths

    if (this.nodes.length < 2) return;

    for (let i = 0; i < this.nodes.length - 1; i++) {
      const current = this.nodes[i];
      const next = this.nodes[i + 1];

      const startEl = document.getElementById(`flownode-${current.id}`);
      const endEl = document.getElementById(`flownode-${next.id}`);

      if (startEl && endEl) {
        const startRect = startEl.getBoundingClientRect();
        const endRect = endEl.getBoundingClientRect();
        const svgRect = svg.getBoundingClientRect();

        let x1: number, y1: number, x2: number, y2: number, d: string;

        if (this.direction === 'horizontal') {
          x1 = startRect.right - svgRect.left;
          y1 = startRect.top + startRect.height / 2 - svgRect.top;
          x2 = endRect.left - svgRect.left;
          y2 = endRect.top + endRect.height / 2 - svgRect.top;

          const midX = x1 + (x2 - x1) / 2;
          d = `M ${x1} ${y1} C ${midX} ${y1}, ${midX} ${y2}, ${x2} ${y2}`;
        } else {
          x1 = startRect.left + startRect.width / 2 - svgRect.left;
          y1 = startRect.bottom - svgRect.top;
          x2 = endRect.left + endRect.width / 2 - svgRect.left;
          y2 = endRect.top - svgRect.top;

          const midY = y1 + (y2 - y1) / 2;
          d = `M ${x1} ${y1} C ${x1} ${midY}, ${x2} ${midY}, ${x2} ${y2}`;
        }

        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', d);
        path.setAttribute('fill', 'none');
        path.setAttribute('stroke', this.theme === 'emerald' ? '#059669' : '#2563EB');
        path.setAttribute('stroke-width', '2.5');
        path.setAttribute('class', 'connector-path');
        path.setAttribute('opacity', '0.7');

        svg.appendChild(path);
      }
    }
  }
}

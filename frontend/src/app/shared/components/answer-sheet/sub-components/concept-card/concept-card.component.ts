import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';

export interface ConceptItem {
  label: string;
  badge?: string;
  icon?: string;
  colorTheme?: 'emerald' | 'blue' | 'purple' | 'amber' | 'rose';
  points: string[];
  code?: string;
}

@Component({
  selector: 'app-concept-card',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 my-6">
      @for (item of items; track item.label) {
        <div
          class="p-4 rounded-2xl border bg-white shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between"
          [class]="getCardClasses(item.colorTheme)"
        >
          <div>
            <!-- Header -->
            <div class="flex items-center justify-between gap-2 mb-3">
              <div class="flex items-center gap-2">
                <div class="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-white shadow-2xs"
                     [class]="getIconClasses(item.colorTheme)">
                  <lucide-icon [name]="item.icon || 'zap'" [size]="16" />
                </div>
                <h4 class="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  {{ item.label }}
                </h4>
              </div>

              @if (item.badge) {
                <span class="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full border"
                      [class]="getBadgeClasses(item.colorTheme)">
                  {{ item.badge }}
                </span>
              }
            </div>

            <!-- Bullet Points -->
            <div class="space-y-2 text-xs text-slate-700">
              @for (point of item.points; track point) {
                <div class="flex items-start gap-2">
                  <lucide-icon name="check" [size]="13" class="text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span class="leading-relaxed font-medium">{{ point }}</span>
                </div>
              }
            </div>
          </div>

          <!-- Code Snippet Optional -->
          @if (item.code) {
            <div class="mt-4 pt-3 border-t border-slate-200/80">
              <pre class="text-[10px] font-mono p-2.5 rounded-lg bg-slate-900 text-slate-200 overflow-x-auto leading-normal"><code>{{ item.code }}</code></pre>
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    :host { display: block; width: 100%; }
  `]
})
export class ConceptCardComponent {
  @Input({ required: true }) items: ConceptItem[] = [];

  getCardClasses(theme?: string): string {
    switch (theme) {
      case 'emerald': return 'border-emerald-200 hover:border-emerald-400 bg-gradient-to-b from-emerald-50/30 to-white';
      case 'purple': return 'border-purple-200 hover:border-purple-400 bg-gradient-to-b from-purple-50/30 to-white';
      case 'amber': return 'border-amber-200 hover:border-amber-400 bg-gradient-to-b from-amber-50/30 to-white';
      case 'rose': return 'border-rose-200 hover:border-rose-400 bg-gradient-to-b from-rose-50/30 to-white';
      default: return 'border-blue-200 hover:border-blue-400 bg-gradient-to-b from-blue-50/30 to-white';
    }
  }

  getIconClasses(theme?: string): string {
    switch (theme) {
      case 'emerald': return 'bg-emerald-600';
      case 'purple': return 'bg-purple-600';
      case 'amber': return 'bg-amber-600';
      case 'rose': return 'bg-rose-600';
      default: return 'bg-blue-600';
    }
  }

  getBadgeClasses(theme?: string): string {
    switch (theme) {
      case 'emerald': return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'purple': return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'amber': return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'rose': return 'bg-rose-100 text-rose-800 border-rose-300';
      default: return 'bg-blue-100 text-blue-800 border-blue-300';
    }
  }
}

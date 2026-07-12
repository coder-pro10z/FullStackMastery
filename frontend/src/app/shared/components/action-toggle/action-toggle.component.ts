import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-action-toggle',
  standalone: true,
  template: `
    <button
      type="button"
      class="inline-flex items-center justify-center w-8 h-8 rounded-full transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]"
      [class]="active ? activeClasses : inactiveClasses"
      [title]="label"
      (click)="toggled.emit()">

      <!-- Solved icon -->
      @if (icon === 'solved') {
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
          @if (active) {
            <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
          } @else {
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          }
        </svg>
      }

      <!-- Revision/Bookmark icon -->
      @if (icon === 'bookmark') {
        <svg class="w-4 h-4" [attr.fill]="active ? 'currentColor' : 'none'" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
        </svg>
      }
    </button>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ActionToggleComponent {
  @Input({ required: true }) label = '';
  @Input() active = false;
  @Input() icon: 'solved' | 'bookmark' = 'solved';
  @Output() toggled = new EventEmitter<void>();

  get activeClasses(): string {
    if (this.icon === 'solved') {
      return 'bg-emerald-500 text-white shadow-md shadow-emerald-500/30 scale-110';
    }
    return 'bg-amber-100 text-amber-600 border border-amber-200 shadow-sm scale-110';
  }

  get inactiveClasses(): string {
    return 'bg-slate-50 text-[#5F6368] border border-slate-200 hover:text-[#202124] hover:bg-slate-100 hover:scale-105';
  }
}

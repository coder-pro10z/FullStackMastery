import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-action-toggle',
  standalone: true,
  template: `
    <button
      class="toggle-chip"
      type="button"
      [class.toggle-chip-active]="active"
      (click)="toggled.emit()">
      {{ label }}
    </button>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ActionToggleComponent {
  @Input({ required: true }) label = '';
  @Input() active = false;
  @Output() toggled = new EventEmitter<void>();
}

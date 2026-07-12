import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-premium-checkbox',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './premium-checkbox.component.html',
  styleUrl: './premium-checkbox.component.scss'
})
export class PremiumCheckboxComponent {
  @Input() checked = false;
  @Input() disabled = false;
  @Output() checkedChange = new EventEmitter<boolean>();

  toggle() {
    if (!this.disabled) {
      this.checked = !this.checked;
      this.checkedChange.emit(this.checked);
    }
  }
}

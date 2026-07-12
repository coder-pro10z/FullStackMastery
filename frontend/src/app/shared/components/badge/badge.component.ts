import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type BadgeType = 'primary' | 'success' | 'warning' | 'neutral' | 'error';

@Component({
  selector: 'app-badge',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './badge.component.html',
  styleUrl: './badge.component.scss'
})
export class BadgeComponent {
  @Input() text = '';
  @Input() type: BadgeType = 'neutral';
  
  get badgeClass(): string {
    return `badge badge-${this.type}`;
  }
}

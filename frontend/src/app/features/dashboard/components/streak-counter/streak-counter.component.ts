import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Flame } from 'lucide-angular';

@Component({
  selector: 'app-streak-counter',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './streak-counter.component.html',
  styleUrl: './streak-counter.component.scss'
})
export class StreakCounterComponent {
  @Input() currentStreak = 12;
  @Input() bestStreak = 21;
}

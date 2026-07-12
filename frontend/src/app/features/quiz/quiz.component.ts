import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';

interface QuizTopic {
  name: string;
  count: number;
  readiness: number;
}

@Component({
  selector: 'app-quiz',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './quiz.component.html',
  styleUrl: './quiz.component.scss'
})
export class QuizComponent {
  readonly topics: QuizTopic[] = [
    { name: 'Angular', count: 12, readiness: 68 },
    { name: 'SQL', count: 15, readiness: 74 },
    { name: 'System Design', count: 9, readiness: 51 },
    { name: 'Behavioral', count: 8, readiness: 82 }
  ];

  readonly choices = [
    'Use signals for local reactive state that changes template output.',
    'Use signals only for HTTP requests.',
    'Use signals to replace every service.',
    'Use signals only inside routing modules.'
  ];
}

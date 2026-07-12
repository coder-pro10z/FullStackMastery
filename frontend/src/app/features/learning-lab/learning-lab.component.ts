import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';
import { ForumQuizComponent } from '../interactive-lessons/components/forum-quiz/forum-quiz.component';
import { InteractiveGraphComponent } from '../interactive-lessons/components/interactive-graph/interactive-graph.component';
import { SqlTableComponent } from '../interactive-lessons/components/sql-table/sql-table.component';
import { VennDiagramComponent } from '../interactive-lessons/components/venn-diagram/venn-diagram.component';

type LabTab = 'quiz' | 'graph' | 'venn' | 'table';

@Component({
  selector: 'app-learning-lab',
  standalone: true,
  imports: [
    CommonModule,
    LucideAngularModule,
    ForumQuizComponent,
    InteractiveGraphComponent,
    VennDiagramComponent,
    SqlTableComponent
  ],
  templateUrl: './learning-lab.component.html',
  styleUrl: './learning-lab.component.scss'
})
export class LearningLabComponent {
  activeTab: LabTab = 'quiz';

  readonly modules: { id: LabTab; label: string; icon: string; description: string }[] = [
    { id: 'quiz', label: 'Quiz Mode', icon: 'circle-help', description: 'Check understanding with focused concept questions.' },
    { id: 'graph', label: 'D3 Graph', icon: 'git-fork', description: 'Explore relationships and traversal patterns visually.' },
    { id: 'venn', label: 'SQL Venn', icon: 'focus', description: 'Compare SQL join behavior with interactive sets.' },
    { id: 'table', label: 'SQL Engine', icon: 'table-2', description: 'Practice query thinking against tabular examples.' }
  ];

  setTab(tab: LabTab) {
    this.activeTab = tab;
  }
}

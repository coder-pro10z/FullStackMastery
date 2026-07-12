import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ForumQuizComponent } from './components/forum-quiz/forum-quiz.component';
import { InteractiveGraphComponent } from './components/interactive-graph/interactive-graph.component';
import { VennDiagramComponent } from './components/venn-diagram/venn-diagram.component';
import { SqlTableComponent } from './components/sql-table/sql-table.component';

@Component({
  selector: 'app-interactive-lessons',
  standalone: true,
  imports: [CommonModule, ForumQuizComponent, InteractiveGraphComponent, VennDiagramComponent, SqlTableComponent],
  templateUrl: './interactive-lessons.component.html',
  styleUrl: './interactive-lessons.component.scss'
})
export class InteractiveLessonsComponent {
  activeTab = 'quiz';

  setTab(tab: string) {
    this.activeTab = tab;
  }
}

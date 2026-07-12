import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardStore } from '../../../../core/state/dashboard.store';

interface QuizOption {
  text: string;
  isCorrect: boolean;
}

interface QuizData {
  question: string;
  options: QuizOption[];
  explanation: string;
}

@Component({
  selector: 'app-forum-quiz',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './forum-quiz.component.html',
  styleUrl: './forum-quiz.component.scss'
})
export class ForumQuizComponent implements OnInit {
  dashboardStore = inject(DashboardStore);

  quizDatabase: Record<string, QuizData[]> = {
    "Frontend & UI": [
      {
        question: "Which CSS property is used to create the floating 'Bento Box' elevation effect?",
        options: [
          { text: "border-radius", isCorrect: false },
          { text: "box-shadow", isCorrect: true },
          { text: "transform", isCorrect: false },
          { text: "z-index", isCorrect: false }
        ],
        explanation: "While border-radius creates the shape, <strong>box-shadow</strong> creates the physical depth and elevation required for the Bento Box aesthetic."
      },
      {
        question: "In the Premium Light theme, what is the primary accent color used for active states?",
        options: [
          { text: "Deep Charcoal (#202124)", isCorrect: false },
          { text: "Emerald Green (#10B981)", isCorrect: false },
          { text: "Electric Indigo (#4F46E5)", isCorrect: true }
        ],
        explanation: "<strong>Electric Indigo</strong> is the primary brand color used for buttons, active tabs, and focus highlights to draw the user's attention seamlessly."
      }
    ]
  };

  selectedCategory: string | null = null;
  activeQuizData: QuizData[] = [];

  currentIndex = 0;
  selectedOptionIndex: number | null = null;
  isQuestionSubmitted = false;
  isComplete = false;

  get currentData(): QuizData {
    return this.activeQuizData[this.currentIndex];
  }

  get progressPercent(): number {
    if (this.activeQuizData.length === 0) return 0;
    return this.isComplete ? 100 : (this.currentIndex / this.activeQuizData.length) * 100;
  }

  ngOnInit(): void {
    if (!this.dashboardStore.techStack() && !this.dashboardStore.isLoading()) {
      this.dashboardStore.loadTechStack();
    }
  }

  selectCategory(categoryName: string) {
    this.selectedCategory = categoryName;
    // Map existing dummy questions to a default category if match is not perfect, or let it be empty
    this.activeQuizData = this.quizDatabase[categoryName] || [];
    
    // As a fallback, if no questions for this category, maybe we assign dummy ones just for demo,
    // but the user said "load if Question are there to be Loaded / or not", so empty is fine.
    this.currentIndex = 0;
    this.selectedOptionIndex = null;
    this.isQuestionSubmitted = false;
    this.isComplete = false;
  }

  resetSelection() {
    this.selectedCategory = null;
    this.activeQuizData = [];
  }

  handleOptionClick(index: number) {
    if (this.isQuestionSubmitted) return;
    this.selectedOptionIndex = index;
  }

  handleAction() {
    if (this.isQuestionSubmitted) {
      this.currentIndex++;
      if (this.currentIndex < this.activeQuizData.length) {
        this.selectedOptionIndex = null;
        this.isQuestionSubmitted = false;
      } else {
        this.isComplete = true;
      }
      return;
    }

    this.isQuestionSubmitted = true;
  }
}

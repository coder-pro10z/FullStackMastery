export interface ProgressSummaryDto {
  totalQuestions: number;
  totalSolved: number;
  easyTotal: number;
  easySolved: number;
  mediumTotal: number;
  mediumSolved: number;
  hardTotal: number;
  hardSolved: number;
}

export interface UserProgressStateDto {
  questionId: number;
  isSolved: boolean;
  isRevision: boolean;
}

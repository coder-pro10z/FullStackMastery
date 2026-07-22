// Challenge module TypeScript models
// These match 1:1 with the backend ChallengeDtos.cs

export type CompetencyCategory = 'CSharpCore' | 'AspNetCore' | 'SqlTheory' | 'SqlCoding' | 'Angular';

export interface CompetencyModel {
  id: number;
  /** Canonical ID, e.g. "C07", "A03", "SC06", "NG01" */
  competencyId: string;
  category: CompetencyCategory;
  title: string;
  sortOrder: number;
}

export interface ChallengeDayModel {
  id: number;
  dayNumber: number;
  title: string;
  mainFocus: string;
  sqlCodingNote: string | null;
  notes: string | null;
  primaryCompetencies: CompetencyModel[];
  secondaryCompetencies: CompetencyModel[];
  /** User-specific */
  isCompleted: boolean;
  completedAt: string | null;
  userNotes: string | null;
}

export interface UserChallengeProgressModel {
  dayNumber: number;
  isCompleted: boolean;
  completedAt: string | null;
  notes: string | null;
}

export interface ChallengeSummaryModel {
  totalDays: number;
  completedDays: number;
  currentStreak: number;
  longestStreak: number;
  completionPercentage: number;
  totalCompetencies: number;
}

export interface MarkDayCompleteRequest {
  notes?: string | null;
}

/** Human-readable category labels for display */
export const CATEGORY_LABELS: Record<CompetencyCategory, string> = {
  CSharpCore: 'C# Core',
  AspNetCore: 'ASP.NET Core',
  SqlTheory: 'SQL Theory',
  SqlCoding: 'SQL Coding',
  Angular: 'Angular',
};

/** Tailwind CSS color classes per category — maps to the design system */
export const CATEGORY_COLORS: Record<CompetencyCategory, { bg: string; text: string; border: string; dot: string }> = {
  CSharpCore:  { bg: 'bg-blue-50',   text: 'text-blue-700',   border: 'border-blue-200',   dot: 'bg-blue-500'   },
  AspNetCore:  { bg: 'bg-violet-50', text: 'text-violet-700', border: 'border-violet-200', dot: 'bg-violet-500' },
  SqlTheory:   { bg: 'bg-amber-50',  text: 'text-amber-700',  border: 'border-amber-200',  dot: 'bg-amber-500'  },
  SqlCoding:   { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200', dot: 'bg-orange-500' },
  Angular:     { bg: 'bg-red-50',    text: 'text-red-700',    border: 'border-red-200',    dot: 'bg-red-500'    },
};

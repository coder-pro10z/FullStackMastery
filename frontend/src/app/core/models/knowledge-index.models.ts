import { Difficulty } from './question.models';
import { QuestionQueryParams } from './question.models';

export type IndexNodeType = 'category' | 'subcategory' | 'topic' | 'question';
export type ExplorerView = 'category' | 'tree' | 'list';
export type IndexColorTheme = 'blue' | 'emerald' | 'violet' | 'amber' | 'rose' | 'cyan' | 'slate';

export interface IndexNode {
  id: string;                   // e.g. "cat-12" or "q-45"
  type: IndexNodeType;
  label: string;
  questionCount: number;
  solvedCount: number;
  masteryPct: number;           // 0-100
  difficulty?: Difficulty;     // questions only
  isSolved?: boolean;           // questions only
  isRevision?: boolean;        // questions only
  children: IndexNode[];
  parentIds: string[];          // for breadcrumb reconstruction
  categoryId?: number;          // API categoryId for filter emission
  questionId?: number;          // API questionId for direct navigation
  depth: number;                // nesting level (0 = root)
}

export interface IndexCategory extends IndexNode {
  type: 'category' | 'subcategory';
  icon: string;                 // lucide icon name
  colorTheme: IndexColorTheme;
}

export interface IndexStats {
  totalQuestions: number;
  solvedQuestions: number;
  masteryPct: number;
  totalCategories: number;
  bookmarkedCount: number;
}

export interface IndexNodeSelectedEvent {
  node: IndexNode;
  filterParams: Partial<QuestionQueryParams>;
}

export interface BreadcrumbItem {
  id: string;
  label: string;
}

// Mapping of category names to icons and color themes
export const CATEGORY_THEME_MAP: Record<string, { icon: string; colorTheme: IndexColorTheme }> = {
  'C#': { icon: 'code-2', colorTheme: 'violet' },
  'C# Core': { icon: 'code-2', colorTheme: 'violet' },
  'ASP.NET Core': { icon: 'server', colorTheme: 'blue' },
  'ASP.NET': { icon: 'server', colorTheme: 'blue' },
  'SQL': { icon: 'database', colorTheme: 'amber' },
  'SQL Theory': { icon: 'database', colorTheme: 'amber' },
  'SQL Coding': { icon: 'table', colorTheme: 'rose' },
  'Angular': { icon: 'layers', colorTheme: 'emerald' },
  'Security': { icon: 'shield', colorTheme: 'rose' },
  'Authentication': { icon: 'lock', colorTheme: 'rose' },
  'Performance': { icon: 'zap', colorTheme: 'amber' },
  'Architecture': { icon: 'git-branch', colorTheme: 'cyan' },
};

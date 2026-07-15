export type Difficulty = 'Easy' | 'Medium' | 'Hard';

export interface QuestionDto {
  id: number;
  externalId?: string | null;
  title?: string | null;
  questionText: string;
  answerText?: string | null;
  definition?: string | null;
  interviewAnswer?: string | null;
  structuredContent?: AnswerContentDto | null;
  difficulty: Difficulty;
  tags: string[];
  categoryId: number;
  categoryName: string;
  isSolved: boolean;
  isRevision: boolean;
}

export interface AnswerContentDto {
  technicalExplanation?: string;
  bestPractice?: string;
  realProjectExample?: string;
  codeSnippets?: CodeSnippetDto[];
  architectureNote?: ArchitectureNoteDto;
  differentiator?: DifferentiatorDto;
  troubleshooting?: TroubleshootingDto;
  followUpQuestions?: string[];
}

export interface CodeSnippetDto {
  language: string;
  label?: string;
  code: string;
  highlightLines?: number[];
}

export interface ArchitectureNoteDto {
  description: string;
  mermaidGraph?: string;
}

export interface DifferentiatorDto {
  description: string;
  comparisonTable?: string;
}

export interface TroubleshootingDto {
  description: string;
  table?: string;
}

export interface PagedResponse<T> {
  data: T[];
  totalRecords: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}

export interface QuestionQueryParams {
  categoryId?: number;
  searchTerm?: string;
  difficulty?: Difficulty;
  role?: string;
  pageNumber?: number;
  pageSize?: number;
}

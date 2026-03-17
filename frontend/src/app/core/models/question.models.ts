export type Difficulty = 'Easy' | 'Medium' | 'Hard';

export interface QuestionDto {
  id: number;
  title?: string | null;
  questionText: string;
  answerText?: string | null;
  difficulty: Difficulty;
  role: string;
  categoryId: number;
  categoryName: string;
  isSolved: boolean;
  isRevision: boolean;
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

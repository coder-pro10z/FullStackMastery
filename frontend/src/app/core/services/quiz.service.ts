import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Difficulty } from '../models/question.models';

export type QuizMode = 'Practice' | 'Assessment';

export interface CreateQuizAttemptDto {
  mode: QuizMode;
  categoryId?: number;
  role?: string;
  difficulty?: Difficulty;
  questionCount: number;
}

export interface QuizAttemptResponseDto {
  id: number;
  isSelfMarkedCorrect?: boolean;
  answeredAtUtc?: string;
}

export interface QuizAttemptQuestionDto {
  id: number;
  orderIndex: number;
  title: string;
  questionText: string;
  answerText?: string | null;
  response?: QuizAttemptResponseDto;
}

export interface QuizAttemptDto {
  id: number;
  mode: string;
  status: string;
  startedAt: string;
  completedAt?: string;
  totalQuestions: number;
  correctCount: number;
  questions: QuizAttemptQuestionDto[];
}

export interface SaveResponsePayloadDto {
  isSelfMarkedCorrect: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class QuizService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/quizzes`;

  createAttempt(dto: CreateQuizAttemptDto): Observable<QuizAttemptDto> {
    return this.http.post<QuizAttemptDto>(this.apiUrl, dto);
  }

  getAttempt(id: number): Observable<QuizAttemptDto> {
    return this.http.get<QuizAttemptDto>(`${this.apiUrl}/${id}`);
  }

  saveResponse(attemptId: number, questionId: number, payload: SaveResponsePayloadDto): Observable<QuizAttemptDto> {
    return this.http.post<QuizAttemptDto>(`${this.apiUrl}/${attemptId}/responses/${questionId}`, payload);
  }

  submitAttempt(attemptId: number): Observable<QuizAttemptDto> {
    return this.http.post<QuizAttemptDto>(`${this.apiUrl}/${attemptId}/submit`, {});
  }
}

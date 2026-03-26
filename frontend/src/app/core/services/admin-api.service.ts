import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface AdminQuestionFilter {
    page?: number;
    pageSize?: number;
    searchTerm?: string;
    difficulty?: string;
    role?: string;
    categoryId?: number;
    status?: string;
    includeDeleted?: boolean;
}

export interface QuestionAdminDto {
    id: number;
    title: string | null;
    questionText: string;
    answerMarkdown: string | null;
    difficulty: string;
    role: string;
    categoryId: number;
    categoryName: string;
    status: string;
    isDeleted: boolean;
    createdAt: string;
    updatedAt: string | null;
}

export interface PagedAdminResult<T> {
    data: T[];
    totalRecords: number;
    pageNumber: number;
    pageSize: number;
    totalPages: number;
}

export interface CreateUpdateQuestionDto {
    title?: string;
    questionText: string;
    answerMarkdown?: string;
    difficulty: string;
    role: string;
    categoryId: number;
    status: string;
}

export interface DashboardStatsDto {
    totalQuestions: number;
    publishedQuestions: number;
    draftQuestions: number;
    deletedQuestions: number;
    totalCategories: number;
    totalUsers: number;
    countByDifficulty: { easy: number; medium: number; hard: number };
    recentActivity: AuditLogDto[];
}

export interface AuditLogDto {
    id: number;
    userEmail: string;
    action: string;
    entityType: string;
    entityId: string | null;
    timestamp: string;
}

export interface CategoryManageDto {
    id: number;
    name: string;
    slug: string;
    parentId: number | null;
    questionCount: number;
    subCategories: CategoryManageDto[];
}

export interface BulkImportResultDto {
    imported: number;
    skipped: number;
    failed: number;
    isDryRun: boolean;
    errors: string[];
    warnings: string[];
}

@Injectable({ providedIn: 'root' })
export class AdminApiService {
    private readonly http = inject(HttpClient);
    private readonly base = `${environment.apiUrl}/admin`;

    // ── Dashboard ──────────────────────────────────────────────────────────────
    getDashboardStats(): Observable<DashboardStatsDto> {
        return this.http.get<DashboardStatsDto>(`${this.base}/dashboard`);
    }

    // ── Questions ──────────────────────────────────────────────────────────────
    getQuestions(filter: AdminQuestionFilter = {}): Observable<PagedAdminResult<QuestionAdminDto>> {
        let params = new HttpParams();
        if (filter.page) params = params.set('page', filter.page);
        if (filter.pageSize) params = params.set('pageSize', filter.pageSize);
        if (filter.searchTerm) params = params.set('searchTerm', filter.searchTerm);
        if (filter.difficulty) params = params.set('difficulty', filter.difficulty);
        if (filter.role) params = params.set('role', filter.role);
        if (filter.categoryId) params = params.set('categoryId', filter.categoryId);
        if (filter.status) params = params.set('status', filter.status);
        if (filter.includeDeleted) params = params.set('includeDeleted', 'true');
        return this.http.get<PagedAdminResult<QuestionAdminDto>>(`${this.base}/questions`, { params });
    }

    createQuestion(dto: CreateUpdateQuestionDto): Observable<QuestionAdminDto> {
        return this.http.post<QuestionAdminDto>(`${this.base}/questions`, dto);
    }

    updateQuestion(id: number, dto: CreateUpdateQuestionDto): Observable<QuestionAdminDto> {
        return this.http.put<QuestionAdminDto>(`${this.base}/questions/${id}`, dto);
    }

    deleteQuestion(id: number): Observable<void> {
        return this.http.delete<void>(`${this.base}/questions/${id}`);
    }

    restoreQuestion(id: number): Observable<void> {
        return this.http.post<void>(`${this.base}/questions/${id}/restore`, {});
    }

    getQuestionVersions(id: number): Observable<any[]> {
        return this.http.get<any[]>(`${this.base}/questions/${id}/versions`);
    }

    // ── Import ─────────────────────────────────────────────────────────────────
    importFile(file: File, defaultCategoryId: number, dryRun = false): Observable<BulkImportResultDto> {
        const form = new FormData();
        form.append('file', file);
        form.append('defaultCategoryId', String(defaultCategoryId));
        const ext = file.name.split('.').pop()?.toLowerCase();

        if (ext === 'xlsx') {
            return this.http.post<{ imported: number }>(`${this.base}/import-questions`, form).pipe(
                map(result => ({
                    imported: result.imported ?? 0,
                    skipped: 0,
                    failed: 0,
                    isDryRun: false,
                    errors: [],
                    warnings: dryRun
                        ? ['Dry run is not supported for Excel imports. The file was imported directly.']
                        : []
                }))
            );
        }

        form.append('dryRun', String(dryRun));
        return this.http.post<BulkImportResultDto>(`${this.base}/import`, form);
    }

    // ── Categories ─────────────────────────────────────────────────────────────
    getCategoryTree(): Observable<CategoryManageDto[]> {
        return this.http.get<CategoryManageDto[]>(`${this.base}/categories`);
    }

    createCategory(dto: { name: string; slug?: string; parentId?: number }): Observable<CategoryManageDto> {
        return this.http.post<CategoryManageDto>(`${this.base}/categories`, dto);
    }

    updateCategory(id: number, dto: { name: string; slug?: string; parentId?: number }): Observable<CategoryManageDto> {
        return this.http.put<CategoryManageDto>(`${this.base}/categories/${id}`, dto);
    }

    deleteCategory(id: number): Observable<void> {
        return this.http.delete<void>(`${this.base}/categories/${id}`);
    }

    // ── Public categories (for existing dropdowns) ─────────────────────────────
    getCategoriesForDropdown(): Observable<{ id: number; name: string }[]> {
        return this.http.get<{ id: number; name: string }[]>(`${environment.apiUrl}/categories`);
    }

    importQuestions(payload: { file: File; defaultCategoryId: number }): Observable<any> {
        return this.importFile(payload.file, payload.defaultCategoryId);
    }
}

import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { CategoryFlatDto } from '../models/category.models';
import { ImportQuestionsRequest } from '../models/admin.models';

@Injectable({ providedIn: 'root' })
export class AdminService {
  private readonly http = inject(HttpClient);

  importQuestions(request: ImportQuestionsRequest) {
    const formData = new FormData();
    formData.append('file', request.file);
    formData.append('defaultCategoryId', request.defaultCategoryId.toString());

    return this.http.post(`${environment.apiUrl}/admin/import-questions`, formData);
  }

  getCategoriesForDropdown() {
    return this.http.get<CategoryFlatDto[]>(`${environment.apiUrl}/categories/flat`);
  }
}

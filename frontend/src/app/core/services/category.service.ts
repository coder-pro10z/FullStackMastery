import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { CategoryFlatDto, CategoryTreeDto } from '../models/category.models';

@Injectable({ providedIn: 'root' })
export class CategoryService {
  private readonly http = inject(HttpClient);

  getTree() {
    return this.http.get<CategoryTreeDto[]>(`${environment.apiUrl}/categories/tree`);
  }

  getFlatList() {
    return this.http.get<CategoryFlatDto[]>(`${environment.apiUrl}/categories/flat`);
  }
}

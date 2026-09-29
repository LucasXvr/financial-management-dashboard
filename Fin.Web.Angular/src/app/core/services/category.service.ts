import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { EMPTY, Observable, expand, map, reduce } from 'rxjs';

import {
  Category,
  CreateCategoryRequest,
  PagedResponse,
  UpdateCategoryRequest
} from '../models/category.models';
import { ApiResponse } from '../models/auth-api.models';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class CategoryService {
  private readonly categoriesUrl = `${environment.apiBaseUrl}/v1/categories`;

  constructor(private readonly http: HttpClient) {}

  getCategories(
    pageNumber: number,
    pageSize: number
  ): Observable<PagedResponse<Category[]>> {
    return this.http.get<PagedResponse<Category[]>>(this.categoriesUrl, {
      params: {
        pageNumber,
        pageSize
      }
    });
  }

  getAllCategories(pageSize = 100): Observable<Category[]> {
    return this.getCategories(1, pageSize).pipe(
      expand((response) =>
        response.currentPage < response.totalPages
          ? this.getCategories(response.currentPage + 1, pageSize)
          : EMPTY
      ),
      reduce(
        (categories, response) => [...categories, ...(response.data ?? [])],
        [] as Category[]
      ),
      map((categories) =>
        categories.sort((left, right) => left.title.localeCompare(right.title, 'pt-BR'))
      )
    );
  }

  createCategory(payload: CreateCategoryRequest): Observable<Category> {
    return this.http
      .post<ApiResponse<Category>>(this.categoriesUrl, payload)
      .pipe(map((response) => this.requireCategory(response)));
  }

  updateCategory(
    id: number,
    payload: UpdateCategoryRequest
  ): Observable<Category> {
    return this.http
      .put<ApiResponse<Category>>(`${this.categoriesUrl}/${id}`, payload)
      .pipe(map((response) => this.requireCategory(response)));
  }

  deleteCategory(id: number): Observable<void> {
    return this.http
      .delete<ApiResponse<Category>>(`${this.categoriesUrl}/${id}`)
      .pipe(map(() => void 0));
  }

  private requireCategory(response: ApiResponse<Category>): Category {
    if (!response.data) {
      throw new Error('A API nao retornou a categoria.');
    }

    return response.data;
  }
}

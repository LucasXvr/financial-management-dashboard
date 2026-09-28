export interface Category {
  id: number;
  title: string;
  description: string | null;
}

export interface CreateCategoryRequest {
  title: string;
  description: string;
}

export type UpdateCategoryRequest = CreateCategoryRequest;

export interface PagedResponse<T> {
  data: T;
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalCount: number;
  message?: string;
}

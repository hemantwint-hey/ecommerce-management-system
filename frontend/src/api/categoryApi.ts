import { apiClient } from './client';
import type { CategoryDTO, CategoryResponse } from '@/types/models';

export interface CategoryQueryParams {
  pageNumber?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export const categoryApi = {
  list: (params: CategoryQueryParams = {}) =>
    apiClient.get<CategoryResponse>('/public/categories', { params }).then((res) => res.data),

  create: (categoryName: string) =>
    apiClient.post<CategoryDTO>('/admin/categories', { categoryName }).then((res) => res.data),

  update: (categoryId: number, categoryName: string) =>
    apiClient
      .put<CategoryDTO>(`/admin/categories/${categoryId}`, { categoryName })
      .then((res) => res.data),

  remove: (categoryId: number) =>
    apiClient.delete<CategoryDTO>(`/admin/categories/${categoryId}`).then((res) => res.data),
};

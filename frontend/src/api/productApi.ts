import { apiClient } from './client';
import type { ProductDTO, ProductResponse } from '@/types/models';

export interface ProductQueryParams {
  pageNumber?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export const productApi = {
  getById: (productId: number) =>
    apiClient.get<ProductDTO>(`/public/products/${productId}`).then((res) => res.data),

  list: (params: ProductQueryParams = {}) =>
    apiClient.get<ProductResponse>('/public/products', { params }).then((res) => res.data),

  byCategory: (categoryId: number, params: ProductQueryParams = {}) =>
    apiClient
      .get<ProductResponse>(`/public/categories/${categoryId}/products`, { params })
      .then((res) => res.data),

  search: (keyword: string, params: ProductQueryParams = {}) =>
    apiClient
      .get<ProductResponse>(`/public/products/keyword/${encodeURIComponent(keyword)}`, { params })
      .then((res) => res.data),

  create: (categoryId: number, product: Partial<ProductDTO>) =>
    apiClient
      .post<ProductDTO>(`/admin/categories/${categoryId}/product`, product)
      .then((res) => res.data),

  update: (productId: number, product: Partial<ProductDTO>) =>
    apiClient.put<ProductDTO>(`/admin/product/${productId}`, product).then((res) => res.data),

  remove: (productId: number) =>
    apiClient.delete<ProductDTO>(`/admin/product/${productId}`).then((res) => res.data),

  uploadImage: (productId: number, file: File) => {
    const formData = new FormData();
    formData.append('image', file);
    return apiClient
      .put<ProductDTO>(`/admin/products/${productId}/image`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then((res) => res.data);
  },
};

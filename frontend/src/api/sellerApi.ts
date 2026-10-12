import { apiClient } from './client';
import type { ProductQueryParams } from './productApi';
import type { OrderDTO, ProductDTO, ProductResponse } from '@/types/models';

/** /api/seller/** is restricted to ROLE_SELLER and ROLE_ADMIN, and writes only work on the seller's own products. */
export const sellerApi = {
  products: {
    list: (params: ProductQueryParams = {}) =>
      apiClient.get<ProductResponse>('/seller/products', { params }).then((res) => res.data),

    create: (categoryId: number, product: Partial<ProductDTO>) =>
      apiClient.post<ProductDTO>(`/seller/categories/${categoryId}/product`, product).then((res) => res.data),

    update: (productId: number, product: Partial<ProductDTO>) =>
      apiClient.put<ProductDTO>(`/seller/products/${productId}`, product).then((res) => res.data),

    remove: (productId: number) => apiClient.delete<ProductDTO>(`/seller/products/${productId}`).then((res) => res.data),

    uploadImage: (productId: number, file: File) => {
      const formData = new FormData();
      formData.append('image', file);
      return apiClient
        .put<ProductDTO>(`/seller/products/${productId}/image`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
        .then((res) => res.data);
    },
  },

  /** Orders containing this seller's products; items and totalAmount cover only the seller's lines. */
  orders: () => apiClient.get<OrderDTO[]>('/seller/orders').then((res) => res.data),
};

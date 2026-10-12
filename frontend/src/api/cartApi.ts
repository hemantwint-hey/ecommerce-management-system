import { apiClient } from './client';
import type { CartDTO } from '@/types/models';

export const cartApi = {
  getMyCart: () => apiClient.get<CartDTO>('/carts/users/cart').then((res) => res.data),

  addProduct: (productId: number, quantity: number) =>
    apiClient
      .post<CartDTO>(`/carts/products/${productId}/quantity/${quantity}`)
      .then((res) => res.data),

  changeQuantity: (productId: number, direction: 'increase' | 'decrease') =>
    apiClient
      .put<CartDTO>(`/cart/products/${productId}/quantity/${direction === 'decrease' ? 'delete' : 'add'}`)
      .then((res) => res.data),

  removeProduct: (cartId: number, productId: number) =>
    apiClient.delete<string>(`/carts/${cartId}/products/${productId}`).then((res) => res.data),
};

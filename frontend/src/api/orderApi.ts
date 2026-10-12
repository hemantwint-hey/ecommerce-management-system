import { apiClient } from './client';
import type { OrderDTO, OrderRequestDTO, PaymentMethod, StripePaymentDTO } from '@/types/models';

export const orderApi = {
  placeOrder: (paymentMethod: PaymentMethod, payload: OrderRequestDTO) =>
    apiClient
      .post<OrderDTO>(`/order/users/payments/${paymentMethod}`, payload)
      .then((res) => res.data),

  /** Creates a Stripe PaymentIntent for the current cart; the server computes the amount. */
  createStripePayment: () =>
    apiClient.post<StripePaymentDTO>('/order/stripe-client-secret').then((res) => res.data),

  myOrders: () => apiClient.get<OrderDTO[]>('/orders/users').then((res) => res.data),

  getById: (orderId: number) => apiClient.get<OrderDTO>(`/orders/${orderId}`).then((res) => res.data),

  adminList: () => apiClient.get<OrderDTO[]>('/admin/orders').then((res) => res.data),

  updateStatus: (orderId: number, status: string) =>
    apiClient
      .put<OrderDTO>(`/admin/orders/${orderId}/status`, { status })
      .then((res) => res.data),
};

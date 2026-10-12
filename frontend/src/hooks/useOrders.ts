import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { orderApi } from '@/api/orderApi';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/contexts/ToastContext';
import { useAppDispatch } from '@/store';
import { fetchCart } from '@/store/cartSlice';
import type { OrderRequestDTO, PaymentMethod } from '@/types/models';
import { getErrorMessage } from '@/utils/errors';

export function useMyOrders() {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: ['orders', 'mine'],
    queryFn: orderApi.myOrders,
    enabled: isAuthenticated,
  });
}

export function useOrder(orderId: number | undefined) {
  return useQuery({
    queryKey: ['orders', orderId],
    queryFn: () => orderApi.getById(orderId as number),
    enabled: orderId !== undefined,
  });
}

export function usePlaceOrder() {
  const queryClient = useQueryClient();
  const dispatch = useAppDispatch();
  const { showToast } = useToast();

  return useMutation({
    mutationFn: ({ paymentMethod, payload }: { paymentMethod: PaymentMethod; payload: OrderRequestDTO }) =>
      orderApi.placeOrder(paymentMethod, payload),
    onSuccess: () => {
      dispatch(fetchCart());
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
    onError: (error) => showToast(getErrorMessage(error), 'error'),
  });
}

export function useAdminOrders() {
  return useQuery({
    queryKey: ['admin', 'orders'],
    queryFn: orderApi.adminList,
  });
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  return useMutation({
    mutationFn: ({ orderId, status }: { orderId: number; status: string }) =>
      orderApi.updateStatus(orderId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'orders'] });
      showToast('Order status updated', 'success');
    },
    onError: (error) => showToast(getErrorMessage(error), 'error'),
  });
}

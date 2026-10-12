import { useParams } from 'react-router-dom';
import { OrderDetailCard } from '@/components/order/OrderDetailCard';
import { ErrorState } from '@/components/ui/EmptyState';
import { ProductDetailSkeleton } from '@/components/ui/Skeleton';
import { useOrder, useUpdateOrderStatus } from '@/hooks/useOrders';
import { ORDER_STATUSES } from './AdminOrders';

export default function AdminOrderDetail() {
  const { orderId } = useParams();
  const { data: order, isLoading, isError, refetch } = useOrder(Number(orderId));
  const updateStatus = useUpdateOrderStatus();

  if (isLoading) return <ProductDetailSkeleton />;
  if (isError || !order) {
    return <ErrorState title="Order not found" onRetry={() => refetch()} />;
  }

  return (
    <OrderDetailCard order={order}>
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-ink-faint">Update status</label>
        <select
          value={order.orderStatus}
          onChange={(e) => updateStatus.mutate({ orderId: order.orderId, status: e.target.value })}
          className="h-10 rounded-full border border-border-strong bg-surface px-4 text-sm font-medium text-ink"
        >
          {!ORDER_STATUSES.includes(order.orderStatus) && <option value={order.orderStatus}>{order.orderStatus}</option>}
          {ORDER_STATUSES.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      </div>
    </OrderDetailCard>
  );
}

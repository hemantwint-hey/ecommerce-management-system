import { Link } from 'react-router-dom';
import { OrderStatusBadge } from '@/components/ui/Badge';
import { EmptyState, ErrorState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { useMyOrders } from '@/hooks/useOrders';
import { formatDate, formatPrice } from '@/utils/format';

export default function AccountOrders() {
  const ordersQuery = useMyOrders();

  if (ordersQuery.isLoading) {
    return (
      <div className="flex flex-col gap-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-20 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (ordersQuery.isError) {
    return <ErrorState description="We couldn't load your orders." onRetry={() => ordersQuery.refetch()} />;
  }

  if (!ordersQuery.data || ordersQuery.data.length === 0) {
    return (
      <EmptyState
        title="No orders yet"
        description="Your future purchases will appear here."
        action={
          <Link to="/shop" className="text-sm font-semibold text-accent hover:underline">
            Explore products →
          </Link>
        }
      />
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {ordersQuery.data.map((order) => (
        <Link
          key={order.orderId}
          to={`/account/orders/${order.orderId}`}
          className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-surface p-4 transition-colors hover:border-ink"
        >
          <div>
            <p className="text-sm font-medium text-ink">Order #{order.orderId}</p>
            <p className="text-xs text-ink-muted">
              {formatDate(order.orderDate)} · {order.orderItems.length} item
              {order.orderItems.length === 1 ? '' : 's'}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <OrderStatusBadge status={order.orderStatus} />
            <p className="text-sm font-semibold text-ink">{formatPrice(order.totalAmount)}</p>
          </div>
        </Link>
      ))}
    </div>
  );
}

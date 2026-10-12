import { Link } from 'react-router-dom';
import { OrderStatusBadge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { useAuth } from '@/hooks/useAuth';
import { useMyOrders } from '@/hooks/useOrders';
import { formatDate, formatPrice } from '@/utils/format';

export default function AccountOverview() {
  const { user } = useAuth();
  const ordersQuery = useMyOrders();
  const recentOrders = (ordersQuery.data ?? []).slice(0, 3);

  return (
    <div className="flex flex-col gap-8">
      <div className="rounded-2xl border border-border bg-surface p-6">
        <p className="text-sm text-ink-muted">Signed in as</p>
        <p className="font-display text-xl text-ink">{user?.username}</p>
      </div>

      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-ink">Recent orders</h2>
          <Link to="/account/orders" className="text-sm font-semibold text-accent hover:underline">
            View all →
          </Link>
        </div>

        {ordersQuery.isLoading && (
          <div className="flex flex-col gap-3">
            <Skeleton className="h-16 w-full rounded-xl" />
            <Skeleton className="h-16 w-full rounded-xl" />
          </div>
        )}

        {ordersQuery.data && recentOrders.length === 0 && (
          <p className="rounded-xl border border-dashed border-border py-10 text-center text-sm text-ink-muted">
            No orders yet.
          </p>
        )}

        <div className="flex flex-col gap-3">
          {recentOrders.map((order) => (
            <Link
              key={order.orderId}
              to={`/account/orders/${order.orderId}`}
              className="flex items-center justify-between rounded-xl border border-border bg-surface p-4 transition-colors hover:border-ink"
            >
              <div>
                <p className="text-sm font-medium text-ink">#{order.orderId}</p>
                <p className="text-xs text-ink-muted">{formatDate(order.orderDate)}</p>
              </div>
              <div className="flex items-center gap-4">
                <OrderStatusBadge status={order.orderStatus} />
                <p className="text-sm font-semibold text-ink">{formatPrice(order.totalAmount)}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

import { OrderStatusBadge } from '@/components/ui/Badge';
import { ErrorState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { useSellerOrders } from '@/hooks/useSeller';
import { formatDate, formatPrice } from '@/utils/format';

export default function SellerOrders() {
  const ordersQuery = useSellerOrders();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-3xl text-ink">Orders</h1>
        <p className="mt-1 text-sm text-ink-muted">
          Orders that include your products. Only your items and your share of the total are shown.
        </p>
      </div>

      {ordersQuery.isLoading && (
        <div className="flex flex-col gap-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-28 w-full rounded-2xl" />
          ))}
        </div>
      )}

      {ordersQuery.isError && <ErrorState description="Couldn't load your orders." onRetry={() => ordersQuery.refetch()} />}

      {ordersQuery.data?.length === 0 && (
        <p className="rounded-2xl border border-border bg-surface px-5 py-12 text-center text-sm text-ink-muted">
          No orders for your products yet.
        </p>
      )}

      <div className="flex flex-col gap-4">
        {ordersQuery.data?.map((order) => (
          <div key={order.orderId} className="rounded-2xl border border-border bg-surface p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-medium text-ink">Order #{order.orderId}</p>
                <p className="text-xs text-ink-muted">
                  {formatDate(order.orderDate)} · {order.email}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <OrderStatusBadge status={order.orderStatus} />
                <span className="font-display text-lg text-ink">{formatPrice(order.totalAmount)}</span>
              </div>
            </div>
            <ul className="mt-4 flex flex-col gap-2 border-t border-border pt-4 text-sm">
              {order.orderItems.map((item) => (
                <li key={item.orderItemId} className="flex justify-between gap-4">
                  <span className="text-ink">
                    {item.product.productName} <span className="text-ink-muted">× {item.quantity}</span>
                  </span>
                  <span className="text-ink-muted">{formatPrice(item.orderedProductPrice * item.quantity)}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

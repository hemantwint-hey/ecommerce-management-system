import { Link } from 'react-router-dom';
import { OrderStatusBadge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { useAddress } from '@/hooks/useAddress';
import type { OrderDTO } from '@/types/models';
import { formatDate, formatPrice } from '@/utils/format';
import { productImageUrl } from '@/utils/images';

export function OrderDetailCard({ order, children }: { order: OrderDTO; children?: React.ReactNode }) {
  const addressQuery = useAddress(order.addressId);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-start justify-between gap-4 rounded-2xl border border-border bg-surface p-6">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-ink-faint">Order</p>
          <p className="font-display text-xl text-ink">#{order.orderId}</p>
          <p className="mt-1 text-sm text-ink-muted">Placed on {formatDate(order.orderDate)}</p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <OrderStatusBadge status={order.orderStatus} />
          <p className="text-lg font-semibold text-ink">{formatPrice(order.totalAmount)}</p>
        </div>
        {children}
      </div>

      <div>
        <h2 className="mb-3 text-sm font-semibold text-ink">Items</h2>
        <div className="flex flex-col gap-3">
          {order.orderItems.map((item) => (
            <div key={item.orderItemId} className="flex items-center gap-4 rounded-xl border border-border bg-surface p-4">
              <Link
                to={`/products/${item.product.productId}`}
                className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-surface-muted"
              >
                {productImageUrl(item.product.image) && (
                  <img
                    src={productImageUrl(item.product.image) as string}
                    alt={item.product.productName}
                    className="h-full w-full object-cover"
                  />
                )}
              </Link>
              <div className="min-w-0 flex-1">
                <p className="line-clamp-1 text-sm font-medium text-ink">{item.product.productName}</p>
                <p className="text-xs text-ink-muted">Qty {item.quantity}</p>
              </div>
              <p className="text-sm font-semibold text-ink">{formatPrice(item.orderedProductPrice * item.quantity)}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="rounded-xl border border-border bg-surface p-5">
          <h3 className="mb-2 text-sm font-semibold text-ink">Shipping address</h3>
          {addressQuery.isLoading && <Skeleton className="h-16 w-full" />}
          {addressQuery.data && (
            <p className="text-sm text-ink-muted">
              {addressQuery.data.buildingName}, {addressQuery.data.street}, {addressQuery.data.city},{' '}
              {addressQuery.data.state} {addressQuery.data.pincode}, {addressQuery.data.country}
            </p>
          )}
        </div>
        <div className="rounded-xl border border-border bg-surface p-5">
          <h3 className="mb-2 text-sm font-semibold text-ink">Payment</h3>
          <p className="text-sm text-ink-muted">Method: {order.payment?.paymentMethod ?? '—'}</p>
          {order.payment?.pgStatus && <p className="text-sm text-ink-muted">Status: {order.payment.pgStatus}</p>}
        </div>
      </div>
    </div>
  );
}

import { Link } from 'react-router-dom';
import { OrderStatusBadge, StockBadge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { useSellerOrders, useSellerProducts } from '@/hooks/useSeller';
import { formatDate, formatPrice } from '@/utils/format';

export default function SellerDashboard() {
  const ordersQuery = useSellerOrders();
  const productsQuery = useSellerProducts({ pageNumber: 0, pageSize: 100, sortBy: 'quantity', sortOrder: 'asc' });

  const orders = ordersQuery.data ?? [];
  const products = productsQuery.data?.content ?? [];
  const revenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
  const unitsSold = orders.reduce(
    (sum, order) => sum + order.orderItems.reduce((count, item) => count + item.quantity, 0),
    0,
  );
  const lowStock = products.filter((product) => product.quantity <= 5).slice(0, 5);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-display text-3xl text-ink">Seller dashboard</h1>
        <p className="mt-1 text-sm text-ink-muted">How your products are doing.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Your revenue" value={ordersQuery.isLoading ? undefined : formatPrice(revenue)} />
        <KpiCard label="Orders" value={ordersQuery.isLoading ? undefined : orders.length.toString()} />
        <KpiCard label="Units sold" value={ordersQuery.isLoading ? undefined : unitsSold.toString()} />
        <KpiCard
          label="Products listed"
          value={productsQuery.isLoading ? undefined : (productsQuery.data?.totalElements ?? 0).toString()}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-border bg-surface">
          <div className="flex items-center justify-between border-b border-border px-6 py-4">
            <h2 className="text-sm font-semibold text-ink">Recent orders</h2>
            <Link to="/seller/orders" className="text-sm font-semibold text-accent hover:underline">
              View all →
            </Link>
          </div>
          <ul className="divide-y divide-border">
            {ordersQuery.isLoading && (
              <li className="px-6 py-4">
                <Skeleton className="h-5 w-full" />
              </li>
            )}
            {orders.slice(0, 5).map((order) => (
              <li key={order.orderId} className="flex items-center justify-between gap-3 px-6 py-3 text-sm">
                <span className="font-medium text-ink">#{order.orderId}</span>
                <span className="text-ink-muted">{formatDate(order.orderDate)}</span>
                <OrderStatusBadge status={order.orderStatus} />
                <span className="font-medium text-ink">{formatPrice(order.totalAmount)}</span>
              </li>
            ))}
            {!ordersQuery.isLoading && orders.length === 0 && (
              <li className="px-6 py-10 text-center text-sm text-ink-muted">No orders yet.</li>
            )}
          </ul>
        </section>

        <section className="rounded-2xl border border-border bg-surface">
          <div className="flex items-center justify-between border-b border-border px-6 py-4">
            <h2 className="text-sm font-semibold text-ink">Low stock</h2>
            <Link to="/seller/products" className="text-sm font-semibold text-accent hover:underline">
              Manage →
            </Link>
          </div>
          <ul className="divide-y divide-border">
            {productsQuery.isLoading && (
              <li className="px-6 py-4">
                <Skeleton className="h-5 w-full" />
              </li>
            )}
            {lowStock.map((product) => (
              <li key={product.productId} className="flex items-center justify-between gap-3 px-6 py-3 text-sm">
                <span className="line-clamp-1 text-ink">{product.productName}</span>
                <StockBadge quantity={product.quantity} />
              </li>
            ))}
            {!productsQuery.isLoading && lowStock.length === 0 && (
              <li className="px-6 py-10 text-center text-sm text-ink-muted">All your products are well stocked.</li>
            )}
          </ul>
        </section>
      </div>
    </div>
  );
}

function KpiCard({ label, value }: { label: string; value?: string }) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-5">
      <p className="text-xs font-medium uppercase tracking-wide text-ink-faint">{label}</p>
      {value === undefined ? (
        <Skeleton className="mt-2 h-7 w-20" />
      ) : (
        <p className="mt-1 font-display text-2xl text-ink">{value}</p>
      )}
    </div>
  );
}

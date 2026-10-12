import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { OrderStatusBadge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { categoryApi } from '@/api/categoryApi';
import { productApi } from '@/api/productApi';
import { useAdminOrders } from '@/hooks/useOrders';
import { useAdminUsers } from '@/hooks/useAdmin';
import { formatDate, formatPrice } from '@/utils/format';

export default function AdminDashboard() {
  const ordersQuery = useAdminOrders();
  const usersQuery = useAdminUsers();
  const productsCountQuery = useQuery({
    queryKey: ['admin', 'products-count'],
    queryFn: () => productApi.list({ pageSize: 1 }).then((r) => r.totalElements),
  });
  const categoriesCountQuery = useQuery({
    queryKey: ['admin', 'categories-count'],
    queryFn: () => categoryApi.list({ pageSize: 1 }).then((r) => r.totalElements),
  });

  const orders = ordersQuery.data ?? [];
  const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
  const recentOrders = [...orders]
    .sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime())
    .slice(0, 6);

  const dailyRevenue = buildDailySeries(orders);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-display text-3xl text-ink">Dashboard</h1>
        <p className="mt-1 text-sm text-ink-muted">A live snapshot of your store.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <KpiCard label="Revenue" value={ordersQuery.isLoading ? undefined : formatPrice(totalRevenue)} />
        <KpiCard label="Orders" value={ordersQuery.isLoading ? undefined : orders.length.toString()} />
        <KpiCard label="Users" value={usersQuery.isLoading ? undefined : (usersQuery.data?.length ?? 0).toString()} />
        <KpiCard
          label="Products"
          value={productsCountQuery.isLoading ? undefined : (productsCountQuery.data ?? 0).toString()}
        />
        <KpiCard
          label="Categories"
          value={categoriesCountQuery.isLoading ? undefined : (categoriesCountQuery.data ?? 0).toString()}
        />
      </div>

      <div className="rounded-2xl border border-border bg-surface p-6">
        <h2 className="mb-6 text-sm font-semibold text-ink">Revenue, last 7 days</h2>
        <MiniBarChart data={dailyRevenue} />
      </div>

      <div className="rounded-2xl border border-border bg-surface">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h2 className="text-sm font-semibold text-ink">Recent orders</h2>
          <Link to="/admin/orders" className="text-sm font-semibold text-accent hover:underline">
            View all →
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-xs text-ink-faint">
                <th className="px-6 py-3 font-medium">Order</th>
                <th className="px-6 py-3 font-medium">Date</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 text-right font-medium">Total</th>
              </tr>
            </thead>
            <tbody>
              {ordersQuery.isLoading &&
                [1, 2, 3].map((i) => (
                  <tr key={i}>
                    <td className="px-6 py-4" colSpan={4}>
                      <Skeleton className="h-5 w-full" />
                    </td>
                  </tr>
                ))}
              {recentOrders.map((order) => (
                <tr key={order.orderId} className="border-t border-border">
                  <td className="px-6 py-4">
                    <Link to={`/admin/orders/${order.orderId}`} className="font-medium text-ink hover:underline">
                      #{order.orderId}
                    </Link>
                  </td>
                  <td className="px-6 py-4 text-ink-muted">{formatDate(order.orderDate)}</td>
                  <td className="px-6 py-4">
                    <OrderStatusBadge status={order.orderStatus} />
                  </td>
                  <td className="px-6 py-4 text-right font-medium text-ink">{formatPrice(order.totalAmount)}</td>
                </tr>
              ))}
              {!ordersQuery.isLoading && recentOrders.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-10 text-center text-ink-muted">
                    No orders yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
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

function buildDailySeries(orders: { orderDate: string; totalAmount: number }[]) {
  const days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    return date.toISOString().slice(0, 10);
  });
  return days.map((day) => ({
    day,
    total: orders.filter((order) => order.orderDate === day).reduce((sum, order) => sum + order.totalAmount, 0),
  }));
}

function MiniBarChart({ data }: { data: { day: string; total: number }[] }) {
  const max = Math.max(...data.map((d) => d.total), 1);
  return (
    <div className="flex h-32 items-end gap-3">
      {data.map((point) => (
        <div key={point.day} className="flex flex-1 flex-col items-center gap-2">
          <div className="flex h-24 w-full items-end">
            <div
              className={`w-full rounded-md transition-all ${point.total > 0 ? 'bg-accent' : 'bg-surface-muted'}`}
              style={{ height: `${Math.max((point.total / max) * 100, 3)}%` }}
            />
          </div>
          <span className="text-[10px] text-ink-faint">{point.day.slice(5)}</span>
        </div>
      ))}
    </div>
  );
}

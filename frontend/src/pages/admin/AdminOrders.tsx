import { Link } from 'react-router-dom';
import { ErrorState } from '@/components/ui/EmptyState';
import { TableRowSkeleton } from '@/components/ui/Skeleton';
import { useAdminOrders, useUpdateOrderStatus } from '@/hooks/useOrders';
import { formatDate, formatPrice } from '@/utils/format';

export const ORDER_STATUSES = ['Order Accepted !', 'Processing', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled'];

export default function AdminOrders() {
  const ordersQuery = useAdminOrders();
  const updateStatus = useUpdateOrderStatus();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-3xl text-ink">Orders</h1>
        <p className="mt-1 text-sm text-ink-muted">Track and update every order.</p>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-border bg-surface">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="text-xs text-ink-faint">
              <th className="px-5 py-3 font-medium">Order</th>
              <th className="px-5 py-3 font-medium">Customer</th>
              <th className="px-5 py-3 font-medium">Date</th>
              <th className="px-5 py-3 font-medium">Total</th>
              <th className="px-5 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {ordersQuery.isLoading && Array.from({ length: 5 }).map((_, i) => <TableRowSkeleton key={i} columns={5} />)}
            {ordersQuery.data?.map((order) => (
              <tr key={order.orderId} className="border-t border-border">
                <td className="px-5 py-3">
                  <Link to={`/admin/orders/${order.orderId}`} className="font-medium text-ink hover:underline">
                    #{order.orderId}
                  </Link>
                </td>
                <td className="px-5 py-3 text-ink-muted">{order.email}</td>
                <td className="px-5 py-3 text-ink-muted">{formatDate(order.orderDate)}</td>
                <td className="px-5 py-3 font-medium text-ink">{formatPrice(order.totalAmount)}</td>
                <td className="px-5 py-3">
                  <select
                    value={order.orderStatus}
                    onChange={(e) => updateStatus.mutate({ orderId: order.orderId, status: e.target.value })}
                    className="h-9 rounded-full border border-border-strong bg-surface px-3 text-xs font-medium text-ink"
                  >
                    {!ORDER_STATUSES.includes(order.orderStatus) && (
                      <option value={order.orderStatus}>{order.orderStatus}</option>
                    )}
                    {ORDER_STATUSES.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {ordersQuery.isError && (
          <div className="p-6">
            <ErrorState description="Couldn't load orders." onRetry={() => ordersQuery.refetch()} />
          </div>
        )}

        {ordersQuery.data && ordersQuery.data.length === 0 && (
          <p className="px-5 py-12 text-center text-sm text-ink-muted">No orders placed yet.</p>
        )}
      </div>
    </div>
  );
}

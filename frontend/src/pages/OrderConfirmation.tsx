import { Link, useParams } from 'react-router-dom';
import { OrderDetailCard } from '@/components/order/OrderDetailCard';
import { ErrorState } from '@/components/ui/EmptyState';
import { ProductDetailSkeleton } from '@/components/ui/Skeleton';
import { useOrder } from '@/hooks/useOrders';

export default function OrderConfirmation() {
  const { orderId } = useParams();
  const { data: order, isLoading, isError, refetch } = useOrder(Number(orderId));

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col items-center gap-3 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-success-soft text-success">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <h1 className="font-display text-3xl text-ink">Order confirmed</h1>
        <p className="text-sm text-ink-muted">Thank you — we've received your order and we're getting it ready.</p>
      </div>

      {isLoading && <ProductDetailSkeleton />}
      {isError && <ErrorState description="We couldn't load your order confirmation." onRetry={() => refetch()} />}
      {order && <OrderDetailCard order={order} />}

      <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
        <Link
          to="/account/orders"
          className="inline-flex h-11 items-center justify-center rounded-full border border-border-strong px-6 text-sm font-medium text-ink"
        >
          View my orders
        </Link>
        <Link
          to="/shop"
          className="inline-flex h-11 items-center justify-center rounded-full bg-accent px-6 text-sm font-medium text-white"
        >
          Continue shopping
        </Link>
      </div>
    </div>
  );
}

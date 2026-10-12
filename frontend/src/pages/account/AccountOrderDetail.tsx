import { useParams } from 'react-router-dom';
import { OrderDetailCard } from '@/components/order/OrderDetailCard';
import { ErrorState } from '@/components/ui/EmptyState';
import { ProductDetailSkeleton } from '@/components/ui/Skeleton';
import { useOrder } from '@/hooks/useOrders';

export default function AccountOrderDetail() {
  const { orderId } = useParams();
  const { data: order, isLoading, isError, refetch } = useOrder(Number(orderId));

  if (isLoading) return <ProductDetailSkeleton />;
  if (isError || !order) {
    return <ErrorState title="Order not found" description="We couldn't load this order." onRetry={() => refetch()} />;
  }

  return <OrderDetailCard order={order} />;
}

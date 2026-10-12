import { Link, useNavigate } from 'react-router-dom';
import { QuantitySelector } from '@/components/ui/QuantitySelector';
import { EmptyState, ErrorState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { useCart } from '@/hooks/useCart';
import { formatPrice } from '@/utils/format';
import { productImageUrl } from '@/utils/images';

export default function Cart() {
  const { cart, isLoading, isError, isUpdating, isRemoving, changeQuantity, removeFromCart } = useCart();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <Skeleton className="mb-8 h-8 w-48" />
        <div className="flex flex-col gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 w-full rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <ErrorState description="We couldn't load your cart." />
      </div>
    );
  }

  if (cart.products.length === 0) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
        <EmptyState
          title="Your cart is empty"
          description="Looks like you haven't added anything yet."
          action={
            <Link
              to="/shop"
              className="inline-flex h-11 items-center rounded-full bg-accent px-6 text-sm font-medium text-white hover:bg-accent-hover"
            >
              Start shopping →
            </Link>
          }
        />
      </div>
    );
  }

  const subtotal = cart.products.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discount = subtotal - cart.totalPrice;

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="mb-8 font-display text-3xl text-ink">
        Your cart <span className="text-ink-muted">({cart.products.length} items)</span>
      </h1>

      <div className="grid gap-10 lg:grid-cols-3">
        <div className="flex flex-col gap-4 lg:col-span-2">
          {cart.products.map((item) => {
            const imageUrl = productImageUrl(item.image);
            return (
              <div
                key={item.productId}
                className="flex animate-fade-in items-center gap-4 rounded-xl border border-border bg-surface p-4"
              >
                <Link to={`/products/${item.productId}`} className="h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-surface-muted">
                  {imageUrl && <img src={imageUrl} alt={item.productName} className="h-full w-full object-cover" />}
                </Link>
                <div className="min-w-0 flex-1">
                  <Link to={`/products/${item.productId}`} className="line-clamp-1 text-sm font-medium text-ink hover:underline">
                    {item.productName}
                  </Link>
                  <p className="mt-1 text-sm text-ink-muted">{formatPrice(item.specialPrice)} each</p>
                  <div className="mt-3">
                    <QuantitySelector
                      size="sm"
                      quantity={item.quantity}
                      onIncrease={() => changeQuantity(item.productId, 'increase')}
                      onDecrease={() => changeQuantity(item.productId, 'decrease')}
                      disabled={isUpdating}
                    />
                  </div>
                </div>
                <div className="flex flex-col items-end gap-3">
                  <p className="text-sm font-semibold text-ink">{formatPrice(item.specialPrice * item.quantity)}</p>
                  <button
                    onClick={() => removeFromCart(item.productId)}
                    disabled={isRemoving}
                    aria-label={`Remove ${item.productName}`}
                    className="cursor-pointer text-ink-faint transition-colors hover:text-error disabled:opacity-50"
                  >
                    <IconTrash />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="h-fit rounded-2xl border border-border bg-surface p-6 shadow-card">
          <h2 className="mb-4 font-display text-lg text-ink">Order summary</h2>
          <dl className="flex flex-col gap-2.5 text-sm">
            <div className="flex justify-between">
              <dt className="text-ink-muted">Subtotal</dt>
              <dd className="text-ink">{formatPrice(subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-ink-muted">Shipping</dt>
              <dd className="text-success">Free</dd>
            </div>
            {discount > 0 && (
              <div className="flex justify-between">
                <dt className="text-ink-muted">Discount</dt>
                <dd className="text-success">−{formatPrice(discount)}</dd>
              </div>
            )}
            <div className="my-1 h-px bg-border" />
            <div className="flex justify-between text-base font-semibold">
              <dt className="text-ink">Total</dt>
              <dd className="text-ink">{formatPrice(cart.totalPrice)}</dd>
            </div>
          </dl>
          <button
            onClick={() => navigate('/checkout')}
            className="mt-6 h-12 w-full cursor-pointer rounded-full bg-accent text-sm font-semibold text-white transition-colors hover:bg-accent-hover"
          >
            Proceed to checkout →
          </button>
        </div>
      </div>
    </div>
  );
}

function IconTrash() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M5 7h14M9 7V5a2 2 0 012-2h2a2 2 0 012 2v2m2 0-1 13a1 1 0 01-1 1H8a1 1 0 01-1-1L6 7h12z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

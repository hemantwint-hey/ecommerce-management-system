import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PriceDisplay } from '@/components/ui/PriceDisplay';
import { QuantitySelector } from '@/components/ui/QuantitySelector';
import { StockBadge } from '@/components/ui/Badge';
import { ProductDetailSkeleton } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui/EmptyState';
import { useAuth } from '@/hooks/useAuth';
import { useCart } from '@/hooks/useCart';
import { useProduct } from '@/hooks/useProducts';
import { productImageUrl } from '@/utils/images';

export default function ProductDetail() {
  const { productId } = useParams();
  const id = Number(productId);
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { addToCart, isAdding } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [justAdded, setJustAdded] = useState(false);

  const { data: product, isLoading, isError, refetch } = useProduct(id);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <ProductDetailSkeleton />
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <ErrorState
          title="We couldn't find this product"
          description="It may have been removed or is no longer available."
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  const imageUrl = productImageUrl(product.image);
  const outOfStock = product.quantity <= 0;

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: `/products/${id}` } } });
      return;
    }
    addToCart(id, quantity).then((added) => {
      if (!added) return;
      setJustAdded(true);
      setTimeout(() => setJustAdded(false), 1800);
    });
  };

  const handleBuyNow = () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: `/products/${id}` } } });
      return;
    }
    addToCart(id, quantity).then((added) => {
      if (added) navigate('/checkout');
    });
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
        <div className="aspect-square overflow-hidden rounded-2xl bg-surface-muted">
          {imageUrl ? (
            <img src={imageUrl} alt={product.productName} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-ink-faint">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M4 5a1 1 0 011-1h14a1 1 0 011 1v14a1 1 0 01-1 1H5a1 1 0 01-1-1V5z"
                  stroke="currentColor"
                  strokeWidth="1.2"
                />
                <path d="M4 16l4.5-4.5a2 2 0 012.8 0L16 16" stroke="currentColor" strokeWidth="1.2" />
                <circle cx="9" cy="9" r="1.6" stroke="currentColor" strokeWidth="1.2" />
              </svg>
            </div>
          )}
        </div>

        <div className="flex animate-slide-up flex-col gap-6">
          <div>
            <h1 className="font-display text-3xl text-ink sm:text-4xl">{product.productName}</h1>
            <div className="mt-3">
              <PriceDisplay
                price={product.price}
                specialPrice={product.specialPrice}
                discount={product.discount}
                size="lg"
              />
            </div>
          </div>

          <StockBadge quantity={product.quantity} />

          <p className="text-sm leading-relaxed text-ink-muted">{product.description}</p>

          {!outOfStock && (
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-ink">Quantity</span>
              <QuantitySelector
                quantity={quantity}
                onIncrease={() => setQuantity((q) => Math.min(q + 1, product.quantity))}
                onDecrease={() => setQuantity((q) => Math.max(q - 1, 1))}
                max={product.quantity}
              />
            </div>
          )}

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              onClick={handleAddToCart}
              disabled={outOfStock || isAdding}
              className={`h-13 flex-1 cursor-pointer rounded-full border border-ink text-base font-medium transition-colors disabled:cursor-not-allowed disabled:border-border disabled:text-ink-faint ${
                justAdded ? 'bg-success text-white border-success' : 'bg-transparent text-ink hover:bg-ink hover:text-white'
              }`}
            >
              {outOfStock ? 'Out of stock' : justAdded ? '✓ Added' : 'Add to cart'}
            </button>
            <button
              onClick={handleBuyNow}
              disabled={outOfStock || isAdding}
              className="h-13 flex-1 cursor-pointer rounded-full bg-accent text-base font-medium text-white transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:bg-ink-faint"
            >
              Buy now
            </button>
          </div>

          <div className="border-t border-border pt-4">
            <Accordion title="Shipping & returns">
              Free shipping on every order. If something isn't right, you can return it within 30 days for a full
              refund.
            </Accordion>
          </div>
        </div>
      </div>
    </div>
  );
}

function Accordion({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <details className="group">
      <summary className="flex cursor-pointer list-none items-center justify-between py-2 text-sm font-medium text-ink">
        {title}
        <span className="text-ink-muted transition-transform group-open:rotate-45">+</span>
      </summary>
      <p className="pb-2 text-sm text-ink-muted">{children}</p>
    </details>
  );
}

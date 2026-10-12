import { Link } from 'react-router-dom';
import { PriceDisplay } from '@/components/ui/PriceDisplay';
import { useAuth } from '@/hooks/useAuth';
import { useCart } from '@/hooks/useCart';
import type { ProductDTO } from '@/types/models';
import { productImageUrl } from '@/utils/images';

export function ProductCard({ product }: { product: ProductDTO }) {
  const { isAuthenticated } = useAuth();
  const { addToCart, isAdding } = useCart();
  const imageUrl = productImageUrl(product.image);
  const outOfStock = product.quantity <= 0;

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product.productId, 1);
  };

  return (
    <Link to={`/products/${product.productId}`} className="group flex flex-col gap-3">
      <div className="relative aspect-4/5 overflow-hidden rounded-xl bg-surface-muted">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={product.productName}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-ink-faint">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M4 5a1 1 0 011-1h14a1 1 0 011 1v14a1 1 0 01-1 1H5a1 1 0 01-1-1V5z"
                stroke="currentColor"
                strokeWidth="1.4"
              />
              <path d="M4 16l4.5-4.5a2 2 0 012.8 0L16 16" stroke="currentColor" strokeWidth="1.4" />
              <circle cx="9" cy="9" r="1.6" stroke="currentColor" strokeWidth="1.4" />
            </svg>
          </div>
        )}

        {outOfStock && (
          <span className="absolute left-3 top-3 rounded-full bg-ink/85 px-2.5 py-1 text-[11px] font-semibold text-white">
            Out of stock
          </span>
        )}

        {isAuthenticated && !outOfStock && (
          <button
            onClick={handleAdd}
            disabled={isAdding}
            className="absolute inset-x-3 bottom-3 translate-y-2 rounded-full bg-surface/95 py-2.5 text-xs font-semibold text-ink opacity-0 shadow-card backdrop-blur transition-all duration-200 group-hover:translate-y-0 group-hover:opacity-100 hover:bg-ink hover:text-white disabled:opacity-60"
          >
            Add to cart
          </button>
        )}
      </div>

      <div className="flex flex-col gap-1">
        <h3 className="line-clamp-1 text-sm font-medium text-ink">{product.productName}</h3>
        <PriceDisplay price={product.price} specialPrice={product.specialPrice} discount={product.discount} />
      </div>
    </Link>
  );
}

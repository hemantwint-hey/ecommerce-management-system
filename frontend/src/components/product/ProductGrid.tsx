import type { ProductDTO } from '@/types/models';
import { ProductCard } from './ProductCard';

export function ProductGrid({ products }: { products: ProductDTO[] }) {
  return (
    <div className="grid animate-fade-in grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product.productId} product={product} />
      ))}
    </div>
  );
}

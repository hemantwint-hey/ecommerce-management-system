import { ProductManager } from '@/components/admin/ProductManager';
import { useSellerProductMutations, useSellerProducts } from '@/hooks/useSeller';

export default function SellerProducts() {
  return (
    <ProductManager
      title="My products"
      subtitle="Products you list are visible in the store. You can only edit your own."
      useProductList={useSellerProducts}
      useMutations={useSellerProductMutations}
      showCategoryFilter={false}
      emptyMessage="You haven't listed any products yet."
    />
  );
}

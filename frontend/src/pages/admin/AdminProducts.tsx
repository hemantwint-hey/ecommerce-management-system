import { ProductManager } from '@/components/admin/ProductManager';
import { useAdminProductMutations } from '@/hooks/useAdmin';
import { useProducts } from '@/hooks/useProducts';

export default function AdminProducts() {
  return (
    <ProductManager
      title="Products"
      subtitle="Manage your catalog and stock."
      useProductList={useProducts}
      useMutations={useAdminProductMutations}
    />
  );
}

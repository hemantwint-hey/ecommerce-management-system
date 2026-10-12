import { useQuery } from '@tanstack/react-query';
import { sellerApi } from '@/api/sellerApi';
import type { ShopFilters } from './useProducts';
import { useProductMutations } from './useAdmin';

/** Same signature as useProducts so ProductManager can use either; sellers have no category filter. */
export function useSellerProducts({ categoryId: _categoryId, keyword: _keyword, ...params }: ShopFilters) {
  return useQuery({
    queryKey: ['seller', 'products', params],
    queryFn: () => sellerApi.products.list(params),
    placeholderData: (previousData) => previousData,
  });
}

export function useSellerOrders() {
  return useQuery({
    queryKey: ['seller', 'orders'],
    queryFn: sellerApi.orders,
  });
}

export function useSellerProductMutations() {
  return useProductMutations(sellerApi.products);
}

import { useQuery } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { productApi, type ProductQueryParams } from '@/api/productApi';
import type { ProductResponse } from '@/types/models';

const EMPTY_RESPONSE: ProductResponse = {
  content: [],
  pageNumber: 0,
  pageSize: 0,
  totalElements: 0,
  totalPages: 0,
  lastPage: true,
};

export interface ShopFilters extends ProductQueryParams {
  categoryId?: number;
  keyword?: string;
}

export function useProducts({ categoryId, keyword, ...params }: ShopFilters) {
  return useQuery({
    queryKey: ['products', { categoryId, keyword, ...params }],
    queryFn: async () => {
      try {
        if (keyword && keyword.trim().length > 0) {
          return await productApi.search(keyword.trim(), params);
        }
        if (categoryId) {
          return await productApi.byCategory(categoryId, params);
        }
        return await productApi.list(params);
      } catch (error) {
        // The keyword-search endpoint throws a 400 APIException when nothing matches;
        // that's an empty result, not a failure the UI should treat as an error state.
        if (error instanceof AxiosError && error.response?.status === 400 && keyword) {
          return EMPTY_RESPONSE;
        }
        throw error;
      }
    },
    placeholderData: (previousData) => previousData,
  });
}

export function useProduct(productId: number | undefined) {
  return useQuery({
    queryKey: ['product', productId],
    queryFn: () => productApi.getById(productId as number),
    enabled: productId !== undefined && !Number.isNaN(productId),
  });
}

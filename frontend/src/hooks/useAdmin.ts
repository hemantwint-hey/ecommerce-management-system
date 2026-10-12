import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/api/adminApi';
import { productApi } from '@/api/productApi';
import { useToast } from '@/contexts/ToastContext';
import type { ProductDTO } from '@/types/models';
import { getErrorMessage } from '@/utils/errors';

export function useAdminUsers() {
  return useQuery({
    queryKey: ['admin', 'users'],
    queryFn: adminApi.users,
  });
}

export function useUpdateUserRoles() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  return useMutation({
    mutationFn: ({ userId, roles }: { userId: number; roles: string[] }) =>
      adminApi.updateUserRoles(userId, roles),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      showToast('User role updated', 'success');
    },
    onError: (error) => showToast(getErrorMessage(error), 'error'),
  });
}

/** The write endpoints a product manager needs; implemented by both the admin and the seller APIs. */
export interface ProductWriteApi {
  create: (categoryId: number, product: Partial<ProductDTO>) => Promise<ProductDTO>;
  update: (productId: number, product: Partial<ProductDTO>) => Promise<ProductDTO>;
  remove: (productId: number) => Promise<ProductDTO>;
  uploadImage: (productId: number, file: File) => Promise<ProductDTO>;
}

export function useAdminProductMutations() {
  return useProductMutations(productApi);
}

export function useProductMutations(api: ProductWriteApi) {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['products'] });
    queryClient.invalidateQueries({ queryKey: ['product'] });
    queryClient.invalidateQueries({ queryKey: ['seller'] });
  };

  const create = useMutation({
    mutationFn: ({ categoryId, product }: { categoryId: number; product: Partial<ProductDTO> }) =>
      api.create(categoryId, product),
    onSuccess: () => {
      invalidate();
      showToast('Product created', 'success');
    },
    onError: (error) => showToast(getErrorMessage(error), 'error'),
  });

  const update = useMutation({
    mutationFn: ({ productId, product }: { productId: number; product: Partial<ProductDTO> }) =>
      api.update(productId, product),
    onSuccess: () => {
      invalidate();
      showToast('Product updated', 'success');
    },
    onError: (error) => showToast(getErrorMessage(error), 'error'),
  });

  const remove = useMutation({
    mutationFn: (productId: number) => api.remove(productId),
    onSuccess: () => {
      invalidate();
      showToast('Product deleted', 'success');
    },
    onError: (error) => showToast(getErrorMessage(error), 'error'),
  });

  const uploadImage = useMutation({
    mutationFn: ({ productId, file }: { productId: number; file: File }) =>
      api.uploadImage(productId, file),
    onSuccess: () => {
      invalidate();
      showToast('Product image updated', 'success');
    },
    onError: (error) => showToast(getErrorMessage(error), 'error'),
  });

  return { create, update, remove, uploadImage };
}

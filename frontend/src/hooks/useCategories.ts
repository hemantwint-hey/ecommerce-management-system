import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { categoryApi } from '@/api/categoryApi';
import { useToast } from '@/contexts/ToastContext';
import { getErrorMessage } from '@/utils/errors';

export function useCategories(pageSize = 100) {
  return useQuery({
    queryKey: ['categories', pageSize],
    queryFn: () => categoryApi.list({ pageSize, sortBy: 'categoryName', sortOrder: 'asc' }),
  });
}

export function useCategoryMutations() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['categories'] });

  const create = useMutation({
    mutationFn: (categoryName: string) => categoryApi.create(categoryName),
    onSuccess: () => {
      invalidate();
      showToast('Category created', 'success');
    },
    onError: (error) => showToast(getErrorMessage(error), 'error'),
  });

  const update = useMutation({
    mutationFn: ({ categoryId, categoryName }: { categoryId: number; categoryName: string }) =>
      categoryApi.update(categoryId, categoryName),
    onSuccess: () => {
      invalidate();
      showToast('Category updated', 'success');
    },
    onError: (error) => showToast(getErrorMessage(error), 'error'),
  });

  const remove = useMutation({
    mutationFn: (categoryId: number) => categoryApi.remove(categoryId),
    onSuccess: () => {
      invalidate();
      showToast('Category deleted', 'success');
    },
    onError: (error) => showToast(getErrorMessage(error), 'error'),
  });

  return { create, update, remove };
}

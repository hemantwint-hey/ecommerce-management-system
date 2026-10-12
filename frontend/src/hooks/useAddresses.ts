import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { addressApi, type AddressPayload } from '@/api/addressApi';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/contexts/ToastContext';
import { getErrorMessage } from '@/utils/errors';

const KEY = ['addresses'];

export function useAddresses() {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: KEY,
    queryFn: addressApi.list,
    enabled: isAuthenticated,
  });
}

export function useAddressMutations() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: KEY });

  const create = useMutation({
    mutationFn: (payload: AddressPayload) => addressApi.create(payload),
    onSuccess: () => {
      invalidate();
      showToast('Address added', 'success');
    },
    onError: (error) => showToast(getErrorMessage(error), 'error'),
  });

  const update = useMutation({
    mutationFn: ({ addressId, payload }: { addressId: number; payload: AddressPayload }) =>
      addressApi.update(addressId, payload),
    onSuccess: () => {
      invalidate();
      showToast('Address updated', 'success');
    },
    onError: (error) => showToast(getErrorMessage(error), 'error'),
  });

  const remove = useMutation({
    mutationFn: (addressId: number) => addressApi.remove(addressId),
    onSuccess: () => {
      invalidate();
      showToast('Address removed', 'success');
    },
    onError: (error) => showToast(getErrorMessage(error), 'error'),
  });

  return { create, update, remove };
}

import { useQuery } from '@tanstack/react-query';
import { addressApi } from '@/api/addressApi';

export function useAddress(addressId: number | undefined) {
  return useQuery({
    queryKey: ['address', addressId],
    queryFn: () => addressApi.get(addressId as number),
    enabled: addressId !== undefined,
  });
}

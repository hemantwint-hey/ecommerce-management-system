import { apiClient } from './client';
import type { AddressDTO } from '@/types/models';

export type AddressPayload = Omit<AddressDTO, 'addressId'>;

export const addressApi = {
  list: () => apiClient.get<AddressDTO[]>('/addresses').then((res) => res.data),

  get: (addressId: number) =>
    apiClient.get<AddressDTO>(`/addresses/${addressId}`).then((res) => res.data),

  create: (payload: AddressPayload) =>
    apiClient.post<AddressDTO>('/addresses', payload).then((res) => res.data),

  update: (addressId: number, payload: AddressPayload) =>
    apiClient.put<AddressDTO>(`/addresses/${addressId}`, payload).then((res) => res.data),

  remove: (addressId: number) =>
    apiClient.delete<string>(`/addresses/${addressId}`).then((res) => res.data),
};

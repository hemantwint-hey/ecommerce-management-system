import { apiClient } from './client';
import type { CartDTO, UserDTO } from '@/types/models';

export const adminApi = {
  users: () => apiClient.get<UserDTO[]>('/admin/users').then((res) => res.data),

  updateUserRoles: (userId: number, roles: string[]) =>
    apiClient.put<UserDTO>(`/admin/users/${userId}/roles`, roles).then((res) => res.data),

  // The backend returns HTTP 302 (a pre-existing quirk) with the list in the body regardless.
  carts: () =>
    apiClient
      .get<CartDTO[]>('/admin/carts', { validateStatus: (status) => status === 200 || status === 302 })
      .then((res) => res.data),
};

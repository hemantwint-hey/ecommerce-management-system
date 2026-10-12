import { apiClient } from './client';
import type { MessageResponse, UserInfoResponse } from '@/types/models';

export interface LoginPayload {
  username: string;
  password: string;
}

export interface SignupPayload {
  username: string;
  email: string;
  password: string;
}

export const authApi = {
  login: (payload: LoginPayload) =>
    apiClient.post<UserInfoResponse>('/auth/signin', payload).then((res) => res.data),

  signup: (payload: SignupPayload) =>
    apiClient.post<MessageResponse>('/auth/signup', payload).then((res) => res.data),

  logout: () => apiClient.post<MessageResponse>('/auth/signout').then((res) => res.data),

  currentUser: () => apiClient.get<UserInfoResponse>('/auth/user').then((res) => res.data),
};

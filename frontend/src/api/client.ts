import axios from 'axios';

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5000/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

type UnauthorizedListener = () => void;
let unauthorizedListener: UnauthorizedListener | null = null;

export function onUnauthorized(listener: UnauthorizedListener) {
  unauthorizedListener = listener;
}

const SILENT_401_PATHS = ['/auth/user', '/auth/signin', '/auth/signup'];

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      const url = error.config?.url ?? '';
      const isSilent = SILENT_401_PATHS.some((path) => url.includes(path));
      if (!isSilent) {
        unauthorizedListener?.();
      }
    }
    return Promise.reject(error);
  },
);

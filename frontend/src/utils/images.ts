import { API_BASE_URL } from '@/api/client';

const SERVER_ORIGIN = API_BASE_URL.replace(/\/api\/?$/, '');

export function productImageUrl(imageName: string | null | undefined): string | null {
  if (!imageName || imageName === 'default.png') return null;
  return `${SERVER_ORIGIN}/images/${imageName}`;
}

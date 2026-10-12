import { AxiosError } from 'axios';

interface SpringErrorBody {
  message?: string;
  error?: string;
}

/** Turns whatever shape the backend happened to send for this failure into one readable sentence. */
export function getErrorMessage(error: unknown, fallback = 'Something went wrong. Please try again.'): string {
  if (!(error instanceof AxiosError)) {
    return fallback;
  }

  if (!error.response) {
    return "We couldn't reach the server. Check your connection and try again.";
  }

  const data = error.response.data;

  // MethodArgumentNotValidException handler: { fieldName: "message", ... }
  if (data && typeof data === 'object' && !Array.isArray(data)) {
    const record = data as SpringErrorBody & Record<string, unknown>;
    if (typeof record.message === 'string' && record.message.length > 0) {
      return record.message;
    }
    const firstFieldError = Object.values(record).find((value) => typeof value === 'string');
    if (typeof firstFieldError === 'string') {
      return firstFieldError;
    }
  }

  // APIException handler: a bare string body.
  if (typeof data === 'string' && data.trim().length > 0) {
    return data;
  }

  if (error.response.status === 401) {
    return 'Please sign in to continue.';
  }
  if (error.response.status === 403) {
    return "You don't have permission to do that.";
  }
  if (error.response.status === 404) {
    return "We couldn't find what you were looking for.";
  }

  return fallback;
}

/** Field-level validation errors returned as a flat { field: message } map by the backend. */
export function getFieldErrors(error: unknown): Record<string, string> {
  if (!(error instanceof AxiosError) || !error.response) return {};
  const data = error.response.data;
  if (error.response.status !== 400 || typeof data !== 'object' || data === null || Array.isArray(data)) {
    return {};
  }
  const entries = Object.entries(data as Record<string, unknown>).filter(
    (entry): entry is [string, string] => typeof entry[1] === 'string',
  );
  return Object.fromEntries(entries);
}

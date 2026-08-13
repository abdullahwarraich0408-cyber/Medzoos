import { getApiBaseUrl } from '../../config/api';
import { getAccessToken } from '../auth/tokenStorage';

export class ApiError extends Error {
  status: number;
  data: unknown;

  constructor(message: string, status: number, data: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

export type ApiRequestOptions = RequestInit & {
  auth?: 'customer' | 'auto';
};

async function parseResponse(response: Response) {
  const contentType = response.headers.get('content-type');
  if (contentType?.includes('application/json')) {
    return response.json();
  }
  return null;
}

async function resolveAuthHeaders(
  auth?: 'customer' | 'auto',
): Promise<Record<string, string>> {
  if (!auth) return {};

  const token = await getAccessToken();
  if (!token) return {};

  return { Authorization: `Bearer ${token}` };
}

export async function apiClient<T = unknown>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<T> {
  const { method = 'GET', body, headers = {}, auth, ...rest } = options;

  const authHeaders = await resolveAuthHeaders(auth);

  const config: RequestInit = {
    method,
    headers: {
      Accept: 'application/json',
      ...authHeaders,
      ...(body && !(body instanceof FormData)
        ? { 'Content-Type': 'application/json' }
        : {}),
      ...headers,
    },
    ...rest,
  };

  if (body !== undefined) {
    config.body =
      body instanceof FormData ? body : JSON.stringify(body);
  }

  let response: Response;
  try {
    response = await fetch(`${getApiBaseUrl()}${path}`, config);
  } catch (err) {
    const message =
      err instanceof Error && err.message === 'Failed to fetch'
        ? 'Unable to reach the server. Check that the backend is running.'
        : err instanceof Error
          ? err.message
          : 'Network request failed';
    throw new ApiError(message, 0, null);
  }

  const payload = await parseResponse(response);

  if (!response.ok) {
    const message =
      (payload as { message?: string })?.message ||
      (payload as { error?: { message?: string } })?.error?.message ||
      `Request failed with status ${response.status}`;
    throw new ApiError(message, response.status, payload);
  }

  if (response.status === 204) {
    return null as T;
  }

  return ((payload as { data?: T })?.data ?? payload) as T;
}

export const api = {
  get: <T>(path: string, options?: ApiRequestOptions) =>
    apiClient<T>(path, { ...options, method: 'GET' }),
  post: <T>(path: string, body?: unknown, options?: ApiRequestOptions) =>
    apiClient<T>(path, { ...options, method: 'POST', body: body as RequestInit['body'] }),
  patch: <T>(path: string, body?: unknown, options?: ApiRequestOptions) =>
    apiClient<T>(path, { ...options, method: 'PATCH', body: body as RequestInit['body'] }),
  put: <T>(path: string, body?: unknown, options?: ApiRequestOptions) =>
    apiClient<T>(path, { ...options, method: 'PUT', body: body as RequestInit['body'] }),
  delete: <T>(path: string, options?: ApiRequestOptions) =>
    apiClient<T>(path, { ...options, method: 'DELETE' }),
};

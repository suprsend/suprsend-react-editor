import { fetchClient } from '@/apis';

interface UseAuthInterceptorParams {
  accessToken?: string;
  refreshAccessToken?: (oldToken: string) => Promise<string>;
  isPrivate: boolean;
}

// Register interceptors synchronously (outside of useEffect) so they are
// in place before any child component fires a query in its own useEffect.
let interceptorsRegistered = false;
const accessTokenRef: { current: string | undefined } = { current: undefined };
const refreshAccessTokenRef: {
  current: ((oldToken: string) => Promise<string>) | undefined;
} = { current: undefined };
const isPrivateRef: { current: boolean } = { current: true };

let isRefreshing = false;
let failedQueue: {
  resolve: (token: string) => void;
  reject: (err: unknown) => void;
}[] = [];

const processQueue = (error: unknown, token?: string) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve(token!);
  });
  failedQueue = [];
};

function ensureInterceptors() {
  if (interceptorsRegistered) return;
  interceptorsRegistered = true;

  // Request interceptor: add auth header
  fetchClient.addRequestInterceptor((url, options) => {
    if (accessTokenRef.current && !isPrivateRef.current) {
      const headers = new Headers(options.headers);
      headers.set(
        'Authorization',
        `EmbeddedToken ${accessTokenRef.current}`
      );
      return { url, options: { ...options, headers } };
    }
    return { url, options };
  });

  // Response interceptor: handle 401 with token refresh
  fetchClient.addResponseInterceptor(async (response, url, options) => {
    if (
      response.status !== 401 ||
      !refreshAccessTokenRef.current ||
      (options as Record<string, unknown>)._retry
    ) {
      return response;
    }

    if (isRefreshing) {
      return new Promise<Response>((resolve, reject) => {
        failedQueue.push({
          resolve: async (newToken: string) => {
            try {
              const retryHeaders = new Headers(options.headers);
              if (!isPrivateRef.current) {
                retryHeaders.set(
                  'Authorization',
                  `EmbeddedToken ${newToken}`
                );
              }
              const retryResp = await fetch(url, {
                ...options,
                headers: retryHeaders,
              });
              resolve(retryResp);
            } catch (err) {
              reject(err);
            }
          },
          reject,
        });
      });
    }

    (options as Record<string, unknown>)._retry = true;
    isRefreshing = true;

    try {
      const newToken = await refreshAccessTokenRef.current(
        accessTokenRef.current!
      );
      accessTokenRef.current = newToken;
      processQueue(null, newToken);

      const retryHeaders = new Headers(options.headers);
      if (!isPrivateRef.current) {
        retryHeaders.set('Authorization', `EmbeddedToken ${newToken}`);
      }
      return await fetch(url, { ...options, headers: retryHeaders });
    } catch (refreshError) {
      processQueue(refreshError);
      throw refreshError;
    } finally {
      isRefreshing = false;
    }
  });
}

export function useAuthInterceptor({
  accessToken,
  refreshAccessToken,
  isPrivate,
}: UseAuthInterceptorParams) {
  // Update refs on every render so interceptors always use latest values
  accessTokenRef.current = accessToken;
  refreshAccessTokenRef.current = refreshAccessToken;
  isPrivateRef.current = isPrivate;

  // Register interceptors synchronously on first call
  ensureInterceptors();
}

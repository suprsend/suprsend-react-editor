import { useEffect, useRef } from 'react';
import axios from 'axios';
import { axiosInst } from '@/apis';

interface UseAuthInterceptorParams {
  accessToken?: string;
  refreshAccessToken?: (oldToken: string) => Promise<string>;
  isPrivate: boolean;
}

export function useAuthInterceptor({
  accessToken,
  refreshAccessToken,
  isPrivate,
}: UseAuthInterceptorParams) {
  const accessTokenRef = useRef(accessToken);
  accessTokenRef.current = accessToken;

  const refreshAccessTokenRef = useRef(refreshAccessToken);
  refreshAccessTokenRef.current = refreshAccessToken;

  useEffect(() => {
    const reqId = axiosInst.interceptors.request.use((config) => {
      if (accessTokenRef.current && !isPrivate) {
        config.headers.Authorization = `Bearer ${accessTokenRef.current}`;
      }
      return config;
    });

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

    const resId = axiosInst.interceptors.response.use(
      undefined,
      async (error) => {
        const originalRequest = error.config;

        if (
          !axios.isAxiosError(error) ||
          error.response?.status !== 401 ||
          originalRequest._retry ||
          !refreshAccessTokenRef.current
        ) {
          return Promise.reject(error);
        }

        if (isRefreshing) {
          return new Promise<string>((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          }).then((newToken) => {
            if (isPrivate) {
              // do nothing
            } else {
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
            }
            return axiosInst(originalRequest);
          });
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          const newToken = await refreshAccessTokenRef.current(
            accessTokenRef.current!
          );
          accessTokenRef.current = newToken;
          processQueue(null, newToken);
          if (isPrivate) {
            // do nothing
          } else {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
          }
          return axiosInst(originalRequest);
        } catch (refreshError) {
          processQueue(refreshError);
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      }
    );

    return () => {
      axiosInst.interceptors.request.eject(reqId);
      axiosInst.interceptors.response.eject(resId);
    };
  }, []);
}

import { useState, useEffect, useRef, useCallback } from 'react';
import { isHttpError } from '@/lib/fetchClient';
import {
  serializeKey,
  getCached,
  setCached,
  hasCached,
  subscribe,
  deduplicatedFetch,
} from './queryCache';

interface UseQueryOptions<T> {
  queryKey: unknown[];
  queryFn: () => Promise<T>;
  enabled?: boolean;
  retry?: number;
  onSuccess?: (data: T) => void;
  onError?: (error: unknown) => void;
}

export interface UseQueryResult<T> {
  data: T | undefined;
  error: unknown;
  isLoading: boolean;
  isError: boolean;
  refetch: () => Promise<void>;
}

function shouldRetry(
  failureCount: number,
  maxRetries: number,
  error: unknown
): boolean {
  if (isHttpError(error) && error.status === 404) return false;
  return failureCount < maxRetries;
}

export function useQuery<T>({
  queryKey,
  queryFn,
  enabled = true,
  retry = 3,
  onSuccess,
  onError,
}: UseQueryOptions<T>): UseQueryResult<T> {
  const key = serializeKey(queryKey);
  // Track which key the current data/error belong to so we never return stale
  // data from a previous key (e.g. email data to a webpush component).
  const [dataKey, setDataKey] = useState(key);
  const [data, setData] = useState<T | undefined>(
    () => getCached<T>(key)
  );
  const [error, setError] = useState<unknown>(null);
  const [isLoading, setIsLoading] = useState(!hasCached(key) && enabled);
  const keyRef = useRef(key);
  const queryFnRef = useRef(queryFn);
  const onSuccessRef = useRef(onSuccess);
  const onErrorRef = useRef(onError);
  const retryRef = useRef(retry);

  queryFnRef.current = queryFn;
  onSuccessRef.current = onSuccess;
  onErrorRef.current = onError;
  retryRef.current = retry;

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    const doFetch = async () => {
      let failureCount = 0;
      while (true) {
        try {
          return await queryFnRef.current();
        } catch (err) {
          failureCount++;
          if (!shouldRetry(failureCount, retryRef.current, err)) {
            throw err;
          }
        }
      }
    };

    try {
      const result = await deduplicatedFetch<T>(key, doFetch);
      if (keyRef.current === key) {
        setCached(key, result);
        setData(result);
        setDataKey(key);
        setIsLoading(false);
        onSuccessRef.current?.(result);
      }
    } catch (err) {
      if (keyRef.current === key) {
        setError(err);
        setDataKey(key);
        setIsLoading(false);
        onErrorRef.current?.(err);
      }
    }
  }, [key]);

  useEffect(() => {
    keyRef.current = key;
    const cached = getCached<T>(key);
    setData(cached);
    setDataKey(key);
    setError(null);
    if (!enabled) {
      setIsLoading(false);
      return;
    }
    fetchData();
  }, [key, enabled, fetchData]);

  // Re-fetch when cache is invalidated
  useEffect(() => {
    return subscribe(key, () => {
      if (enabled) fetchData();
    });
  }, [key, enabled, fetchData]);

  // If the key changed but the effect hasn't run yet, return cached value for
  // the new key (or undefined) — never return stale data from a different key.
  const keyChanged = key !== dataKey;
  const currentData = keyChanged ? getCached<T>(key) : data;
  const currentError = keyChanged ? null : error;
  const currentIsLoading = keyChanged ? !hasCached(key) && enabled : isLoading;

  return {
    data: currentData,
    error: currentError,
    isLoading: currentIsLoading,
    isError: currentError != null,
    refetch: fetchData,
  };
}

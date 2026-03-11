import { useState, useCallback } from 'react';

export interface MutationCallbacks<TData> {
  onSuccess?: (data: TData) => void;
  onError?: (error: unknown) => void;
}

interface UseMutationOptions<TData, TVariables> extends MutationCallbacks<TData> {
  mutationFn: (variables: TVariables) => Promise<TData>;
}

export interface UseMutationResult<TData, TVariables> {
  data: TData | undefined;
  error: unknown;
  isLoading: boolean;
  isPending: boolean;
  isError: boolean;
  isSuccess: boolean;
  mutate: (variables: TVariables, callbacks?: MutationCallbacks<TData>) => void;
  mutateAsync: (variables: TVariables, callbacks?: MutationCallbacks<TData>) => Promise<TData>;
  reset: () => void;
}

export function useMutation<TData = unknown, TVariables = void>({
  mutationFn,
  onSuccess,
  onError,
}: UseMutationOptions<TData, TVariables>): UseMutationResult<TData, TVariables> {
  const [data, setData] = useState<TData | undefined>(undefined);
  const [error, setError] = useState<unknown>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const mutateAsync = useCallback(
    async (variables: TVariables, callbacks?: MutationCallbacks<TData>): Promise<TData> => {
      setIsLoading(true);
      setError(null);
      setIsSuccess(false);
      try {
        const result = await mutationFn(variables);
        setData(result);
        setIsSuccess(true);
        onSuccess?.(result);
        callbacks?.onSuccess?.(result);
        return result;
      } catch (err) {
        setError(err);
        onError?.(err);
        callbacks?.onError?.(err);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [mutationFn, onSuccess, onError]
  );

  const mutate = useCallback(
    (variables: TVariables, callbacks?: MutationCallbacks<TData>) => {
      mutateAsync(variables, callbacks).catch(() => {});
    },
    [mutateAsync]
  );

  const reset = useCallback(() => {
    setData(undefined);
    setError(null);
    setIsLoading(false);
    setIsSuccess(false);
  }, []);

  return {
    data,
    error,
    isLoading,
    isPending: isLoading,
    isError: error != null,
    isSuccess,
    mutate,
    mutateAsync,
    reset,
  };
}

import { useEffect, useRef } from 'react';
import type { UseFormWatch, FieldValues } from 'react-hook-form';

interface UseAutosaveOptions<T extends FieldValues> {
  watch: UseFormWatch<T>;
  onSave: (data: T) => void;
  debounceMs?: number;
}

export function useAutosave<T extends FieldValues>({
  watch,
  onSave,
  debounceMs = 500,
}: UseAutosaveOptions<T>) {
  const onSaveRef = useRef(onSave);
  const debounceMsRef = useRef(debounceMs);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isFirstRender = useRef(true);
  const lastSavedRef = useRef<string>('');

  onSaveRef.current = onSave;
  debounceMsRef.current = debounceMs;

  useEffect(() => {
    const subscription = watch((data) => {
      if (isFirstRender.current) {
        isFirstRender.current = false;
        lastSavedRef.current = JSON.stringify(data);
        return;
      }

      const serialized = JSON.stringify(data);
      if (serialized === lastSavedRef.current) return;

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        lastSavedRef.current = serialized;
        onSaveRef.current(data as T);
      }, debounceMsRef.current);
    });

    return () => {
      subscription.unsubscribe();
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [watch]);
}

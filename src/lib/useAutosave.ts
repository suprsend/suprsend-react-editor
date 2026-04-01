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
  const lastSavedRef = useRef<string>('');

  onSaveRef.current = onSave;
  debounceMsRef.current = debounceMs;

  useEffect(() => {
    // Snapshot current form values so the first real user edit isn't skipped
    lastSavedRef.current = JSON.stringify(watch());

    const subscription = watch((data) => {
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

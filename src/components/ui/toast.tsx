import * as React from 'react';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { X, CircleCheck, AlertCircle } from '@/assets/icons';

// --- Types ---
type ToastVariant = 'default' | 'success' | 'destructive';

interface Toast {
  id: string;
  title?: string;
  description?: string;
  variant?: ToastVariant;
}

// --- Module-level singleton store ---
let toasts: Toast[] = [];
const listeners = new Set<() => void>();
const timers = new Map<string, ReturnType<typeof setTimeout>>();

function getSnapshot() {
  return toasts;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function emit() {
  listeners.forEach((l) => l());
}

function removeToast(id: string) {
  const timer = timers.get(id);
  if (timer) clearTimeout(timer);
  timers.delete(id);
  toasts = toasts.filter((t) => t.id !== id);
  emit();
}

// eslint-disable-next-line react-refresh/only-export-components
export function toast(props: Omit<Toast, 'id'>) {
  const id = Math.random().toString(36).slice(2, 9);
  toasts = [...toasts, { ...props, id }];
  emit();
  const timer = setTimeout(() => removeToast(id), 4000);
  timers.set(id, timer);
}

// eslint-disable-next-line react-refresh/only-export-components
export function useToast() {
  return { toast };
}

// --- Toaster (render-only, no children wrapper needed) ---
let mountedCount = 0;

export function Toaster({ children }: { children?: React.ReactNode }) {
  const [isFirst, setIsFirst] = useState(false);
  const [currentToasts, setCurrentToasts] = useState(getSnapshot);

  useEffect(() => {
    mountedCount++;
    if (mountedCount === 1) setIsFirst(true);
    return () => {
      mountedCount--;
    };
  }, []);

  useEffect(() => {
    const unsubscribe = subscribe(() => setCurrentToasts(getSnapshot()));
    return () => { unsubscribe(); };
  }, []);

  return (
    <>
      {children}
      {isFirst && currentToasts.length > 0 && (
        <div
          className={cn(
            'suprsend-fixed suprsend-bottom-4 suprsend-right-4 suprsend-z-[100] suprsend-flex suprsend-flex-col suprsend-gap-2 suprsend-w-[360px]'
          )}
        >
          {currentToasts.map((t) => (
            <ToastItem key={t.id} toast={t} onClose={() => removeToast(t.id)} />
          ))}
        </div>
      )}
    </>
  );
}

// --- Toast Item ---

function ToastItem({
  toast,
  onClose,
}: {
  toast: Toast;
  onClose: () => void;
}) {
  const variant = toast.variant ?? 'default';

  return (
    <div
      className={cn(
        'suprsend-pointer-events-auto suprsend-relative suprsend-flex suprsend-items-start suprsend-gap-3 suprsend-rounded-md suprsend-border suprsend-p-4 suprsend-shadow-lg suprsend-transition-all',
        'suprsend-animate-in suprsend-slide-in-from-right-full',
        'suprsend-bg-background suprsend-text-foreground suprsend-border-border'
      )}
    >
      <div className="suprsend-flex-1 suprsend-space-y-1">
        {toast.title && (
          <p className="suprsend-text-sm suprsend-font-semibold suprsend-flex suprsend-items-center suprsend-gap-1.5">
            {variant === 'success' && <CircleCheck className="suprsend-h-4 suprsend-w-4 suprsend-text-green-500 suprsend-shrink-0" />}
            {variant === 'destructive' && <AlertCircle className="suprsend-h-4 suprsend-w-4 suprsend-text-destructive suprsend-shrink-0" />}
            {toast.title}
          </p>
        )}
        {toast.description && (
          <p className="suprsend-text-sm suprsend-opacity-90">{toast.description}</p>
        )}
      </div>
      <button
        onClick={onClose}
        className={cn(
          'suprsend-inline-flex suprsend-h-5 suprsend-w-5 suprsend-shrink-0 suprsend-items-center suprsend-justify-center suprsend-rounded-sm suprsend-opacity-70 hover:suprsend-opacity-100 suprsend-transition-opacity'
        )}
      >
        <X className="suprsend-h-3.5 suprsend-w-3.5" />
      </button>
    </div>
  );
}

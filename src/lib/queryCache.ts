type Listener = () => void;

const cache = new Map<string, unknown>();
const listeners = new Map<string, Set<Listener>>();
const inflight = new Map<string, Promise<unknown>>();

/**
 * Deduplicate concurrent fetches for the same key.
 * If a request for `key` is already in-flight, return the existing promise
 * instead of firing a duplicate network call.
 */
export function deduplicatedFetch<T>(
  key: string,
  fn: () => Promise<T>
): Promise<T> {
  const existing = inflight.get(key);
  if (existing) return existing as Promise<T>;

  const promise = fn().finally(() => {
    inflight.delete(key);
  });
  inflight.set(key, promise);
  return promise;
}

export function serializeKey(key: unknown[]): string {
  return JSON.stringify(key);
}

export function getCached<T>(key: string): T | undefined {
  return cache.get(key) as T | undefined;
}

export function setCached(key: string, value: unknown): void {
  cache.set(key, value);
}

export function hasCached(key: string): boolean {
  return cache.has(key);
}

export function subscribe(key: string, listener: Listener): () => void {
  if (!listeners.has(key)) listeners.set(key, new Set());
  listeners.get(key)!.add(listener);
  return () => {
    listeners.get(key)?.delete(listener);
    if (listeners.get(key)?.size === 0) listeners.delete(key);
  };
}

function notifyListeners(key: string): void {
  listeners.get(key)?.forEach((fn) => fn());
}

export function invalidateQueries(queryKey: unknown[]): void {
  const keyStr = serializeKey(queryKey);

  // Exact match
  if (cache.has(keyStr)) {
    cache.delete(keyStr);
    notifyListeners(keyStr);
    return;
  }

  // Prefix match: invalidate all cached keys whose parsed first element
  // starts with the first element of the given queryKey.
  // e.g. queryKey ["template/slug"] matches cached ["template/slug/channel/email/variant/abc","draft","v1"]
  const firstElement = typeof queryKey[0] === 'string' ? queryKey[0] : '';
  if (!firstElement) return;

  for (const [cachedKey] of cache) {
    try {
      const parsed = JSON.parse(cachedKey) as unknown[];
      if (typeof parsed[0] === 'string' && parsed[0].startsWith(firstElement)) {
        cache.delete(cachedKey);
        notifyListeners(cachedKey);
      }
    } catch {
      // skip malformed keys
    }
  }
}

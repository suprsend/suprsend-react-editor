type Listener = () => void;

const cache = new Map<string, unknown>();
const listeners = new Map<string, Set<Listener>>();

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

  // Prefix match: invalidate all keys that start with the given partial key
  const prefix = JSON.stringify(queryKey).slice(0, -1); // remove trailing ']'
  for (const [cachedKey] of cache) {
    if (cachedKey.startsWith(prefix)) {
      cache.delete(cachedKey);
      notifyListeners(cachedKey);
    }
  }
}

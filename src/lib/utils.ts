import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function createQueryParams(params: Record<string, unknown>): string {
  const searchParams = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined) continue;
    const encoded =
      typeof value === 'object'
        ? encodeURIComponent(JSON.stringify(value))
        : String(value);
    searchParams.append(key, encoded);
  }
  const qs = searchParams.toString();
  return qs ? `?${qs}` : '';
}

// Deep merge source into target (mutates target)
export function deepMerge(
  target: Record<string, unknown>,
  source: Record<string, unknown>
) {
  for (const key of Object.keys(source)) {
    const srcVal = source[key];
    const tgtVal = target[key];
    if (
      srcVal &&
      typeof srcVal === 'object' &&
      !Array.isArray(srcVal) &&
      tgtVal &&
      typeof tgtVal === 'object' &&
      !Array.isArray(tgtVal)
    ) {
      deepMerge(
        tgtVal as Record<string, unknown>,
        srcVal as Record<string, unknown>
      );
    } else {
      target[key] = srcVal;
    }
  }
}

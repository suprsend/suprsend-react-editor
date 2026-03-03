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

const IMG_HOST = 'https://ik.imagekit.io/l0quatz6utm/';

export function makeAbsoluteUrl(url: string, transform = '') {
  return url?.startsWith('http://') || url?.startsWith('https://')
    ? url
    : `${IMG_HOST}${transform}${url}`;
}

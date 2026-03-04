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

export function htmlToText(html: string): string {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  return doc.body.textContent || '';
}

const IMG_HOST = 'https://ik.imagekit.io/l0quatz6utm/';

export function makeAbsoluteUrl(url: string, transform = '') {
  return url?.startsWith('http://') || url?.startsWith('https://')
    ? url
    : `${IMG_HOST}${transform}${url}`;
}

export function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

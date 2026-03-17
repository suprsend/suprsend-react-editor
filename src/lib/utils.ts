import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function createQueryParams(params: Record<string, unknown>): string {
  const searchParams = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined) continue;
    const stringified =
      typeof value === 'object' ? JSON.stringify(value) : String(value);
    searchParams.append(key, stringified);
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

export function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function htmlToText(html: string): string {
  if (!html) return '';

  const NEWLINE = '%%NEWLINE%%';
  const DOUBLE_NEWLINE = '%%DOUBLE_NEWLINE%%';
  const TAB = '%%TAB%%';

  const doc: Document = new DOMParser().parseFromString(html, 'text/html');

  // =============================================
  // 1. REMOVE NON-CONTENT ELEMENTS
  // =============================================

  // Remove style, script, title, meta tags
  doc
    .querySelectorAll('style, script, title, meta, link, noscript')
    .forEach((el: Element) => el.remove());

  // Remove HTML comments (MSO conditionals, IE conditionals)
  const walker: TreeWalker = doc.createTreeWalker(
    doc.documentElement,
    NodeFilter.SHOW_COMMENT
  );
  const comments: Comment[] = [];
  while (walker.nextNode()) comments.push(walker.currentNode as Comment);
  comments.forEach((c: Comment) => c.remove());

  // =============================================
  // 2. REMOVE HIDDEN / PREHEADER ELEMENTS
  // =============================================

  const hiddenChecks: Array<{
    prop: string;
    values: string[];
  }> = [
    { prop: 'display', values: ['none'] },
    { prop: 'visibility', values: ['hidden'] },
    { prop: 'opacity', values: ['0'] },
    { prop: 'font-size', values: ['0', '0px', '0pt'] },
    { prop: 'line-height', values: ['0', '0px', '0pt'] },
    { prop: 'max-height', values: ['0', '0px', '0pt'] },
    { prop: 'overflow', values: ['hidden'] },
    { prop: 'mso-hide', values: ['all'] },
    { prop: 'color', values: ['transparent'] },
  ];

  doc.querySelectorAll('[style]').forEach((el: Element) => {
    const style: string = (el.getAttribute('style') || '')
      .toLowerCase()
      .replace(/\s/g, '');
    const isHidden: boolean = hiddenChecks.some(({ prop, values }) =>
      values.some((val: string) => style.includes(`${prop}:${val}`))
    );

    // Only remove if element has no visible children OR is a known preheader pattern
    if (isHidden) {
      const hasVisibleText: boolean = (el.textContent || '').trim().length > 0;
      const isSmallElement: boolean =
        !el.querySelector('table') && !el.querySelector('td');

      if (isSmallElement || !hasVisibleText) {
        el.remove();
      }
    }
  });

  // Remove aria-hidden elements
  doc
    .querySelectorAll('[aria-hidden="true"]')
    .forEach((el: Element) => el.remove());

  // =============================================
  // 3. HANDLE IMAGES
  // =============================================

  doc.querySelectorAll('img').forEach((el: Element) => {
    const imgEl = el as HTMLImageElement;
    const alt: string = (imgEl.getAttribute('alt') || '').trim();
    const width: string | null = imgEl.getAttribute('width');
    const height: string | null = imgEl.getAttribute('height');
    const src: string = (imgEl.getAttribute('src') || '').toLowerCase();

    // Remove tracking pixels
    const isTrackingPixel: boolean =
      (width === '1' && height === '1') ||
      (width === '0' && height === '0') ||
      src.includes('track') ||
      src.includes('pixel') ||
      src.includes('beacon') ||
      src.includes('open') ||
      src.includes('/o/') ||
      src.includes('spacer');

    if (isTrackingPixel) {
      imgEl.remove();
    } else if (alt) {
      imgEl.replaceWith(`[${alt}]`);
    } else {
      imgEl.remove();
    }
  });

  // =============================================
  // 4. HANDLE LINE BREAKS
  // =============================================

  doc.querySelectorAll('br').forEach((el: Element) => el.replaceWith(NEWLINE));

  doc
    .querySelectorAll('hr')
    .forEach((el: Element) => el.replaceWith(`${NEWLINE}---${NEWLINE}`));

  // =============================================
  // 5. HANDLE BLOCK ELEMENTS
  // =============================================

  // Double newline (paragraph-level breaks)
  const doubleBreakTags: string[] = [
    'p',
    'h1',
    'h2',
    'h3',
    'h4',
    'h5',
    'h6',
    'blockquote',
    'article',
    'section',
    'header',
    'footer',
  ];
  doubleBreakTags.forEach((tag: string) => {
    doc.querySelectorAll(tag).forEach((el: Element) => {
      el.prepend(DOUBLE_NEWLINE);
      el.append(DOUBLE_NEWLINE);
    });
  });

  // Single newline (row-level breaks)
  const singleBreakTags: string[] = ['div', 'tr', 'li', 'dt', 'dd'];
  singleBreakTags.forEach((tag: string) => {
    doc.querySelectorAll(tag).forEach((el: Element) => {
      el.append(NEWLINE);
    });
  });

  // Table cell spacing
  doc.querySelectorAll('td, th').forEach((el: Element) => {
    el.append(TAB);
  });

  // =============================================
  // 6. HANDLE HEADINGS (add emphasis)
  // =============================================

  doc.querySelectorAll('h1, h2, h3, h4, h5, h6').forEach((el: Element) => {
    const text: string = (el.textContent || '').trim();
    if (text) {
      el.textContent = text.toUpperCase();
    }
  });

  // =============================================
  // 7. HANDLE LISTS
  // =============================================

  // Unordered lists
  doc.querySelectorAll('ul > li').forEach((el: Element) => {
    el.prepend('• ');
  });

  // Ordered lists
  doc.querySelectorAll('ol').forEach((ol: Element) => {
    ol.querySelectorAll(':scope > li').forEach((li: Element, index: number) => {
      li.prepend(`${index + 1}. `);
    });
  });

  // =============================================
  // 8. HANDLE LINKS
  // =============================================

  doc.querySelectorAll('a[href]').forEach((el: Element) => {
    const anchor = el as HTMLAnchorElement;
    const href: string = (anchor.getAttribute('href') || '').trim();
    const text: string = (anchor.textContent || '').trim();

    // Skip empty, anchor, javascript, and mailto links
    const skipLink: boolean =
      !href ||
      href.startsWith('#') ||
      href.startsWith('javascript:') ||
      href.startsWith('mailto:') ||
      href.startsWith('tel:');

    if (skipLink) {
      // For mailto/tel, keep the address/number visible
      if (href.startsWith('mailto:')) {
        anchor.textContent = text || href.replace('mailto:', '');
      } else if (href.startsWith('tel:')) {
        anchor.textContent = text || href.replace('tel:', '');
      }
      return;
    }

    // Don't duplicate if text is already the URL
    if (text === href || text === href.replace(/^https?:\/\//, '')) {
      anchor.textContent = href;
    } else if (text) {
      anchor.textContent = `${text} (${href})`;
    } else {
      anchor.textContent = href;
    }
  });

  // =============================================
  // 9. HANDLE TABLES (email layout awareness)
  // =============================================

  // Remove layout-only tables (role="presentation")
  // but keep their content
  // Already handled by textContent extraction

  // =============================================
  // 10. HANDLE SPECIAL CHARACTERS & ENTITIES
  // =============================================

  const raw: string = doc.documentElement.textContent || '';

  return (
    raw
      // Replace special unicode chars
      .replace(/\u00A0/g, ' ') // &nbsp;
      .replace(/\u200C/g, '') // zero-width non-joiner
      .replace(/\u200B/g, '') // zero-width space
      .replace(/\u200D/g, '') // zero-width joiner
      .replace(/\uFEFF/g, '') // BOM
      .replace(/\u00AD/g, '') // soft hyphen
      .replace(/\u2028/g, '\n') // line separator
      .replace(/\u2029/g, '\n\n') // paragraph separator
      .replace(/\u200E/g, '') // left-to-right mark
      .replace(/\u200F/g, '') // right-to-left mark

      // Replace smart quotes with regular quotes
      .replace(/[\u2018\u2019]/g, "'") // smart single quotes
      .replace(/[\u201C\u201D]/g, '"') // smart double quotes

      // Replace dashes
      .replace(/\u2013/g, '-') // en dash
      .replace(/\u2014/g, '--') // em dash
      .replace(/\u2026/g, '...') // ellipsis

      // Process placeholders
      .replace(new RegExp(TAB, 'g'), '\t')
      .replace(new RegExp(DOUBLE_NEWLINE, 'g'), '\n\n')
      .replace(new RegExp(NEWLINE, 'g'), '\n')

      // Clean up whitespace per line
      .split('\n')
      .map((line: string) =>
        line.replace(/\t+/g, '  ').replace(/\s+/g, ' ').trim()
      )
      .join('\n')

      // Normalize newlines
      .replace(/\n{3,}/g, '\n\n')
      .trim()
  );
}

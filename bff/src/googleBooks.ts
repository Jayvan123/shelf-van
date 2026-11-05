import type { BookSummary, BookDetail, SearchResponse } from './types.js';

export interface GoogleVolumeItem {
  id: string;
  volumeInfo?: {
    title?: string;
    subtitle?: string;
    authors?: string[];
    publisher?: string;
    publishedDate?: string;
    description?: string;
    pageCount?: number;
    categories?: string[];
    imageLinks?: {
      smallThumbnail?: string;
      thumbnail?: string;
      small?: string;
      medium?: string;
      large?: string;
      extraLarge?: string;
    };
    industryIdentifiers?: Array<{ type?: string; identifier?: string }>;
    previewLink?: string;
    infoLink?: string;
    canonicalVolumeLink?: string;
  };
  accessInfo?: {
    viewability?: string;
    embeddable?: boolean;
    publicDomain?: boolean;
    webReaderLink?: string;
    accessViewStatus?: string;
  };
}

export interface GoogleBooksSearchRawResponse {
  kind?: string;
  totalItems?: number;
  items?: GoogleVolumeItem[];
}

export function extractGoogleCoverUrl(
  imageLinks?: Record<string, string>,
  size: 'M' | 'L' = 'M'
): string | undefined {
  if (!imageLinks) return undefined;

  let url: string | undefined;
  if (size === 'L') {
    url =
      imageLinks.extraLarge ||
      imageLinks.large ||
      imageLinks.medium ||
      imageLinks.thumbnail ||
      imageLinks.smallThumbnail;
  } else {
    url =
      imageLinks.medium ||
      imageLinks.thumbnail ||
      imageLinks.smallThumbnail;
  }

  if (!url) return undefined;

  // Upgrade http to https to avoid mixed-content issues
  url = url.replace(/^http:\/\//i, 'https://');
  // Strip the edge curl distortion artifact
  url = url.replace(/&edge=curl/g, '');

  return url;
}

export function normalizeGoogleVolume(item: GoogleVolumeItem): BookSummary {
  const info = item.volumeInfo || {};
  const access = item.accessInfo;
  const isReadable = Boolean(
    access?.embeddable || (access?.viewability && access.viewability !== 'NO_PAGES')
  );

  let firstPublishYear: number | undefined;
  if (info.publishedDate) {
    const yearMatch = info.publishedDate.match(/^\d{4}/);
    if (yearMatch) {
      firstPublishYear = parseInt(yearMatch[0], 10);
    }
  }

  const isbnList = (info.industryIdentifiers || [])
    .map((id) => id.identifier)
    .filter((id): id is string => Boolean(id));

  return {
    key: `gb_${item.id}`,
    title: info.title || 'Untitled',
    authors: info.authors && info.authors.length > 0 ? info.authors : ['Unknown Author'],
    firstPublishYear,
    coverUrl: extractGoogleCoverUrl(info.imageLinks, 'M'),
    isbn: isbnList.length > 0 ? isbnList.slice(0, 5) : undefined,
    isReadable,
    provider: 'googlebooks',
  };
}

export function normalizeGoogleBookDetail(item: GoogleVolumeItem): BookDetail {
  const summary = normalizeGoogleVolume(item);
  const info = item.volumeInfo || {};
  const access = item.accessInfo;

  // When embeddable, use Google's official embed URL for the iframe reader
  const readerUrl = access?.embeddable
    ? `https://books.google.com/books?id=${encodeURIComponent(item.id)}&lpg=PP1&pg=PP1&output=embed`
    : access?.webReaderLink
    ? access.webReaderLink.replace(/^http:\/\//i, 'https://')
    : undefined;

  const previewUrl =
    info.previewLink?.replace(/^http:\/\//i, 'https://') ||
    info.infoLink?.replace(/^http:\/\//i, 'https://') ||
    `https://books.google.com/books?id=${encodeURIComponent(item.id)}`;

  return {
    ...summary,
    coverUrl: extractGoogleCoverUrl(info.imageLinks, 'L'),
    description: info.description || undefined,
    publishers: info.publisher ? [info.publisher] : undefined,
    publishDate: info.publishedDate || undefined,
    pageCount: typeof info.pageCount === 'number' ? info.pageCount : undefined,
    subjects: Array.isArray(info.categories) ? info.categories.slice(0, 8) : undefined,
    readerUrl,
    previewUrl,
  };
}

const GOOGLE_API_KEY = process.env.GOOGLE_BOOKS_API_KEY || '';

async function fetchGoogleBooksApi<T>(endpoint: string, timeoutMs: number = 8000): Promise<T> {
  const separator = endpoint.includes('?') ? '&' : '?';
  const fullUrl = GOOGLE_API_KEY
    ? `${endpoint}${separator}key=${encodeURIComponent(GOOGLE_API_KEY)}`
    : endpoint;

  console.log(`[Google Books] Requesting: ${endpoint}`);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(fullUrl, {
      headers: {
        Accept: 'application/json',
      },
      signal: controller.signal,
    });

    if (res.status === 404) {
      throw new Error(`Google Books volume not found: 404`);
    }

    if (!res.ok) {
      throw new Error(`Google Books API error: ${res.statusText} (${res.status})`);
    }

    return (await res.json()) as T;
  } finally {
    clearTimeout(timer);
  }
}

export async function searchGoogleBooks(
  query: string,
  page: number = 1,
  limit: number = 20
): Promise<SearchResponse> {
  const trimmed = query.trim();
  if (!trimmed) {
    return { total: 0, page: 1, books: [] };
  }

  const startIndex = Math.max(0, (page - 1) * limit);
  const maxResults = Math.min(limit, 40);
  const endpoint = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(
    trimmed
  )}&startIndex=${startIndex}&maxResults=${maxResults}&printType=books`;

  const raw = await fetchGoogleBooksApi<GoogleBooksSearchRawResponse>(endpoint);
  const items = raw.items || [];
  const books = items.map(normalizeGoogleVolume);

  return {
    total: raw.totalItems ?? books.length,
    page,
    books,
  };
}

export async function getGoogleBookDetail(volumeId: string): Promise<BookDetail> {
  const endpoint = `https://www.googleapis.com/books/v1/volumes/${encodeURIComponent(volumeId)}`;
  const raw = await fetchGoogleBooksApi<GoogleVolumeItem>(endpoint);
  return normalizeGoogleBookDetail(raw);
}


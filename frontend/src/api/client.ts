import type { BookDetail, SearchResponse } from '../types/index.ts';

const API_BASE = import.meta.env.VITE_API_BASE || '/api';

export function resolveCoverUrl(url?: string): string | undefined {
  if (!url) return undefined;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  const baseUrl = import.meta.env.VITE_API_URL || '';
  return `${baseUrl}${url}`;
}

export class ApiError extends Error {
  status: number;
  code?: string;

  constructor(message: string, status: number, code?: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
  }
}

export async function searchBooks(
  query: string,
  page: number = 1,
  provider?: 'all' | 'openlibrary' | 'googlebooks'
): Promise<SearchResponse> {
  const trimmed = query.trim();
  if (!trimmed) {
    return { total: 0, page: 1, books: [] };
  }

  const providerParam = provider ? `&provider=${encodeURIComponent(provider)}` : '';
  const url = `${API_BASE}/search?q=${encodeURIComponent(trimmed)}&page=${page}${providerParam}`;
  const response = await fetch(url);

  if (response.status === 429) {
    throw new ApiError('Book service is currently busy. Please wait a moment and try again.', 429, 'RATE_LIMITED');
  }

  if (!response.ok) {
    let errorMsg = `Search request failed: ${response.statusText}`;
    try {
      const errJson = await response.json();
      if (errJson.error) errorMsg = errJson.error;
    } catch {
      // ignore
    }
    throw new ApiError(errorMsg, response.status);
  }

  return response.json();
}

export async function getSubjectBooks(subject: string, page: number = 1): Promise<SearchResponse> {
  const clean = subject.trim().toLowerCase().replace(/\s+/g, '_');
  if (!clean) {
    return { total: 0, page: 1, books: [] };
  }

  const url = `${API_BASE}/subjects/${encodeURIComponent(clean)}?page=${page}`;
  const response = await fetch(url);

  if (response.status === 429) {
    throw new ApiError('Open Library rate limit reached. Please wait a moment.', 429, 'RATE_LIMITED');
  }

  if (!response.ok) {
    throw new ApiError(`Catalog request failed: ${response.statusText}`, response.status);
  }

  return response.json();
}

export async function getBookDetail(key: string): Promise<BookDetail> {
  const cleanKey = key.replace(/^\/+/, '');
  const url = `${API_BASE}/books/${encodeURIComponent(cleanKey)}`;
  const response = await fetch(url);

  if (response.status === 429) {
    throw new ApiError('Open Library rate limit reached. Please wait a few seconds.', 429, 'RATE_LIMITED');
  }

  if (response.status === 404) {
    throw new ApiError(`Book "${key}" was not found.`, 404, 'NOT_FOUND');
  }

  if (!response.ok) {
    let errorMsg = `Failed to fetch book detail: ${response.statusText}`;
    try {
      const errJson = await response.json();
      if (errJson.error) errorMsg = errJson.error;
    } catch {
      // ignore
    }
    throw new ApiError(errorMsg, response.status);
  }

  return response.json();
}

import type { BookSummary, BookDetail, SearchResponse } from './types.js';

export function extractCleanKey(rawKey: string): string {
  if (!rawKey) return '';
  // Handles "/works/OL45804W", "works/OL45804W", "OL45804W"
  const parts = rawKey.split('/');
  return parts[parts.length - 1] || rawKey;
}

export function buildCoverUrl(coverId?: number | string, size: 'S' | 'M' | 'L' = 'M'): string | undefined {
  if (!coverId || Number(coverId) <= 0) return undefined;
  // Proxy through our BFF endpoint
  return `/api/cover/${coverId}?size=${size}`;
}

export interface OpenLibrarySearchDoc {
  key: string;
  title?: string;
  author_name?: string[];
  first_publish_year?: number;
  cover_i?: number;
  isbn?: string[];
  ia?: string[] | string;
  has_fulltext?: boolean;
  public_scan_b?: boolean;
}

export interface OpenLibrarySearchRawResponse {
  numFound?: number;
  num_found?: number;
  start?: number;
  docs?: OpenLibrarySearchDoc[];
}

export function normalizeSearchDoc(doc: OpenLibrarySearchDoc): BookSummary {
  const cleanKey = extractCleanKey(doc.key);
  const iaId = Array.isArray(doc.ia) ? doc.ia[0] : (doc.ia || undefined);
  const isReadable = Boolean(iaId || doc.has_fulltext || doc.public_scan_b);

  return {
    key: cleanKey,
    title: doc.title || 'Untitled',
    authors: doc.author_name || [],
    firstPublishYear: doc.first_publish_year,
    coverUrl: buildCoverUrl(doc.cover_i, 'M'),
    isbn: doc.isbn ? doc.isbn.slice(0, 5) : undefined,
    isReadable,
    iaId: iaId || undefined,
  };
}

export function normalizeSearchResponse(
  raw: OpenLibrarySearchRawResponse,
  page: number = 1
): SearchResponse {
  const docs = raw.docs || [];
  const total = raw.numFound ?? raw.num_found ?? docs.length;

  return {
    total,
    page,
    books: docs.map(normalizeSearchDoc),
  };
}

export interface OpenLibrarySubjectWork {
  key: string;
  title?: string;
  authors?: Array<{ name?: string; key?: string }>;
  first_publish_year?: number;
  cover_id?: number;
  ia?: string | string[];
  has_fulltext?: boolean;
}

export interface OpenLibrarySubjectRawResponse {
  name?: string;
  work_count?: number;
  works?: OpenLibrarySubjectWork[];
}

export function normalizeSubjectResponse(
  raw: OpenLibrarySubjectRawResponse,
  page: number = 1
): SearchResponse {
  const works = raw.works || [];
  const total = raw.work_count ?? works.length;

  const books: BookSummary[] = works.map((w) => {
    const cleanKey = extractCleanKey(w.key);
    const iaId = Array.isArray(w.ia) ? w.ia[0] : (w.ia || undefined);
    const isReadable = Boolean(iaId || w.has_fulltext);
    const authorNames = Array.isArray(w.authors)
      ? w.authors.map((a) => a.name || '').filter(Boolean)
      : [];

    return {
      key: cleanKey,
      title: w.title || 'Untitled',
      authors: authorNames,
      firstPublishYear: w.first_publish_year,
      coverUrl: buildCoverUrl(w.cover_id, 'M'),
      isReadable,
      iaId: iaId || undefined,
    };
  });

  return {
    total,
    page,
    books,
  };
}

export function extractDescription(desc: unknown): string | undefined {
  if (!desc) return undefined;
  if (typeof desc === 'string') return desc;
  if (typeof desc === 'object' && desc !== null && 'value' in desc) {
    const val = (desc as { value?: unknown }).value;
    if (typeof val === 'string') return val;
  }
  return undefined;
}

export function normalizeBookDetail(
  workData: Record<string, unknown>,
  cleanKey: string,
  editionData?: Record<string, unknown> | null,
  authorNames: string[] = [],
  iaFallback?: string
): BookDetail {
  const title = (typeof workData.title === 'string' ? workData.title : undefined) || 'Untitled';
  const description = extractDescription(workData.description);
  
  // Extract cover
  let coverId: number | undefined;
  if (Array.isArray(workData.covers) && workData.covers.length > 0) {
    coverId = Number(workData.covers[0]);
  } else if (editionData && Array.isArray(editionData.covers) && editionData.covers.length > 0) {
    coverId = Number(editionData.covers[0]);
  }

  // Extract subjects
  let subjects: string[] = [];
  if (Array.isArray(workData.subjects)) {
    subjects = workData.subjects
      .filter((s): s is string => typeof s === 'string')
      .slice(0, 8);
  }

  // Extract publishers and page counts from edition
  let publishers: string[] = [];
  let pageCount: number | undefined;
  let publishDate: string | undefined;
  let isbn: string[] | undefined;
  let iaId: string | undefined;

  if (editionData) {
    if (Array.isArray(editionData.publishers)) {
      publishers = editionData.publishers.map((p) => (typeof p === 'string' ? p : (p?.name || ''))).filter(Boolean);
    }
    if (typeof editionData.number_of_pages === 'number') {
      pageCount = editionData.number_of_pages;
    }
    if (typeof editionData.publish_date === 'string') {
      publishDate = editionData.publish_date;
    }
    
    // Check edition ISBN
    const rawIsbn = [
      ...(Array.isArray(editionData.isbn_13) ? editionData.isbn_13 : []),
      ...(Array.isArray(editionData.isbn_10) ? editionData.isbn_10 : []),
    ];
    if (rawIsbn.length > 0) {
      isbn = rawIsbn.filter((id): id is string => typeof id === 'string').slice(0, 5);
    }

    // Check Archive.org IA ID
    if (typeof editionData.ocaid === 'string' && editionData.ocaid.trim()) {
      iaId = editionData.ocaid.trim();
    } else if (Array.isArray(editionData.ia) && editionData.ia.length > 0 && typeof editionData.ia[0] === 'string') {
      iaId = editionData.ia[0].trim();
    } else if (typeof editionData.ia === 'string' && editionData.ia.trim()) {
      iaId = editionData.ia.trim();
    } else if (Array.isArray(editionData.ia_loaded_id) && editionData.ia_loaded_id.length > 0) {
      iaId = String(editionData.ia_loaded_id[0]).trim();
    }
  }

  if (!iaId && iaFallback) {
    iaId = iaFallback.trim();
  }

  const isReadable = Boolean(iaId);
  const readerUrl = iaId ? `https://archive.org/embed/${encodeURIComponent(iaId)}` : undefined;
  const previewUrl = `https://openlibrary.org/works/${cleanKey}`;

  return {
    key: cleanKey,
    title,
    authors: authorNames,
    description,
    subjects,
    publishers,
    pageCount,
    publishDate,
    isbn,
    coverUrl: buildCoverUrl(coverId, 'L'),
    isReadable,
    iaId,
    readerUrl,
    previewUrl,
  };
}


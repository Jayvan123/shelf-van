import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { cacheStore, TTL_SEARCH, TTL_BOOK_DETAIL } from './cache.js';
import {
  fetchFromOpenLibrary,
  OpenLibraryError,
  RateLimitError,
  NotFoundError,
} from './client.js';
import {
  extractCleanKey,
  normalizeSearchResponse,
  normalizeSubjectResponse,
  normalizeBookDetail,
  type OpenLibrarySearchRawResponse,
  type OpenLibrarySubjectRawResponse,
} from './normalizers.js';
import {
  searchGoogleBooks,
  getGoogleBookDetail,
} from './googleBooks.js';
import type { BookDetail, BookSummary, SearchResponse } from './types.js';

export const app = new Hono();
const api = new Hono();

// Middlewares
app.use('*', logger());
app.use(
  '*',
  cors({
    origin: '*',
    allowMethods: ['GET', 'POST', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Accept', 'Authorization'],
  })
);

app.onError((err, c) => {
  console.error('[BFF Error]', err);
  return c.json({ error: err.message || 'Internal Server Error', code: 'INTERNAL_ERROR' }, 500);
});

// Health check
api.get('/health', (c) => {
  return c.json({ status: 'ok', service: 'ShelfVan BFF', timestamp: new Date().toISOString() });
});

// GET /api/search?q={query}&page={page}&provider={all|openlibrary|googlebooks}
api.get('/search', async (c) => {
  const query = c.req.query('q') || '';
  const pageStr = c.req.query('page') || '1';
  const page = Math.max(1, parseInt(pageStr, 10) || 1);
  const provider = (c.req.query('provider') || 'all').toLowerCase();

  const trimmedQuery = query.trim();
  if (!trimmedQuery) {
    const emptyResponse: SearchResponse = { total: 0, page: 1, books: [] };
    return c.json(emptyResponse);
  }

  const cacheKey = `search:${provider}:${trimmedQuery.toLowerCase()}:${page}`;
  const cached = cacheStore.get<SearchResponse>(cacheKey);
  if (cached) {
    console.log(`[Cache Hit] Search: "${trimmedQuery}" (${provider}, Page ${page})`);
    return c.json(cached);
  }

  // 1. Google Books only
  if (provider === 'googlebooks') {
    try {
      const gbResponse = await searchGoogleBooks(trimmedQuery, page, 20);
      cacheStore.set(cacheKey, gbResponse, TTL_SEARCH);
      return c.json(gbResponse);
    } catch (err: unknown) {
      console.error('[Google Books Search Error]', err);
      return c.json({ error: 'Failed to search Google Books', code: 'GOOGLE_BOOKS_ERROR' }, 500);
    }
  }

  // 2. Open Library only
  if (provider === 'openlibrary') {
    try {
      const path = `/search.json?q=${encodeURIComponent(trimmedQuery)}&page=${page}&limit=20`;
      const raw = await fetchFromOpenLibrary<OpenLibrarySearchRawResponse>(path);
      const normalized = normalizeSearchResponse(raw, page);
      cacheStore.set(cacheKey, normalized, TTL_SEARCH);
      return c.json(normalized);
    } catch (err: unknown) {
      if (err instanceof RateLimitError) {
        return c.json({ error: err.message, code: 'RATE_LIMITED' }, 429);
      }
      if (err instanceof OpenLibraryError) {
        return c.json({ error: err.message, code: 'OPEN_LIBRARY_ERROR' }, err.status as 400 | 500);
      }
      return c.json({ error: 'Internal server error while searching', code: 'INTERNAL_ERROR' }, 500);
    }
  }

  // 3. Unified Search ('all'): Query both Google Books and Open Library concurrently
  const [olResult, gbResult] = await Promise.allSettled([
    (async () => {
      const path = `/search.json?q=${encodeURIComponent(trimmedQuery)}&page=${page}&limit=15`;
      const raw = await fetchFromOpenLibrary<OpenLibrarySearchRawResponse>(path);
      return normalizeSearchResponse(raw, page);
    })(),
    searchGoogleBooks(trimmedQuery, page, 15),
  ]);

  const olBooks = olResult.status === 'fulfilled' ? olResult.value.books : [];
  const gbBooks = gbResult.status === 'fulfilled' ? gbResult.value.books : [];
  const olTotal = olResult.status === 'fulfilled' ? olResult.value.total : 0;
  const gbTotal = gbResult.status === 'fulfilled' ? gbResult.value.total : 0;

  // Interleave and deduplicate results
  const combinedBooks: BookSummary[] = [];
  const seenTitles = new Set<string>();

  const pushBook = (book: BookSummary) => {
    const normTitle = book.title.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (!normTitle || seenTitles.has(normTitle)) return;
    seenTitles.add(normTitle);
    combinedBooks.push(book);
  };

  const maxLen = Math.max(gbBooks.length, olBooks.length);
  for (let i = 0; i < maxLen; i++) {
    // Interleave: Google Books (great for modern titles/wattpad/web novels) and Open Library (great for scans)
    if (i < gbBooks.length) pushBook(gbBooks[i]);
    if (i < olBooks.length) pushBook(olBooks[i]);
  }

  // If both failed, return an error
  if (olResult.status === 'rejected' && gbResult.status === 'rejected') {
    return c.json(
      { error: 'All book providers failed to respond. Please try again.', code: 'PROVIDERS_UNAVAILABLE' },
      502
    );
  }

  const mergedResponse: SearchResponse = {
    total: Math.max(olTotal + gbTotal, combinedBooks.length),
    page,
    books: combinedBooks,
  };

  cacheStore.set(cacheKey, mergedResponse, TTL_SEARCH);
  return c.json(mergedResponse);
});

// GET /api/subjects/:subject?page={page}
api.get('/subjects/:subject', async (c) => {
  const rawSubject = c.req.param('subject') || '';
  const cleanSubject = rawSubject.toLowerCase().trim().replace(/\s+/g, '_');
  const pageStr = c.req.query('page') || '1';
  const page = Math.max(1, parseInt(pageStr, 10) || 1);

  if (!cleanSubject) {
    return c.json({ total: 0, page: 1, books: [] } satisfies SearchResponse);
  }

  const cacheKey = `subject:${cleanSubject}:${page}`;
  const cached = cacheStore.get<SearchResponse>(cacheKey);
  if (cached) {
    console.log(`[Cache Hit] Subject: "${cleanSubject}" (Page ${page})`);
    return c.json(cached);
  }

  try {
    const offset = (page - 1) * 20;
    const path = `/subjects/${encodeURIComponent(cleanSubject)}.json?limit=20&offset=${offset}`;
    const raw = await fetchFromOpenLibrary<OpenLibrarySubjectRawResponse>(path);
    const normalized = normalizeSubjectResponse(raw, page);

    cacheStore.set(cacheKey, normalized, TTL_SEARCH);
    return c.json(normalized);
  } catch (err: unknown) {
    if (err instanceof RateLimitError) {
      return c.json({ error: err.message, code: 'RATE_LIMITED' }, 429);
    }
    if (err instanceof OpenLibraryError) {
      return c.json({ error: err.message, code: 'OPEN_LIBRARY_ERROR' }, err.status as 400 | 500);
    }
    return c.json({ error: 'Failed to retrieve catalog books', code: 'INTERNAL_ERROR' }, 500);
  }
});

// GET /api/books/:key
api.get('/books/:key', async (c) => {
  const rawKey = c.req.param('key');
  const cleanKey = extractCleanKey(rawKey);

  if (!cleanKey) {
    return c.json({ error: 'Missing book key', code: 'BAD_REQUEST' }, 400);
  }

  const cacheKey = `book:${cleanKey}`;
  const cached = cacheStore.get<BookDetail>(cacheKey);
  if (cached) {
    console.log(`[Cache Hit] Book Detail: "${cleanKey}"`);
    return c.json(cached);
  }

  // Handle Google Books provider
  if (cleanKey.startsWith('gb_') || cleanKey.startsWith('gb:')) {
    const volumeId = cleanKey.replace(/^gb[_:]/, '');
    try {
      const bookDetail = await getGoogleBookDetail(volumeId);
      cacheStore.set(cacheKey, bookDetail, TTL_BOOK_DETAIL);
      return c.json(bookDetail);
    } catch (err: unknown) {
      console.error(`[Google Books Detail Error] Volume ID "${volumeId}":`, err);
      return c.json({ error: 'Book not found on Google Books', code: 'NOT_FOUND' }, 404);
    }
  }

  try {
    const isEdition = cleanKey.toUpperCase().endsWith('M');
    let workData: Record<string, unknown> = {};
    let topEdition: Record<string, unknown> | null = null;
    let authorNames: string[] = [];
    let iaFallback: string | undefined;

    if (isEdition) {
      // Direct edition lookup
      const editionRaw = await fetchFromOpenLibrary<Record<string, unknown>>(`/books/${cleanKey}.json`);
      topEdition = editionRaw;
      workData = editionRaw;

      // If work link exists, fetch work data for description/subjects
      if (Array.isArray(editionRaw.works) && editionRaw.works.length > 0) {
        const workRef = editionRaw.works[0] as { key?: string };
        if (workRef?.key) {
          try {
            const workClean = extractCleanKey(workRef.key);
            const parentWork = await fetchFromOpenLibrary<Record<string, unknown>>(`/works/${workClean}.json`);
            if (parentWork) {
              workData = { ...editionRaw, ...parentWork };
            }

            // If current edition has a restricted or missing IA scan, check parent work for an open scan
            const currentIa = String(editionRaw.ocaid || (Array.isArray(editionRaw.ia) ? editionRaw.ia[0] : editionRaw.ia) || '');
            if (!currentIa || currentIa.toLowerCase().startsWith('bwb_') || currentIa.toLowerCase().includes('0000')) {
              try {
                const editionsRaw = await fetchFromOpenLibrary<{ entries?: Record<string, unknown>[] }>(
                  `/works/${workClean}/editions.json?limit=25`
                );
                if (Array.isArray(editionsRaw.entries)) {
                  const openEdition = editionsRaw.entries.find((e) => {
                    const id = String(e.ocaid || (Array.isArray(e.ia) ? e.ia[0] : e.ia) || '');
                    return id && !id.toLowerCase().startsWith('bwb_') && !id.toLowerCase().startsWith('daisy_') && !id.toLowerCase().includes('0000');
                  });
                  if (openEdition) {
                    topEdition = openEdition;
                  }
                }
              } catch {
                // Non-critical
              }
            }
          } catch {
            // Non-critical if work fetch fails
          }
        }
      }
    } else {
      // Work level lookup
      workData = await fetchFromOpenLibrary<Record<string, unknown>>(`/works/${cleanKey}.json`);

      // Fetch editions (up to 25) to find publishers, page counts, and an IA scan
      try {
        const editionsRaw = await fetchFromOpenLibrary<{ entries?: Record<string, unknown>[] }>(
          `/works/${cleanKey}/editions.json?limit=25`
        );
        if (Array.isArray(editionsRaw.entries) && editionsRaw.entries.length > 0) {
          // Helper to extract IA ID from edition
          const getIaId = (e: Record<string, unknown>): string => {
            if (typeof e.ocaid === 'string' && e.ocaid.trim()) return e.ocaid.trim();
            if (Array.isArray(e.ia) && e.ia.length > 0 && typeof e.ia[0] === 'string') return e.ia[0].trim();
            if (typeof e.ia === 'string' && e.ia.trim()) return e.ia.trim();
            if (Array.isArray(e.ia_loaded_id) && e.ia_loaded_id.length > 0) return String(e.ia_loaded_id[0]).trim();
            return '';
          };

          const isOpenScan = (id: string): boolean => {
            if (!id) return false;
            const lower = id.toLowerCase();
            return !lower.startsWith('bwb_') && !lower.startsWith('daisy_') && !lower.includes('0000');
          };

          // Priority 1: An edition with an open public scan (fully readable in iframe without CDL lock)
          const openEdition = editionsRaw.entries.find((e) => isOpenScan(getIaId(e)));

          // Priority 2: Any edition with a scan
          const readableEdition = openEdition || editionsRaw.entries.find((e) => Boolean(getIaId(e)));
          topEdition = readableEdition || editionsRaw.entries[0] || null;
        }
      } catch {
        // Non-critical
      }

      // If topEdition didn't provide an IA scan ID, query the search index for this specific work
      if (!topEdition?.ocaid && !topEdition?.ia) {
        try {
          const workSearch = await fetchFromOpenLibrary<{ docs?: Array<{ ia?: string[] | string }> }>(
            `/search.json?q=key:/works/${cleanKey}&fields=ia&limit=5`
          );
          const docs = workSearch.docs || [];
          for (const doc of docs) {
            const iaList = Array.isArray(doc.ia) ? doc.ia : (doc.ia ? [doc.ia] : []);
            const openIa = iaList.find((id) => {
              const lower = id.toLowerCase();
              return !lower.startsWith('bwb_') && !lower.startsWith('daisy_') && !lower.includes('0000');
            });
            if (openIa) {
              iaFallback = openIa;
              break;
            }
            if (!iaFallback && iaList.length > 0) {
              iaFallback = iaList[0];
            }
          }
        } catch {
          // Non-critical
        }
      }

      // Resolve author names if present
      if (Array.isArray(workData.authors) && workData.authors.length > 0) {
        const authorPromises = workData.authors.slice(0, 3).map(async (a: unknown) => {
          const authKey = (a as { author?: { key?: string } })?.author?.key;
          if (!authKey) return null;
          try {
            const authorData = await fetchFromOpenLibrary<{ name?: string }>(`${authKey}.json`);
            return authorData.name || null;
          } catch {
            return null;
          }
        });
        const resolved = await Promise.all(authorPromises);
        authorNames = resolved.filter((name): name is string => typeof name === 'string');
      }
    }

    const normalized = normalizeBookDetail(workData, cleanKey, topEdition, authorNames, iaFallback);
    cacheStore.set(cacheKey, normalized, TTL_BOOK_DETAIL);
    return c.json(normalized);
  } catch (err: unknown) {
    if (err instanceof RateLimitError) {
      return c.json({ error: err.message, code: 'RATE_LIMITED' }, 429);
    }
    if (err instanceof NotFoundError) {
      return c.json({ error: 'Book not found on Open Library', code: 'NOT_FOUND' }, 404);
    }
    if (err instanceof OpenLibraryError) {
      return c.json({ error: err.message, code: 'OPEN_LIBRARY_ERROR' }, err.status as 400 | 500);
    }
    return c.json({ error: 'Failed to retrieve book details', code: 'INTERNAL_ERROR' }, 500);
  }
});

// GET /api/cover/:coverId?size=M
api.get('/cover/:coverId', async (c) => {
  const coverId = c.req.param('coverId');
  const sizeParam = (c.req.query('size') || 'M').toUpperCase();
  const size = ['S', 'M', 'L'].includes(sizeParam) ? sizeParam : 'M';

  if (!coverId || isNaN(Number(coverId))) {
    return c.text('Invalid cover ID', 400);
  }

  const coverUrl = `https://covers.openlibrary.org/b/id/${coverId}-${size}.jpg?default=false`;

  try {
    const res = await fetch(coverUrl, {
      headers: {
        'User-Agent': process.env.OPEN_LIBRARY_USER_AGENT || 'ShelfVan (contact@example.com)',
      },
    });

    if (!res.ok) {
      return c.text('Cover not found', 404);
    }

    const contentType = res.headers.get('content-type') || 'image/jpeg';
    const buffer = await res.arrayBuffer();

    c.header('Content-Type', contentType);
    c.header('Cache-Control', 'public, max-age=86400, immutable');
    return c.body(buffer);
  } catch {
    return c.text('Failed to load cover image', 502);
  }
});

// Mount routes on both /api (when called with /api prefix) and root / (if prefix stripped by reverse proxy)
app.route('/api', api);
app.route('/', api);

export default app;


import { olQueue } from './limiter.js';

export class OpenLibraryError extends Error {
  constructor(
    message: string,
    public status: number,
    public url: string
  ) {
    super(message);
    this.name = 'OpenLibraryError';
  }
}

export class RateLimitError extends OpenLibraryError {
  constructor(url: string) {
    super('Open Library rate limit exceeded (HTTP 429). Please slow down and try again shortly.', 429, url);
    this.name = 'RateLimitError';
  }
}

export class NotFoundError extends OpenLibraryError {
  constructor(resource: string, url: string) {
    super(`Resource not found: ${resource}`, 404, url);
    this.name = 'NotFoundError';
  }
}

const USER_AGENT = process.env.OPEN_LIBRARY_USER_AGENT || 'ShelfVan (contact@example.com)';

export async function fetchFromOpenLibrary<T = unknown>(
  path: string,
  options?: { timeoutMs?: number }
): Promise<T> {
  const url = path.startsWith('http') ? path : `https://openlibrary.org${path}`;
  const timeoutMs = options?.timeoutMs || 10000;

  return olQueue.run(async () => {
    console.log(`[OL Client] Requesting: ${url}`);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': USER_AGENT,
          Accept: 'application/json',
        },
        signal: controller.signal,
      });

      if (response.status === 429) {
        console.warn(`[OL Client] 429 Rate limit hit for ${url}`);
        throw new RateLimitError(url);
      }

      if (response.status === 404) {
        throw new NotFoundError(path, url);
      }

      if (!response.ok) {
        throw new OpenLibraryError(
          `Open Library API error: ${response.statusText} (${response.status})`,
          response.status,
          url
        );
      }

      return (await response.json()) as T;
    } catch (err: unknown) {
      if (err instanceof OpenLibraryError) {
        throw err;
      }
      if (err instanceof Error && err.name === 'AbortError') {
        throw new OpenLibraryError(`Request timed out after ${timeoutMs}ms`, 504, url);
      }
      throw new OpenLibraryError(
        err instanceof Error ? err.message : 'Unknown network error',
        500,
        url
      );
    } finally {
      clearTimeout(timeout);
    }
  });
}


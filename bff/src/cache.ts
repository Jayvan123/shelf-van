import NodeCache from 'node-cache';

export interface CacheStore {
  get<T>(key: string): T | undefined;
  set<T>(key: string, value: T, ttlSeconds: number): void;
  del(key: string): void;
  has(key: string): boolean;
}

export class InMemoryCacheStore implements CacheStore {
  private cache: NodeCache;

  constructor() {
    this.cache = new NodeCache({
      stdTTL: 600, // default 10 minutes
      checkperiod: 120,
      useClones: false,
    });
  }

  get<T>(key: string): T | undefined {
    return this.cache.get<T>(key);
  }

  set<T>(key: string, value: T, ttlSeconds: number): void {
    this.cache.set(key, value, ttlSeconds);
  }

  del(key: string): void {
    this.cache.del(key);
  }

  has(key: string): boolean {
    return this.cache.has(key);
  }
}

export const cacheStore: CacheStore = new InMemoryCacheStore();

// TTL Constants
export const TTL_SEARCH = 600;      // 10 minutes
export const TTL_BOOK_DETAIL = 3600; // 1 hour
export const TTL_COVER = 86400;     // 24 hours


import { useQuery } from '@tanstack/react-query';
import { searchBooks, getSubjectBooks, getBookDetail, ApiError } from './client.ts';

export function useBookSearch(query: string, page: number = 1) {
  return useQuery({
    queryKey: ['search', query.trim(), page],
    queryFn: () => searchBooks(query, page),
    enabled: query.trim().length > 0,
    staleTime: 5 * 60 * 1000,
    retry: (failureCount, error) => {
      if (error instanceof ApiError && (error.status === 404 || error.status === 429)) {
        return false;
      }
      return failureCount < 2;
    },
  });
}

export function useSubjectBooks(subject?: string, page: number = 1) {
  const clean = subject?.trim();
  return useQuery({
    queryKey: ['subject', clean, page],
    queryFn: () => {
      if (!clean) throw new Error('Missing subject');
      return getSubjectBooks(clean, page);
    },
    enabled: Boolean(clean && clean.length > 0),
    staleTime: 5 * 60 * 1000,
    retry: (failureCount, error) => {
      if (error instanceof ApiError && (error.status === 404 || error.status === 429)) {
        return false;
      }
      return failureCount < 2;
    },
  });
}

export function useBookDetail(key?: string) {
  return useQuery({
    queryKey: ['book', key],
    queryFn: () => {
      if (!key) throw new Error('Missing book key');
      return getBookDetail(key);
    },
    enabled: Boolean(key && key.trim().length > 0),
    staleTime: 10 * 60 * 1000,
    retry: (failureCount, error) => {
      if (error instanceof ApiError && (error.status === 404 || error.status === 429)) {
        return false;
      }
      return failureCount < 1;
    },
  });
}

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { BookSummary, BookDetail, ReadingStatus, ShelfBook } from '../types/index.ts';

interface ShelfState {
  books: ShelfBook[];
  addOrUpdateBook: (book: BookSummary | BookDetail, status: ReadingStatus) => void;
  removeBook: (key: string) => void;
  updateStatus: (key: string, status: ReadingStatus) => void;
  getBook: (key: string) => ShelfBook | undefined;
}

export const useShelfStore = create<ShelfState>()(
  persist(
    (set, get) => ({
      books: [],

      addOrUpdateBook: (book, status) => {
        set((state) => {
          const existingIndex = state.books.findIndex((b) => b.key === book.key);
          if (existingIndex >= 0) {
            const updated = [...state.books];
            const current = updated[existingIndex];
            if (current) {
              updated[existingIndex] = {
                ...current,
                ...book,
                status,
              };
            }
            return { books: updated };
          }

          const newShelfBook: ShelfBook = {
            ...book,
            status,
            addedAt: new Date().toISOString(),
          };
          return { books: [newShelfBook, ...state.books] };
        });
      },

      removeBook: (key) => {
        set((state) => ({
          books: state.books.filter((b) => b.key !== key),
        }));
      },

      updateStatus: (key, status) => {
        set((state) => ({
          books: state.books.map((b) => (b.key === key ? { ...b, status } : b)),
        }));
      },

      getBook: (key) => {
        return get().books.find((b) => b.key === key);
      },
    }),
    {
      name: 'shelfvan_shelf',
    }
  )
);


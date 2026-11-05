export interface BookSummary {
  key: string;              // Open Library ID, e.g., "OL45804W" or Google Books ID, e.g. "gb_s1gVAAAAYAAJ"
  title: string;
  authors: string[];
  firstPublishYear?: number;
  coverUrl?: string;        // Proxied or normalized cover URL
  isbn?: string[];
  isReadable?: boolean;     // True if an Internet Archive scan exists
  iaId?: string;            // Internet Archive identifier
  provider?: 'openlibrary' | 'googlebooks';
}

export interface BookDetail extends BookSummary {
  description?: string;
  publishers?: string[];
  publishDate?: string;
  pageCount?: number;
  subjects?: string[];
  previewUrl?: string;      // Open Library web page
  readerUrl?: string;       // Embeddable Archive.org reader iframe URL
}

export interface SearchResponse {
  total: number;
  page: number;
  books: BookSummary[];
}

export type ReadingStatus = 'want_to_read' | 'reading' | 'completed';

export interface ShelfBook extends BookSummary {
  status: ReadingStatus;
  addedAt: string;
  rating?: number;
}


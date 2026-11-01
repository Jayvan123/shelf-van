import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useBookSearch, useSubjectBooks } from '../api/hooks.ts';
import { useShelfStore } from '../store/useShelfStore.ts';
import type { BookSummary, ReadingStatus } from '../types/index.ts';

const POPULAR_CATALOGS = [
  { label: '📜 Classic Literature', subject: 'classic_literature' },
  { label: '🚀 Science Fiction', subject: 'science_fiction' },
  { label: '🧙 Fantasy', subject: 'fantasy' },
  { label: '🕵️ Mystery & Detective', subject: 'mystery_and_detective_stories' },
  { label: '🏛️ History', subject: 'history' },
  { label: '🧠 Philosophy', subject: 'philosophy' },
  { label: '💖 Romance', subject: 'romance' },
  { label: '🧸 Children', subject: 'children' },
  { label: '🎭 Plays & Drama', subject: 'plays' },
];

export const Search: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [selectedCatalog, setSelectedCatalog] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const { addOrUpdateBook, getBook } = useShelfStore();

  // Debounce search input by 300ms
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchTerm);
      if (searchTerm.trim()) {
        setSelectedCatalog(null); // Clear catalog when typing search
      }
      setPage(1);
    }, 300);

    return () => clearTimeout(handler);
  }, [searchTerm]);

  const searchQuery = useBookSearch(debouncedQuery, page);
  const subjectQuery = useSubjectBooks(selectedCatalog || undefined, page);

  const isBrowsingCatalog = Boolean(selectedCatalog && !debouncedQuery.trim());
  const activeQuery = isBrowsingCatalog ? subjectQuery : searchQuery;

  const { data, isLoading, isError, error, isFetching } = activeQuery;

  const handleSelectCatalog = (subject: string) => {
    setSearchTerm('');
    setDebouncedQuery('');
    setSelectedCatalog(subject);
    setPage(1);
  };

  const handleQuickAdd = (book: BookSummary, status: ReadingStatus) => {
    addOrUpdateBook(book, status);
  };

  return (
    <div style={{ padding: '0 16px' }}>
      <h2>Discover & Search Books</h2>

      {/* Catalogs List / Genre Chips */}
      <div style={{ margin: '16px 0' }}>
        <strong>Browse Catalogs:</strong>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '8px' }}>
          {POPULAR_CATALOGS.map((cat) => {
            const isSelected = selectedCatalog === cat.subject && !debouncedQuery.trim();
            return (
              <button
                key={cat.subject}
                onClick={() => handleSelectCatalog(cat.subject)}
                style={{
                  backgroundColor: isSelected ? '#1a73e8' : '#f0f0f0',
                  color: isSelected ? '#fff' : '#333',
                  fontWeight: isSelected ? 'bold' : 'normal',
                }}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      <hr style={{ border: 'none', borderTop: '1px solid #eee', margin: '16px 0' }} />

      {/* Search Input */}
      <div style={{ margin: '16px 0', display: 'flex', gap: '8px', alignItems: 'center' }}>
        <input
          type="text"
          placeholder="Or type a title, author, or subject..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ width: '380px', maxWidth: '100%', padding: '8px' }}
        />
        {searchTerm && (
          <button onClick={() => { setSearchTerm(''); setDebouncedQuery(''); }}>Clear</button>
        )}
        {isFetching && <span style={{ fontSize: '0.85rem', color: '#666' }}>Loading...</span>}
      </div>

      {/* Error state */}
      {isError && (
        <div style={{ padding: '12px', background: '#ffebee', color: '#c62828', marginBottom: '16px', border: '1px solid #ef9a9a' }}>
          <strong>Notice:</strong> {error instanceof Error ? error.message : 'Failed to retrieve books.'}
        </div>
      )}

      {/* Empty Initial State (No search and no catalog selected) */}
      {!debouncedQuery && !selectedCatalog && (
        <div style={{ color: '#666', marginTop: '24px' }}>
          <p>Select a <strong>Catalog</strong> above (like <em>Classic Literature</em> or <em>Science Fiction</em>) or type in a title to start browsing.</p>
        </div>
      )}

      {/* Loading Skeleton / State */}
      {isLoading && (
        <div style={{ marginTop: '24px' }}>
          <p>Fetching catalog books from Open Library via ShelfVan BFF...</p>
        </div>
      )}

      {/* Results */}
      {data && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <p style={{ margin: 0, color: '#555' }}>
              {isBrowsingCatalog ? (
                <>Catalog: <strong>{POPULAR_CATALOGS.find(c => c.subject === selectedCatalog)?.label || selectedCatalog}</strong> ({data.total} books)</>
              ) : (
                <>Found <strong>{data.total}</strong> results for "{debouncedQuery}"</>
              )}{' '}
              - Page {data.page}
            </p>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                disabled={page <= 1 || isFetching}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                &larr; Previous Page
              </button>
              <button
                disabled={data.books.length < 20 || isFetching}
                onClick={() => setPage((p) => p + 1)}
              >
                Next Page &rarr;
              </button>
            </div>
          </div>

          {data.books.length === 0 ? (
            <p>No books found. Try selecting another catalog or search term.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {data.books.map((book) => {
                const shelfEntry = getBook(book.key);
                const coverSrc = book.coverUrl ? `http://localhost:3000${book.coverUrl}` : undefined;

                return (
                  <div
                    key={book.key}
                    style={{
                      display: 'flex',
                      gap: '16px',
                      border: '1px solid #ddd',
                      padding: '12px',
                      borderRadius: '4px',
                    }}
                  >
                    {coverSrc ? (
                      <img
                        src={coverSrc}
                        alt={book.title}
                        style={{ width: '70px', height: '100px', objectFit: 'cover' }}
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          width: '70px',
                          height: '100px',
                          backgroundColor: '#eee',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '10px',
                          textAlign: 'center',
                        }}
                      >
                        No Cover
                      </div>
                    )}

                    <div style={{ flex: 1 }}>
                      <h4 style={{ margin: '0 0 4px 0' }}>
                        <Link to={`/book/${book.key}`}>{book.title}</Link>
                      </h4>
                      <p style={{ margin: '0 0 4px 0', fontSize: '0.9rem', color: '#444' }}>
                        Author: {book.authors.length > 0 ? book.authors.join(', ') : 'Unknown'}
                      </p>
                      {book.firstPublishYear && (
                        <p style={{ margin: '0 0 6px 0', fontSize: '0.8rem', color: '#777' }}>
                          First published: {book.firstPublishYear}
                        </p>
                      )}

                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginTop: '6px' }}>
                        {book.isReadable && (
                          <span style={{ fontSize: '0.75rem', backgroundColor: '#e0f2fe', color: '#0369a1', padding: '2px 6px', borderRadius: '3px' }}>
                            📖 Scan Available
                          </span>
                        )}

                        <Link to={`/book/${book.key}`}>
                          <button>View Details</button>
                        </Link>

                        {shelfEntry ? (
                          <span style={{ fontSize: '0.85rem', color: '#2e7d32' }}>
                            ✓ In Shelf ({shelfEntry.status})
                          </span>
                        ) : (
                          <div style={{ display: 'inline-flex', gap: '4px' }}>
                            <button onClick={() => handleQuickAdd(book, 'want_to_read')}>
                              + Want to Read
                            </button>
                            <button onClick={() => handleQuickAdd(book, 'reading')}>
                              + Currently Reading
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

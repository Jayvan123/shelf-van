import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useBookSearch, useSubjectBooks } from '../api/hooks.ts';
import { BookCard } from '../components/BookCard.tsx';

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
  const [searchParams, setSearchParams] = useSearchParams();
  const catalogParam = searchParams.get('catalog');

  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  // Default to 'classic_literature' if no search or catalog is specified, so books with covers load immediately!
  const [selectedCatalog, setSelectedCatalog] = useState<string | null>(catalogParam || 'classic_literature');
  const [page, setPage] = useState(1);

  // Sync catalogParam from URL when navigating from All Catalogs
  useEffect(() => {
    if (catalogParam) {
      setSelectedCatalog(catalogParam);
      setSearchTerm('');
      setDebouncedQuery('');
      setPage(1);
    }
  }, [catalogParam]);

  // Debounce search input by 300ms
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchTerm);
      if (searchTerm.trim()) {
        setSelectedCatalog(null); // Clear catalog when typing search
        if (searchParams.get('catalog')) {
          setSearchParams({});
        }
      }
      setPage(1);
    }, 300);

    return () => clearTimeout(handler);
  }, [searchTerm, searchParams, setSearchParams]);

  const searchQuery = useBookSearch(debouncedQuery, page);
  const subjectQuery = useSubjectBooks(selectedCatalog || undefined, page);

  const isBrowsingCatalog = Boolean(selectedCatalog && !debouncedQuery.trim());
  const activeQuery = isBrowsingCatalog ? subjectQuery : searchQuery;

  const { data, isLoading, isError, error, isFetching } = activeQuery;

  const handleSelectCatalog = (subject: string) => {
    setSearchTerm('');
    setDebouncedQuery('');
    setSelectedCatalog(subject);
    setSearchParams({ catalog: subject });
    setPage(1);
  };

  return (
    <div style={{ padding: '0 16px', maxWidth: '1200px', margin: '0 auto' }}>
      <h2>Book Discovery & Catalog</h2>

      {/* Catalogs List / Genre Chips */}
      <div style={{ margin: '16px 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <strong>Browse Catalogs by Genre:</strong>
          <Link to="/catalogs" style={{ fontSize: '0.9rem' }}>
            View All 50+ Genres &rarr;
          </Link>
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
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

      {/* Search Input Bar */}
      <div style={{ margin: '16px 0', display: 'flex', gap: '8px', alignItems: 'center' }}>
        <input
          type="text"
          placeholder="Or type a book title, author, or subject..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ width: '380px', maxWidth: '100%', padding: '8px' }}
        />
        {searchTerm && (
          <button onClick={() => { setSearchTerm(''); setDebouncedQuery(''); setSelectedCatalog('classic_literature'); }}>
            Clear Search
          </button>
        )}
        {isFetching && <span style={{ fontSize: '0.85rem', color: '#666' }}>Fetching covers...</span>}
      </div>

      {/* Error state */}
      {isError && (
        <div style={{ padding: '12px', background: '#ffebee', color: '#c62828', marginBottom: '16px', border: '1px solid #ef9a9a', borderRadius: '4px' }}>
          <strong>Notice:</strong> {error instanceof Error ? error.message : 'Failed to retrieve books.'}
        </div>
      )}

      {/* Loading Skeleton / State */}
      {isLoading && (
        <div style={{ marginTop: '24px', textAlign: 'center', padding: '32px 0' }}>
          <p>Loading book covers from Open Library via BFF proxy...</p>
        </div>
      )}

      {/* Book Covers Grid */}
      {data && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '16px 0' }}>
            <p style={{ margin: 0, color: '#444' }}>
              {isBrowsingCatalog ? (
                <>Showing catalog: <strong>{POPULAR_CATALOGS.find(c => c.subject === selectedCatalog)?.label || selectedCatalog}</strong> ({data.total} books)</>
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
            <p style={{ padding: '32px 0', textAlign: 'center', color: '#666' }}>
              No books found. Try selecting another catalog or a different search term.
            </p>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                gap: '20px',
                marginTop: '16px',
              }}
            >
              {data.books.map((book) => (
                <BookCard key={book.key} book={book} />
              ))}
            </div>
          )}

          {/* Bottom Pagination */}
          {data.books.length > 0 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginTop: '32px', paddingBottom: '32px' }}>
              <button
                disabled={page <= 1 || isFetching}
                onClick={() => { setPage((p) => Math.max(1, p - 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              >
                &larr; Previous Page
              </button>
              <span style={{ display: 'flex', alignItems: 'center', fontSize: '0.9rem', color: '#666' }}>
                Page {data.page}
              </span>
              <button
                disabled={data.books.length < 20 || isFetching}
                onClick={() => { setPage((p) => p + 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              >
                Next Page &rarr;
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

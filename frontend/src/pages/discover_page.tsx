import React, { useState, useEffect } from 'react';
import { Search as SearchIcon, X } from 'lucide-react';
import { useBookSearch } from '../api/hooks.ts';
import { BookCard } from '../components/BookCard.tsx';
import { BookRow } from '../components/BookRow.tsx';

// Predefined rows for the Discover screen
const DISCOVER_ROWS = [
  { title: 'Classic Literature', subject: 'classic_literature', icon: '📜' },
  { title: 'Science Fiction', subject: 'science_fiction', icon: '🚀' },
  { title: 'Fantasy', subject: 'fantasy', icon: '🧙' },
  { title: 'Mystery & Detective', subject: 'mystery_and_detective_stories', icon: '🕵️' },
  { title: 'History & Biography', subject: 'history', icon: '🏛️' },
  { title: 'Philosophy & Thought', subject: 'philosophy', icon: '🧠' },
  { title: 'Romance', subject: 'romance', icon: '💖' },
  { title: 'Children & Young Readers', subject: 'children', icon: '🧸' },
  { title: 'Plays & Drama', subject: 'plays', icon: '🎭' },
];

export const DiscoverPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [page, setPage] = useState(1);

  // 300ms debounce for search query
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchTerm);
      setPage(1);
    }, 300);

    return () => clearTimeout(handler);
  }, [searchTerm]);

  const { data: searchData, isLoading: isSearchLoading, isError: isSearchError, error: searchError, isFetching } = useBookSearch(
    debouncedQuery,
    page
  );

  const isSearching = Boolean(debouncedQuery.trim());

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '24px 20px 60px 20px' }}>
      {/* Search Input Bar */}
      <div style={{ marginBottom: '28px' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            backgroundColor: '#f8f8f8',
            borderRadius: '8px',
            padding: '10px 16px',
            border: '1px solid #ddd',
            maxWidth: '600px',
          }}
        >
          <SearchIcon size={18} color="#777" style={{ marginRight: '10px' }} />
          <input
            type="text"
            placeholder="Search by book title, author, or keyword..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              background: 'transparent',
              border: 'none',
              outline: 'none',
              fontSize: '1rem',
              width: '100%',
              color: '#1a1a1a',
            }}
          />
          {searchTerm && (
            <button
              onClick={() => { setSearchTerm(''); setDebouncedQuery(''); }}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px 6px' }}
            >
              <X size={16} color="#777" />
            </button>
          )}
        </div>
        {isFetching && isSearching && (
          <span style={{ fontSize: '0.85rem', color: '#888', marginTop: '6px', display: 'inline-block' }}>
            Searching Open Library...
          </span>
        )}
      </div>

      {/* Mode A: Live Search Results Grid (when user typed a query) */}
      {isSearching ? (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '1.3rem', fontWeight: '700', margin: 0 }}>
              Search Results for "{debouncedQuery}"
            </h2>
            {searchData && (
              <span style={{ fontSize: '0.9rem', color: '#666' }}>
                {searchData.total.toLocaleString()} books found (Page {searchData.page})
              </span>
            )}
          </div>

          {isSearchError && (
            <div style={{ padding: '16px', backgroundColor: '#fff3f0', color: '#d32f2f', border: '1px solid #ffccba', borderRadius: '6px', marginBottom: '20px' }}>
              Notice: {searchError instanceof Error ? searchError.message : 'Search failed. Please try again.'}
            </div>
          )}

          {isSearchLoading ? (
            <div style={{ padding: '40px 0', textAlign: 'center', color: '#777' }}>
              <p>Fetching search results...</p>
            </div>
          ) : searchData && searchData.books.length > 0 ? (
            <div>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))',
                  gap: '24px 16px',
                }}
              >
                {searchData.books.map((book) => (
                  <BookCard key={book.key} book={book} />
                ))}
              </div>

              {/* Pagination */}
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '16px', marginTop: '40px' }}>
                <button
                  disabled={page <= 1 || isFetching}
                  onClick={() => { setPage((p) => Math.max(1, p - 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  style={{ padding: '8px 16px', borderRadius: '4px', border: '1px solid #ccc', cursor: page > 1 ? 'pointer' : 'not-allowed' }}
                >
                  &larr; Previous Page
                </button>
                <span style={{ fontSize: '0.9rem', color: '#555' }}>Page {page}</span>
                <button
                  disabled={searchData.books.length < 20 || isFetching}
                  onClick={() => { setPage((p) => p + 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  style={{ padding: '8px 16px', borderRadius: '4px', border: '1px solid #ccc', cursor: 'pointer' }}
                >
                  Next Page &rarr;
                </button>
              </div>
            </div>
          ) : (
            <p style={{ padding: '40px 0', textAlign: 'center', color: '#666' }}>
              No books found matching "{debouncedQuery}". Try a different search term.
            </p>
          )}
        </div>
      ) : (
        /* Mode B: Horizontal Scrollable Category Rows (stacked under Books / Discover) */
        <div>
          {DISCOVER_ROWS.map((row) => (
            <BookRow
              key={row.subject}
              title={row.title}
              subject={row.subject}
              icon={row.icon}
            />
          ))}
        </div>
      )}
    </div>
  );
};

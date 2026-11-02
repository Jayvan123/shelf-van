import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useBookSearch } from '../api/hooks.ts';
import { BookCard } from '../components/BookCard.tsx';
import { BookRow } from '../components/BookRow.tsx';
import { FeaturedBanner } from '../components/FeaturedBanner.tsx';

// Predefined rows for the Discover screen
const DISCOVER_ROWS = [
  { title: 'Classic Literature', subject: 'classic_literature' },
  { title: 'Science Fiction', subject: 'science_fiction' },
  { title: 'Fantasy', subject: 'fantasy' },
  { title: 'Mystery & Detective', subject: 'mystery_and_detective_stories' },
  { title: 'History & Biography', subject: 'history' },
  { title: 'Philosophy & Thought', subject: 'philosophy' },
  { title: 'Romance', subject: 'romance' },
  { title: 'Children & Young Readers', subject: 'children' },
  { title: 'Plays & Drama', subject: 'plays' },
];

export const DiscoverPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const queryParam = searchParams.get('q') || '';
  const [page, setPage] = useState(1);

  // Reset page to 1 when query changes
  useEffect(() => {
    setPage(1);
  }, [queryParam]);

  const { data: searchData, isLoading: isSearchLoading, isError: isSearchError, error: searchError, isFetching } = useBookSearch(
    queryParam,
    page
  );

  const isSearching = Boolean(queryParam.trim());

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '24px 20px 60px 20px' }}>
      {/* Mode A: Live Search Results Grid (when user searched from the header) */}
      {isSearching ? (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: '800', margin: 0, letterSpacing: '-0.3px' }}>
              Search Results for "{queryParam}"
            </h2>
            {searchData && (
              <span style={{ fontSize: '0.9rem', color: '#71717a' }}>
                {searchData.total.toLocaleString()} books found (Page {searchData.page})
              </span>
            )}
          </div>

          {isSearchError && (
            <div style={{ padding: '16px', backgroundColor: '#fef2f2', color: '#991b1b', border: '1px solid #fecaca', borderRadius: '6px', marginBottom: '20px' }}>
              Notice: {searchError instanceof Error ? searchError.message : 'Search failed. Please try again.'}
            </div>
          )}

          {isSearchLoading ? (
            <div style={{ padding: '60px 0', textAlign: 'center', color: '#71717a' }}>
              <p>Fetching search results from Open Library...</p>
            </div>
          ) : searchData && searchData.books.length > 0 ? (
            <div>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                  gap: '28px 18px',
                }}
              >
                {searchData.books.map((book) => (
                  <BookCard key={book.key} book={book} />
                ))}
              </div>

              {/* Pagination */}
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '16px', marginTop: '48px' }}>
                <button
                  disabled={page <= 1 || isFetching}
                  onClick={() => { setPage((p) => Math.max(1, p - 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  style={{
                    padding: '8px 18px',
                    borderRadius: '6px',
                    border: '1px solid #d4d4d8',
                    backgroundColor: '#fff',
                    cursor: page > 1 ? 'pointer' : 'not-allowed',
                    opacity: page > 1 ? 1 : 0.5,
                    fontWeight: '600',
                  }}
                >
                  &larr; Previous Page
                </button>
                <span style={{ fontSize: '0.9rem', color: '#52525b', fontWeight: '500' }}>Page {page}</span>
                <button
                  disabled={searchData.books.length < 20 || isFetching}
                  onClick={() => { setPage((p) => p + 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  style={{
                    padding: '8px 18px',
                    borderRadius: '6px',
                    border: '1px solid #d4d4d8',
                    backgroundColor: '#fff',
                    cursor: 'pointer',
                    fontWeight: '600',
                  }}
                >
                  Next Page &rarr;
                </button>
              </div>
            </div>
          ) : (
            <p style={{ padding: '60px 0', textAlign: 'center', color: '#71717a' }}>
              No books found matching "{queryParam}". Try a different keyword or author.
            </p>
          )}
        </div>
      ) : (
        /* Mode B: Main Discover Screen */
        <div>
          {/* Big Featured Hero Banner matching the uploaded image */}
          <FeaturedBanner />

          {/* Horizontally Scrollable Category Rows */}
          {DISCOVER_ROWS.map((row) => (
            <BookRow
              key={row.subject}
              title={row.title}
              subject={row.subject}
            />
          ))}
        </div>
      )}
    </div>
  );
};

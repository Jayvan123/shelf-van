import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { BookOpen, Search as SearchIcon, X, ArrowRight } from 'lucide-react';
import { useBookSearch, useSubjectBooks } from '../api/hooks.ts';
import { BookCard } from '../components/BookCard.tsx';

const STORE_CATEGORIES = [
  { label: 'New arrivals', subject: 'new_arrivals', query: 'year:[2020 TO 2026]' },
  { label: 'Classics', subject: 'classic_literature' },
  { label: 'Sci-Fi', subject: 'science_fiction' },
  { label: 'Fantasy', subject: 'fantasy' },
  { label: 'Mystery', subject: 'mystery_and_detective_stories' },
  { label: 'History', subject: 'history' },
  { label: 'Philosophy', subject: 'philosophy' },
  { label: 'Romance', subject: 'romance' },
  { label: 'Children', subject: 'children' },
  { label: 'Drama', subject: 'plays' },
];

export const Search: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const catalogParam = searchParams.get('catalog');

  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  // Default to 'classic_literature'
  const [selectedCategory, setSelectedCategory] = useState<string>(catalogParam || 'classic_literature');
  const [page, setPage] = useState(1);

  // Sync catalogParam from URL when navigating from All Catalogs
  useEffect(() => {
    if (catalogParam) {
      setSelectedCategory(catalogParam);
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
        if (searchParams.get('catalog')) {
          setSearchParams({});
        }
      }
      setPage(1);
    }, 300);

    return () => clearTimeout(handler);
  }, [searchTerm, searchParams, setSearchParams]);

  const searchQuery = useBookSearch(debouncedQuery, page);
  const subjectQuery = useSubjectBooks(selectedCategory, page);

  const isCustomSearch = Boolean(debouncedQuery.trim());
  const activeQuery = isCustomSearch ? searchQuery : subjectQuery;

  const { data, isLoading, isError, error, isFetching } = activeQuery;

  const handleCategoryClick = (subject: string) => {
    setSearchTerm('');
    setDebouncedQuery('');
    setSelectedCategory(subject);
    setSearchParams({ catalog: subject });
    setPage(1);
  };

  const currentCategoryLabel =
    STORE_CATEGORIES.find((c) => c.subject === selectedCategory)?.label ||
    selectedCategory.replace(/_/g, ' ');

  return (
    <div style={{ backgroundColor: '#fff', minHeight: '90vh' }}>
      {/* Category Tabs Bar matching reference image */}
      <div style={{ borderBottom: '1px solid #ededed', backgroundColor: '#fff' }}>
        <div
          style={{
            maxWidth: '1280px',
            margin: '0 auto',
            padding: '0 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px',
            overflowX: 'auto',
          }}
          className="hide-scrollbar"
        >
          {/* Category Tabs */}
          <div style={{ display: 'flex', gap: '24px', whiteSpace: 'nowrap' }}>
            {STORE_CATEGORIES.map((cat) => {
              const isActive = !isCustomSearch && selectedCategory === cat.subject;
              return (
                <button
                  key={cat.subject}
                  onClick={() => handleCategoryClick(cat.subject)}
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: '14px 2px',
                    fontSize: '0.92rem',
                    fontWeight: isActive ? '700' : '500',
                    color: isActive ? '#ff5436' : '#555',
                    borderBottom: isActive ? '2px solid #ff5436' : '2px solid transparent',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>

          {/* Link to All 50+ Catalogs */}
          <Link
            to="/catalogs"
            style={{
              fontSize: '0.85rem',
              color: '#888',
              whiteSpace: 'nowrap',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '6px 0',
            }}
          >
            All Genres
            <ArrowRight size={13} />
          </Link>
        </div>
      </div>

      {/* Main Content Area */}
      <main style={{ maxWidth: '1280px', margin: '0 auto', padding: '24px 24px 60px 24px' }}>
        {/* Title & Search Bar Row */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '16px',
            marginBottom: '28px',
          }}
        >
          {/* Section Heading matching reference image: 📖 New arrivals */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <BookOpen size={24} color="#1a1a1a" />
            <h1
              style={{
                fontSize: '1.45rem',
                fontWeight: '800',
                letterSpacing: '-0.4px',
                color: '#1a1a1a',
                textTransform: 'capitalize',
                margin: 0,
              }}
            >
              {isCustomSearch ? `Search: "${debouncedQuery}"` : currentCategoryLabel}
            </h1>
            {data && (
              <span style={{ fontSize: '0.85rem', color: '#999', marginLeft: '6px' }}>
                ({data.total.toLocaleString()} books)
              </span>
            )}
          </div>

          {/* Minimalist Search Input */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: '#f5f5f5',
              borderRadius: '24px',
              padding: '6px 14px',
              width: '320px',
              maxWidth: '100%',
              border: '1px solid #ebebeb',
            }}
          >
            <SearchIcon size={16} color="#888" style={{ marginRight: '8px' }} />
            <input
              type="text"
              placeholder="Search books, authors, ISBN..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                background: 'transparent',
                border: 'none',
                outline: 'none',
                fontSize: '0.88rem',
                width: '100%',
                color: '#1a1a1a',
              }}
            />
            {searchTerm && (
              <button
                onClick={() => { setSearchTerm(''); setDebouncedQuery(''); }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
              >
                <X size={15} color="#888" />
              </button>
            )}
          </div>
        </div>

        {/* Error notification */}
        {isError && (
          <div
            style={{
              padding: '16px',
              backgroundColor: '#fff3f0',
              border: '1px solid #ffccba',
              borderRadius: '8px',
              color: '#d32f2f',
              marginBottom: '24px',
              fontSize: '0.9rem',
            }}
          >
            {error instanceof Error ? error.message : 'Failed to load books.'}
          </div>
        )}

        {/* Loading State Skeleton */}
        {isLoading && (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#888' }}>
            <div style={{ fontSize: '1.8rem', marginBottom: '12px' }}>📖</div>
            <p style={{ fontSize: '0.95rem' }}>Loading book collection from Open Library...</p>
          </div>
        )}

        {/* 5-Column Responsive Book Covers Grid matching reference image */}
        {data && (
          <div>
            {data.books.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 0', color: '#888' }}>
                <p style={{ fontSize: '1.05rem', marginBottom: '8px' }}>No books found.</p>
                <button
                  onClick={() => { setSearchTerm(''); setDebouncedQuery(''); setSelectedCategory('classic_literature'); }}
                  style={{
                    backgroundColor: '#ff5436',
                    color: '#fff',
                    border: 'none',
                    padding: '8px 16px',
                    borderRadius: '6px',
                    fontWeight: '600',
                    cursor: 'pointer',
                  }}
                >
                  Explore Classics
                </button>
              </div>
            ) : (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))',
                  gap: '32px 24px',
                }}
              >
                {data.books.map((book) => (
                  <BookCard key={book.key} book={book} />
                ))}
              </div>
            )}

            {/* Pagination Controls */}
            {data.books.length > 0 && (
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: '16px',
                  marginTop: '48px',
                  paddingTop: '24px',
                  borderTop: '1px solid #f0f0f0',
                }}
              >
                <button
                  disabled={page <= 1 || isFetching}
                  onClick={() => {
                    setPage((p) => Math.max(1, p - 1));
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '6px',
                    border: '1px solid #ddd',
                    backgroundColor: '#fff',
                    cursor: page > 1 ? 'pointer' : 'not-allowed',
                    opacity: page > 1 ? 1 : 0.5,
                    fontWeight: '600',
                    fontSize: '0.85rem',
                  }}
                >
                  &larr; Previous Page
                </button>

                <span style={{ fontSize: '0.9rem', color: '#666', fontWeight: '500' }}>
                  Page {data.page}
                </span>

                <button
                  disabled={data.books.length < 20 || isFetching}
                  onClick={() => {
                    setPage((p) => p + 1);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '6px',
                    border: '1px solid #ddd',
                    backgroundColor: '#fff',
                    cursor: 'pointer',
                    fontWeight: '600',
                    fontSize: '0.85rem',
                  }}
                >
                  Next Page &rarr;
                </button>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

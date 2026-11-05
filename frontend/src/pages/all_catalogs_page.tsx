import React, { useState, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { ALL_CATALOG_CATEGORIES, type CatalogGenre } from '../constants/catalogs.ts';
import { useSubjectBooks } from '../api/hooks.ts';
import { BookCard } from '../components/BookCard.tsx';

export const AllCatalogsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedGenre = searchParams.get('genre');
  const [page, setPage] = useState(1);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const { data: genreBooks, isLoading: isGenreLoading, isError: isGenreError, isFetching } = useSubjectBooks(
    selectedGenre || undefined,
    page
  );

  const trimmedQuery = searchQuery.trim().toLowerCase();

  const allGenresFlat: CatalogGenre[] = useMemo(
    () => ALL_CATALOG_CATEGORIES.flatMap((c) => c.genres),
    []
  );

  const displayedGenres = useMemo(() => {
    let list =
      activeCategory === 'all'
        ? allGenresFlat
        : ALL_CATALOG_CATEGORIES.find((c) => c.category === activeCategory)?.genres || [];

    if (trimmedQuery) {
      list = list.filter(
        (g) =>
          g.name.toLowerCase().includes(trimmedQuery) ||
          g.subject.toLowerCase().includes(trimmedQuery) ||
          (g.description && g.description.toLowerCase().includes(trimmedQuery))
      );
    }

    return list;
  }, [activeCategory, allGenresFlat, trimmedQuery]);

  // ---------------------------------------------------------------------------
  // View A: Selected Genre Books Grid (Simple, matching DiscoverPage search results)
  // ---------------------------------------------------------------------------
  if (selectedGenre) {
    const genreMeta = allGenresFlat.find((g) => g.subject === selectedGenre);
    const genreTitle = genreMeta?.name || selectedGenre.replace(/_/g, ' ');

    return (
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '24px 20px 60px 20px' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '24px',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <Link
              to="/catalogs"
              onClick={(e) => {
                e.preventDefault();
                setSearchParams({});
                setPage(1);
              }}
              style={{
                fontSize: '1.35rem',
                fontWeight: '700',
                letterSpacing: '-0.3px',
                color: '#71717a',
                textDecoration: 'none',
              }}
            >
              Catalogs
            </Link>
            <span style={{ fontSize: '1.2rem', color: '#d4d4d8' }}>/</span>
            <h2 style={{ fontSize: '1.35rem', fontWeight: '800', margin: 0, letterSpacing: '-0.3px', color: '#18181b' }}>
              {genreTitle}
            </h2>
          </div>
          {genreBooks && (
            <span style={{ fontSize: '0.9rem', color: '#71717a' }}>
              {genreBooks.total.toLocaleString()} books found (Page {page})
            </span>
          )}
        </div>

        {isGenreError && (
          <div
            style={{
              padding: '16px',
              backgroundColor: '#fef2f2',
              color: '#991b1b',
              border: '1px solid #fecaca',
              borderRadius: '6px',
              marginBottom: '20px',
            }}
          >
            Failed to load books. Please try again.
          </div>
        )}

        {isGenreLoading ? (
          <div style={{ padding: '60px 0', textAlign: 'center', color: '#71717a' }}>
            <p>Loading books in {genreTitle}...</p>
          </div>
        ) : genreBooks && genreBooks.books.length > 0 ? (
          <div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                gap: '28px 18px',
              }}
            >
              {genreBooks.books.map((book) => (
                <BookCard key={book.key} book={book} />
              ))}
            </div>

            {/* Pagination matching DiscoverPage */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '16px',
                marginTop: '48px',
              }}
            >
              <button
                disabled={page <= 1 || isFetching}
                onClick={() => {
                  setPage((p) => Math.max(1, p - 1));
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
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
                Previous
              </button>
              <span style={{ fontSize: '0.9rem', color: '#52525b', fontWeight: '500' }}>Page {page}</span>
              <button
                disabled={genreBooks.books.length < 20 || isFetching}
                onClick={() => {
                  setPage((p) => p + 1);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                style={{
                  padding: '8px 18px',
                  borderRadius: '6px',
                  border: '1px solid #d4d4d8',
                  backgroundColor: '#fff',
                  cursor: 'pointer',
                  fontWeight: '600',
                }}
              >
                Next
              </button>
            </div>
          </div>
        ) : (
          <p style={{ padding: '60px 0', textAlign: 'center', color: '#71717a' }}>
            No books found in this catalog.
          </p>
        )}
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // View B: Catalogs Directory (Simple, visually identical style to DiscoverPage)
  // ---------------------------------------------------------------------------
  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '24px 20px 60px 20px' }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: '800', margin: 0, letterSpacing: '-0.3px' }}>
            Book Catalogs
          </h2>
          <p style={{ color: '#71717a', margin: '4px 0 0 0', fontSize: '0.9rem' }}>
            Select a subject to browse open library collections.
          </p>
        </div>

        {/* Filter Input */}
        <input
          type="text"
          placeholder="Filter catalogs..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            padding: '8px 14px',
            borderRadius: '6px',
            border: '1px solid #d4d4d8',
            fontSize: '0.9rem',
            width: '240px',
            outline: 'none',
          }}
        />
      </div>

      {/* Category Filter Pills */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          overflowX: 'auto',
          marginBottom: '28px',
          paddingBottom: '4px',
        }}
        className="hide-scrollbar"
      >
        <button
          onClick={() => setActiveCategory('all')}
          style={{
            padding: '6px 14px',
            borderRadius: '999px',
            border: activeCategory === 'all' ? '1px solid #18181b' : '1px solid #e4e4e7',
            backgroundColor: activeCategory === 'all' ? '#18181b' : '#ffffff',
            color: activeCategory === 'all' ? '#ffffff' : '#52525b',
            fontSize: '0.84rem',
            fontWeight: '600',
            cursor: 'pointer',
            whiteSpace: 'nowrap',
          }}
        >
          All
        </button>

        {ALL_CATALOG_CATEGORIES.map((cat) => {
          const isActive = activeCategory === cat.category;
          return (
            <button
              key={cat.category}
              onClick={() => setActiveCategory(isActive ? 'all' : cat.category)}
              style={{
                padding: '6px 14px',
                borderRadius: '999px',
                border: isActive ? '1px solid #18181b' : '1px solid #e4e4e7',
                backgroundColor: isActive ? '#18181b' : '#ffffff',
                color: isActive ? '#ffffff' : '#52525b',
                fontSize: '0.84rem',
                fontWeight: '600',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              {cat.shortName}
            </button>
          );
        })}
      </div>

      {/* Grid of Catalogs matching DiscoverPage style */}
      {displayedGenres.length === 0 ? (
        <p style={{ padding: '60px 0', textAlign: 'center', color: '#71717a' }}>
          No catalogs found matching "{searchQuery}".
        </p>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
            gap: '28px 18px',
          }}
        >
          {displayedGenres.map((genre) => {
            const coverSrc = `https://covers.openlibrary.org/b/id/${genre.coverId}-M.jpg`;

            return (
              <div
                key={genre.subject}
                onClick={() => {
                  setSearchParams({ genre: genre.subject });
                  setPage(1);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  cursor: 'pointer',
                  width: '100%',
                }}
              >
                {/* 3D Book Cover */}
                <div className="book-cover" title={genre.name}>
                  <img
                    src={coverSrc}
                    alt={genre.name}
                    loading="lazy"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                </div>

                {/* Title & Subtitle */}
                <div style={{ marginTop: '8px', padding: '0 2px' }}>
                  <h3
                    style={{
                      fontSize: '0.88rem',
                      fontWeight: '700',
                      color: '#18181b',
                      lineHeight: '1.3',
                      margin: 0,
                    }}
                  >
                    {genre.name}
                  </h3>
                  {genre.description && (
                    <p
                      style={{
                        fontSize: '0.78rem',
                        color: '#71717a',
                        marginTop: '2px',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {genre.description}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { ALL_CATALOG_CATEGORIES } from '../constants/catalogs.ts';
import { useSubjectBooks } from '../api/hooks.ts';
import { BookCard } from '../components/BookCard.tsx';

export const AllCatalogsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedGenre = searchParams.get('genre');
  const [page, setPage] = useState(1);
  const [filterText, setFilterText] = useState('');

  const { data: genreBooks, isLoading: isGenreLoading, isError: isGenreError } = useSubjectBooks(
    selectedGenre || undefined,
    page
  );

  const trimmedFilter = filterText.trim().toLowerCase();

  const filteredCategories = ALL_CATALOG_CATEGORIES.map((cat) => {
    const matchingGenres = cat.genres.filter(
      (g) =>
        g.name.toLowerCase().includes(trimmedFilter) ||
        (g.description && g.description.toLowerCase().includes(trimmedFilter)) ||
        g.subject.toLowerCase().includes(trimmedFilter)
    );
    return {
      category: cat.category,
      genres: matchingGenres,
    };
  }).filter((cat) => cat.genres.length > 0);

  const totalGenres = ALL_CATALOG_CATEGORIES.reduce((acc, c) => acc + c.genres.length, 0);

  // If a specific genre is selected, show that catalog's book covers!
  if (selectedGenre) {
    const allGenresFlat = ALL_CATALOG_CATEGORIES.flatMap((c) => c.genres);
    const genreMeta = allGenresFlat.find((g) => g.subject === selectedGenre);
    const genreTitle = genreMeta?.name || selectedGenre.replace(/_/g, ' ');

    return (
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '24px 20px 60px 20px' }}>
        <button
          onClick={() => { setSearchParams({}); setPage(1); }}
          style={{
            background: 'none',
            border: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            color: '#666',
            fontSize: '0.9rem',
            cursor: 'pointer',
            padding: 0,
            marginBottom: '20px',
          }}
        >
          <ArrowLeft size={16} />
          Back to All Catalogs
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
          {genreMeta?.icon && <span style={{ fontSize: '1.5rem' }}>{genreMeta.icon}</span>}
          <h2 style={{ fontSize: '1.4rem', fontWeight: '800', margin: 0 }}>
            {genreTitle}
          </h2>
          {genreBooks && (
            <span style={{ fontSize: '0.85rem', color: '#888', marginLeft: '6px' }}>
              ({genreBooks.total.toLocaleString()} books)
            </span>
          )}
        </div>

        {isGenreError && (
          <div style={{ padding: '16px', backgroundColor: '#fff3f0', color: '#d32f2f', borderRadius: '6px', marginBottom: '20px' }}>
            Failed to load books for this catalog.
          </div>
        )}

        {isGenreLoading ? (
          <div style={{ padding: '60px 0', textAlign: 'center', color: '#777' }}>
            <p>Loading books in {genreTitle}...</p>
          </div>
        ) : genreBooks && genreBooks.books.length > 0 ? (
          <div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                gap: '24px 16px',
              }}
            >
              {genreBooks.books.map((book) => (
                <BookCard key={book.key} book={book} />
              ))}
            </div>

            {/* Pagination */}
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '16px', marginTop: '40px' }}>
              <button
                disabled={page <= 1}
                onClick={() => { setPage((p) => Math.max(1, p - 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                style={{ padding: '8px 16px', borderRadius: '4px', border: '1px solid #ccc', cursor: page > 1 ? 'pointer' : 'not-allowed' }}
              >
                &larr; Previous Page
              </button>
              <span style={{ fontSize: '0.9rem', color: '#555' }}>Page {page}</span>
              <button
                disabled={genreBooks.books.length < 20}
                onClick={() => { setPage((p) => p + 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                style={{ padding: '8px 16px', borderRadius: '4px', border: '1px solid #ccc', cursor: 'pointer' }}
              >
                Next Page &rarr;
              </button>
            </div>
          </div>
        ) : (
          <p>No books found in this catalog.</p>
        )}
      </div>
    );
  }

  // Otherwise, show directory of all catalogs
  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '24px 20px 60px 20px' }}>
      <h2 style={{ fontSize: '1.4rem', fontWeight: '800', marginBottom: '6px' }}>All Catalogs & Book Genres</h2>
      <p style={{ color: '#666', margin: '0 0 20px 0', fontSize: '0.95rem' }}>
        Explore Open Library's public catalog across <strong>{totalGenres}</strong> curated genres and categories.
        Click any genre to view its books.
      </p>

      {/* Genre Filter Bar */}
      <div style={{ marginBottom: '24px' }}>
        <input
          type="text"
          placeholder="Filter genres (e.g. fiction, philosophy, space, food)..."
          value={filterText}
          onChange={(e) => setFilterText(e.target.value)}
          style={{ width: '360px', maxWidth: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #ccc' }}
        />
        {filterText && (
          <button
            onClick={() => setFilterText('')}
            style={{ marginLeft: '8px', padding: '8px 12px', border: '1px solid #ccc', borderRadius: '6px', background: '#f5f5f5', cursor: 'pointer' }}
          >
            Clear
          </button>
        )}
      </div>

      {filteredCategories.length === 0 ? (
        <p style={{ color: '#777', margin: '24px 0' }}>
          No genres matched "{filterText}". Try a different keyword.
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
          {filteredCategories.map((group) => (
            <div key={group.category} style={{ border: '1px solid #e5e5e5', padding: '16px', borderRadius: '6px' }}>
              <h3 style={{ margin: '0 0 12px 0', borderBottom: '1px solid #eee', paddingBottom: '8px', fontSize: '1.1rem' }}>
                {group.category} ({group.genres.length})
              </h3>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
                  gap: '12px',
                }}
              >
                {group.genres.map((genre) => (
                  <div
                    key={genre.subject}
                    style={{
                      border: '1px solid #e8e8e8',
                      padding: '12px',
                      borderRadius: '6px',
                      backgroundColor: '#fafafa',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                        {genre.icon && <span style={{ fontSize: '1.2rem' }}>{genre.icon}</span>}
                        <strong style={{ fontSize: '0.95rem' }}>{genre.name}</strong>
                      </div>
                      {genre.description && (
                        <p style={{ fontSize: '0.82rem', color: '#666', margin: '0 0 10px 0' }}>
                          {genre.description}
                        </p>
                      )}
                    </div>

                    <button
                      onClick={() => { setSearchParams({ genre: genre.subject }); setPage(1); }}
                      style={{
                        width: '100%',
                        fontSize: '0.85rem',
                        padding: '6px 10px',
                        borderRadius: '4px',
                        border: '1px solid #ddd',
                        backgroundColor: '#fff',
                        cursor: 'pointer',
                        fontWeight: '600',
                      }}
                    >
                      Browse {genre.name} &rarr;
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

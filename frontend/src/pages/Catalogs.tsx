import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ALL_CATALOG_CATEGORIES } from '../constants/catalogs.ts';

export const Catalogs: React.FC = () => {
  const [filterText, setFilterText] = useState('');

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

  return (
    <div style={{ padding: '0 16px', maxWidth: '1000px' }}>
      <h2>All Catalogs & Book Genres</h2>
      <p style={{ color: '#555', margin: '4px 0 16px 0' }}>
        Explore Open Library's public catalog across <strong>{totalGenres}</strong> curated genres and categories.
        Click any genre to browse its book collection.
      </p>

      {/* Genre Filter Bar */}
      <div style={{ margin: '16px 0', display: 'flex', gap: '8px', alignItems: 'center' }}>
        <input
          type="text"
          placeholder="Filter genres (e.g. fiction, philosophy, space, food)..."
          value={filterText}
          onChange={(e) => setFilterText(e.target.value)}
          style={{ width: '380px', maxWidth: '100%', padding: '8px' }}
        />
        {filterText && <button onClick={() => setFilterText('')}>Clear</button>}
      </div>

      {filteredCategories.length === 0 ? (
        <p style={{ color: '#777', margin: '24px 0' }}>
          No genres matched "{filterText}". Try a different keyword.
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', marginTop: '20px' }}>
          {filteredCategories.map((group) => (
            <div key={group.category} style={{ border: '1px solid #ddd', padding: '16px', borderRadius: '4px' }}>
              <h3 style={{ margin: '0 0 12px 0', borderBottom: '1px solid #eee', paddingBottom: '8px' }}>
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
                      border: '1px solid #e5e5e5',
                      padding: '10px 12px',
                      borderRadius: '4px',
                      backgroundColor: '#fafafa',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                        {genre.icon && <span style={{ fontSize: '1.2rem' }}>{genre.icon}</span>}
                        <strong>{genre.name}</strong>
                      </div>
                      {genre.description && (
                        <p style={{ fontSize: '0.82rem', color: '#666', margin: '0 0 8px 0' }}>
                          {genre.description}
                        </p>
                      )}
                    </div>

                    <Link to={`/search?catalog=${genre.subject}`}>
                      <button style={{ width: '100%', fontSize: '0.85rem', marginTop: '4px' }}>
                        Browse {genre.name} &rarr;
                      </button>
                    </Link>
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


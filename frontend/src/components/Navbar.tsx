import React from 'react';
import { Link } from 'react-router-dom';
import { useShelfStore } from '../store/useShelfStore.ts';

export const Navbar: React.FC = () => {
  const books = useShelfStore((state) => state.books);

  return (
    <nav style={{ padding: '12px 16px', borderBottom: '1px solid #ccc', marginBottom: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <strong style={{ fontSize: '1.25rem' }}>🚐 ShelfVan</strong>
          <span style={{ marginLeft: '10px', fontSize: '0.9rem', color: '#666' }}>
            Open Library Discovery & Personal Shelf
          </span>
        </div>
        <div style={{ display: 'flex', gap: '16px' }}>
          <Link to="/">My Shelf ({books.length})</Link>
          <Link to="/catalogs">All Catalogs</Link>
          <Link to="/search">Search Books</Link>
        </div>
      </div>
    </nav>
  );
};


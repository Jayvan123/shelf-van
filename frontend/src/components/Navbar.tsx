import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Compass, Library, Bookmark } from 'lucide-react';
import { useShelfStore } from '../store/useShelfStore.ts';

export const Navbar: React.FC = () => {
  const books = useShelfStore((state) => state.books);
  const location = useLocation();

  const isDiscover = location.pathname === '/' || location.pathname === '/search';
  const isCatalogs = location.pathname === '/catalogs';
  const isShelf = location.pathname === '/shelf';

  const linkStyle = (active: boolean) => ({
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 16px',
    borderRadius: '6px',
    fontSize: '0.95rem',
    fontWeight: active ? '700' : '500',
    color: active ? '#ff5436' : '#333',
    backgroundColor: active ? '#fff3f0' : 'transparent',
    textDecoration: 'none',
    border: active ? '1px solid #ffdcd6' : '1px solid transparent',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  });

  return (
    <header style={{ backgroundColor: '#fff', borderBottom: '1px solid #e5e5e5', position: 'sticky', top: 0, zIndex: 40 }}>
      <div
        style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '12px 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '16px',
          flexWrap: 'wrap',
        }}
      >
        {/* Brand Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
          <div
            style={{
              backgroundColor: '#ff5436',
              color: '#fff',
              width: '32px',
              height: '32px',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 'bold',
              fontSize: '1.1rem',
            }}
          >
            🚐
          </div>
          <span style={{ fontSize: '1.3rem', fontWeight: '800', letterSpacing: '-0.5px', color: '#1a1a1a' }}>
            ShelfVan
          </span>
        </Link>

        {/* Header Screens / Navigation Buttons */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <Link to="/" style={linkStyle(isDiscover)}>
            <Compass size={17} />
            Books / Discover
          </Link>

          <Link to="/catalogs" style={linkStyle(isCatalogs)}>
            <Library size={17} />
            All Catalogs
          </Link>

          <Link to="/shelf" style={linkStyle(isShelf)}>
            <Bookmark size={17} />
            My Shelf
            {books.length > 0 && (
              <span
                style={{
                  backgroundColor: '#ff5436',
                  color: '#fff',
                  fontSize: '0.72rem',
                  fontWeight: 'bold',
                  padding: '1px 6px',
                  borderRadius: '10px',
                  marginLeft: '4px',
                }}
              >
                {books.length}
              </span>
            )}
          </Link>
        </nav>
      </div>
    </header>
  );
};

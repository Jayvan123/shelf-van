import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Bookmark, Library, Compass } from 'lucide-react';
import { useShelfStore } from '../store/useShelfStore.ts';

export const Navbar: React.FC = () => {
  const books = useShelfStore((state) => state.books);
  const location = useLocation();

  const isShelf = location.pathname === '/';
  const isSearch = location.pathname === '/search';
  const isCatalogs = location.pathname === '/catalogs';

  return (
    <header style={{ backgroundColor: '#fff', borderBottom: '1px solid #f0f0f0', position: 'sticky', top: 0, zIndex: 40 }}>
      {/* Top Brand Bar */}
      <div
        style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '14px 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '16px',
        }}
      >
        {/* Logo */}
        <Link to="/search" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
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
          <span style={{ fontSize: '1.35rem', fontWeight: '800', letterSpacing: '-0.5px', color: '#1a1a1a' }}>
            ShelfVan
          </span>
        </Link>

        {/* Quick Nav Links */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <Link
            to="/search"
            style={{
              fontSize: '0.92rem',
              fontWeight: isSearch ? '700' : '500',
              color: isSearch ? '#ff5436' : '#555',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              textDecoration: 'none',
              padding: '6px 8px',
            }}
          >
            <Compass size={17} />
            Discover
          </Link>

          <Link
            to="/catalogs"
            style={{
              fontSize: '0.92rem',
              fontWeight: isCatalogs ? '700' : '500',
              color: isCatalogs ? '#ff5436' : '#555',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              textDecoration: 'none',
              padding: '6px 8px',
            }}
          >
            <Library size={17} />
            All Catalogs
          </Link>

          <Link
            to="/"
            style={{
              fontSize: '0.92rem',
              fontWeight: isShelf ? '700' : '500',
              color: isShelf ? '#ff5436' : '#1a1a1a',
              backgroundColor: isShelf ? '#fff3f0' : '#f5f5f5',
              padding: '6px 14px',
              borderRadius: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              textDecoration: 'none',
              transition: 'background-color 0.2s',
            }}
          >
            <Bookmark size={15} color={isShelf ? '#ff5436' : '#555'} />
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

import React, { useState, useEffect } from 'react';
import { Link, useLocation, useSearchParams, useNavigate } from 'react-router-dom';
import { Bookmark, Search as SearchIcon, X, ChevronDown } from 'lucide-react';
import { useShelfStore } from '../store/useShelfStore.ts';

export const HeaderPage: React.FC = () => {
  const books = useShelfStore((state) => state.books);
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const currentQ = searchParams.get('q') || '';
  const [searchValue, setSearchValue] = useState(currentQ);
  const [hoveredLink, setHoveredLink] = useState<string | null>(null);

  // Sync search input if URL changes externally
  useEffect(() => {
    setSearchValue(currentQ);
  }, [currentQ]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = searchValue.trim();
    if (trimmed) {
      navigate(`/?q=${encodeURIComponent(trimmed)}`);
    } else {
      navigate('/');
    }
  };

  const handleClear = () => {
    setSearchValue('');
    if (currentQ) {
      navigate('/');
    }
  };

  const isDiscover = (location.pathname === '/' || location.pathname === '/search') && !currentQ;
  const isCatalogs = location.pathname === '/catalogs';
  const isShelf = location.pathname === '/shelf';

  return (
    <header
      style={{
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #e4e4e7',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        height: '76px',
        display: 'flex',
        alignItems: 'center',
        width: '100%',
        boxSizing: 'border-box',
      }}
    >
      <div
        style={{
          width: '100%',
          padding: '0 36px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '28px',
        }}
      >
        {/* Left Side: Shelf Van Logo + Search Bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '28px', flex: '1 1 auto', maxWidth: '620px' }}>
          <Link
            to="/"
            style={{
              textDecoration: 'none',
              flexShrink: 0,
            }}
          >
            <span
              style={{
                fontSize: '1.45rem',
                fontWeight: '900',
                letterSpacing: '-0.5px',
                color: '#18181b',
                whiteSpace: 'nowrap',
              }}
            >
              Shelf Van
            </span>
          </Link>

          {/* Search Box on Left */}
          <form
            onSubmit={handleSearchSubmit}
            style={{
              position: 'relative',
              width: '100%',
              maxWidth: '400px',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                backgroundColor: '#ffffff',
                borderRadius: '8px',
                padding: '0 14px',
                height: '42px',
                border: '1px solid #d4d4d8',
                transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
              }}
            >
              <SearchIcon size={16} color="#71717a" style={{ marginRight: '10px', flexShrink: 0 }} />
              <input
                type="text"
                placeholder="Search books, authors, ISBN..."
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  fontSize: '0.92rem',
                  width: '100%',
                  color: '#18181b',
                }}
              />
              {searchValue && (
                <button
                  type="button"
                  onClick={handleClear}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' }}
                  aria-label="Clear search"
                >
                  <X size={15} color="#71717a" />
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Right Side: Wattpad-style buttons (Browse ⌵ | Community ⌵ | Pill Button | Avatar ⌵) */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '18px', flexShrink: 0 }}>
          {/* Books / Discover (Text link with subtle chevron) */}
          <Link
            to="/"
            onMouseEnter={() => setHoveredLink('discover')}
            onMouseLeave={() => setHoveredLink(null)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              padding: '8px 10px',
              borderRadius: '6px',
              fontSize: '0.94rem',
              fontWeight: isDiscover ? '700' : '600',
              color: isDiscover ? '#18181b' : (hoveredLink === 'discover' ? '#000000' : '#27272a'),
              backgroundColor: hoveredLink === 'discover' ? '#f4f4f5' : 'transparent',
              textDecoration: 'none',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              whiteSpace: 'nowrap',
            }}
          >
            <span>Books / Discover</span>
            <ChevronDown size={14} strokeWidth={2.4} color="#71717a" style={{ marginTop: '1px' }} />
          </Link>

          {/* All Catalogs (Text link with subtle chevron) */}
          <Link
            to="/catalogs"
            onMouseEnter={() => setHoveredLink('catalogs')}
            onMouseLeave={() => setHoveredLink(null)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              padding: '8px 10px',
              borderRadius: '6px',
              fontSize: '0.94rem',
              fontWeight: isCatalogs ? '700' : '600',
              color: isCatalogs ? '#18181b' : (hoveredLink === 'catalogs' ? '#000000' : '#27272a'),
              backgroundColor: hoveredLink === 'catalogs' ? '#f4f4f5' : 'transparent',
              textDecoration: 'none',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              whiteSpace: 'nowrap',
            }}
          >
            <span>All Catalogs</span>
            <ChevronDown size={14} strokeWidth={2.4} color="#71717a" style={{ marginTop: '1px' }} />
          </Link>

          {/* My Shelf (Pill Button like Wattpad's '⚡ Try Premium') */}
          <Link
            to="/shelf"
            onMouseEnter={() => setHoveredLink('shelf')}
            onMouseLeave={() => setHoveredLink(null)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 18px',
              borderRadius: '9999px',
              fontSize: '0.92rem',
              fontWeight: '600',
              color: isShelf ? '#ffffff' : '#18181b',
              backgroundColor: isShelf ? '#18181b' : (hoveredLink === 'shelf' ? '#e4e4e7' : '#f4f4f5'),
              border: '1px solid',
              borderColor: isShelf ? '#18181b' : '#e4e4e7',
              textDecoration: 'none',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              whiteSpace: 'nowrap',
              boxShadow: isShelf ? '0 2px 4px rgba(0,0,0,0.1)' : 'none',
            }}
          >
            <Bookmark size={15} style={{ fill: books.length > 0 ? (isShelf ? '#ffffff' : '#18181b') : 'none' }} />
            <span>My Shelf</span>
            {books.length > 0 && (
              <span
                style={{
                  backgroundColor: isShelf ? '#ffffff' : '#18181b',
                  color: isShelf ? '#18181b' : '#ffffff',
                  fontSize: '0.72rem',
                  fontWeight: '700',
                  padding: '1px 7px',
                  borderRadius: '9999px',
                  lineHeight: '1.2',
                }}
              >
                {books.length}
              </span>
            )}
          </Link>

          {/* Profile Avatar with Chevron (as seen in Wattpad header) */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              padding: '4px',
              borderRadius: '24px',
              userSelect: 'none',
            }}
            title="Account"
          >
            <div
              style={{
                position: 'relative',
                width: '34px',
                height: '34px',
                borderRadius: '50%',
                backgroundColor: '#27272a',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.82rem',
                fontWeight: '700',
                letterSpacing: '0.5px',
              }}
            >
              <span>SV</span>
              {/* Notification dot */}
              <span
                style={{
                  position: 'absolute',
                  top: '-1px',
                  right: '-1px',
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: '#18181b',
                  border: '1.5px solid #ffffff',
                }}
              />
            </div>
            <ChevronDown size={13} strokeWidth={2.4} color="#71717a" />
          </div>
        </nav>
      </div>
    </header>
  );
};

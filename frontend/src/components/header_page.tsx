import React, { useState } from 'react';
import { Link, useLocation, useSearchParams, useNavigate } from 'react-router-dom';
import { Bookmark, Search as SearchIcon, X, BookOpen, Menu, Sparkles, Compass } from 'lucide-react';
import { useShelfStore } from '../store/useShelfStore.ts';

const QUICK_GENRES = [
  { name: 'Classic Literature', subject: 'classic_literature' },
  { name: 'Science Fiction', subject: 'science_fiction' },
  { name: 'Fantasy', subject: 'fantasy' },
  { name: 'Mystery & Detective', subject: 'mystery_and_detective_stories' },
  { name: 'History & Biography', subject: 'history' },
  { name: 'Romance', subject: 'romance' },
];

export const HeaderPage: React.FC = () => {
  const books = useShelfStore((state) => state.books);
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const currentQ = searchParams.get('q') || '';
  const [prevQ, setPrevQ] = useState(currentQ);
  const [searchValue, setSearchValue] = useState(currentQ);
  const [hoveredLink, setHoveredLink] = useState<string | null>(null);
  const [showCatalogMenu, setShowCatalogMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Sync search input if URL changes externally without setState in effect
  if (currentQ !== prevQ) {
    setPrevQ(currentQ);
    setSearchValue(currentQ);
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = searchValue.trim();
    if (trimmed) {
      navigate(`/?q=${encodeURIComponent(trimmed)}`);
    } else {
      navigate('/');
    }
    setMobileMenuOpen(false);
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
        width: '100%',
        boxSizing: 'border-box',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '1360px',
          margin: '0 auto',
          padding: '0 24px',
          height: '72px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '20px',
        }}
      >
        {/* Left Side: Brand Logo + Search Bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '22px', flex: '1 1 auto', maxWidth: '640px' }}>
          <Link
            to="/"
            style={{
              textDecoration: 'none',
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
            }}
          >
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                backgroundColor: '#18181b',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
              }}
            >
              <BookOpen size={20} strokeWidth={2.4} />
            </div>
            <span
              style={{
                fontSize: '1.38rem',
                fontWeight: '900',
                letterSpacing: '-0.5px',
                color: '#18181b',
                whiteSpace: 'nowrap',
              }}
            >
              Shelf Van
            </span>
          </Link>

          {/* Search Box */}
          <form
            onSubmit={handleSearchSubmit}
            style={{
              position: 'relative',
              width: '100%',
              maxWidth: '380px',
            }}
            className="hidden sm:block"
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                backgroundColor: '#f4f4f5',
                borderRadius: '9999px',
                padding: '0 16px',
                height: '40px',
                border: '1px solid #e4e4e7',
                transition: 'border-color 0.15s ease, background-color 0.15s ease',
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
                  fontSize: '0.88rem',
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

        {/* Desktop Nav */}
        <nav
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            flexShrink: 0,
          }}
          className="hidden md:flex"
        >
          {/* Books / Discover */}
          <Link
            to="/"
            onMouseEnter={() => setHoveredLink('discover')}
            onMouseLeave={() => setHoveredLink(null)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              borderRadius: '9999px',
              fontSize: '0.92rem',
              fontWeight: isDiscover ? '700' : '600',
              color: isDiscover ? '#18181b' : (hoveredLink === 'discover' ? '#000000' : '#52525b'),
              backgroundColor: isDiscover ? '#f4f4f5' : (hoveredLink === 'discover' ? '#f4f4f5' : 'transparent'),
              textDecoration: 'none',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              whiteSpace: 'nowrap',
            }}
          >
            <Compass size={16} style={{ color: isDiscover ? '#18181b' : '#71717a' }} />
            <span>Discover</span>
          </Link>

          {/* All Catalogs with Dropdown Menu */}
          <div
            style={{ position: 'relative' }}
            onMouseEnter={() => {
              setHoveredLink('catalogs');
              setShowCatalogMenu(true);
            }}
            onMouseLeave={() => {
              setHoveredLink(null);
              setShowCatalogMenu(false);
            }}
          >
            <Link
              to="/catalogs"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                borderRadius: '9999px',
                fontSize: '0.92rem',
                fontWeight: isCatalogs ? '700' : '600',
                color: isCatalogs ? '#18181b' : (hoveredLink === 'catalogs' ? '#000000' : '#52525b'),
                backgroundColor: isCatalogs ? '#f4f4f5' : (hoveredLink === 'catalogs' ? '#f4f4f5' : 'transparent'),
                textDecoration: 'none',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                whiteSpace: 'nowrap',
              }}
            >
              <Sparkles size={16} style={{ color: isCatalogs ? '#18181b' : '#71717a' }} />
              <span>All Catalogs</span>
            </Link>

            {/* Quick Genre Popover */}
            {showCatalogMenu && (
              <div
                style={{
                  position: 'absolute',
                  top: '100%',
                  left: '0',
                  marginTop: '8px',
                  width: '260px',
                  backgroundColor: '#ffffff',
                  borderRadius: '16px',
                  border: '1px solid #e4e4e7',
                  boxShadow: '0 12px 30px rgba(0, 0, 0, 0.12)',
                  padding: '10px',
                  zIndex: 100,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                }}
                className="fade-in"
              >
                <div style={{ padding: '6px 10px', fontSize: '0.72rem', fontWeight: '700', letterSpacing: '0.5px', textTransform: 'uppercase', color: '#a1a1aa' }}>
                  Popular Catalogs
                </div>
                {QUICK_GENRES.map((g) => (
                  <Link
                    key={g.subject}
                    to={`/catalogs?genre=${encodeURIComponent(g.subject)}`}
                    onClick={() => setShowCatalogMenu(false)}
                    style={{
                      padding: '8px 10px',
                      borderRadius: '8px',
                      fontSize: '0.85rem',
                      fontWeight: '500',
                      color: '#27272a',
                      textDecoration: 'none',
                      transition: 'background-color 0.15s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#f4f4f5';
                      e.currentTarget.style.color = '#18181b';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.color = '#27272a';
                    }}
                  >
                    {g.name}
                  </Link>
                ))}
                <div style={{ height: '1px', backgroundColor: '#e4e4e7', margin: '4px 0' }} />
                <Link
                  to="/catalogs"
                  onClick={() => setShowCatalogMenu(false)}
                  style={{
                    padding: '8px 10px',
                    borderRadius: '8px',
                    fontSize: '0.84rem',
                    fontWeight: '700',
                    color: '#18181b',
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#f4f4f5';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <span>Explore all 40+ genres</span>
                  <span>&rarr;</span>
                </Link>
              </div>
            )}
          </div>

          {/* My Shelf Pill Button */}
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
              fontSize: '0.9rem',
              fontWeight: '600',
              color: isShelf ? '#ffffff' : '#18181b',
              backgroundColor: isShelf ? '#18181b' : (hoveredLink === 'shelf' ? '#e4e4e7' : '#f4f4f5'),
              border: '1px solid',
              borderColor: isShelf ? '#18181b' : '#e4e4e7',
              textDecoration: 'none',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              whiteSpace: 'nowrap',
              boxShadow: isShelf ? '0 2px 6px rgba(0,0,0,0.12)' : 'none',
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
        </nav>

        {/* Mobile Hamburger Button */}
        <div className="flex md:hidden items-center gap-2">
          <Link
            to="/shelf"
            style={{
              padding: '6px 12px',
              borderRadius: '9999px',
              backgroundColor: isShelf ? '#18181b' : '#f4f4f5',
              color: isShelf ? '#ffffff' : '#18181b',
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              fontSize: '0.82rem',
              fontWeight: '600',
              textDecoration: 'none',
            }}
          >
            <Bookmark size={14} style={{ fill: books.length > 0 ? (isShelf ? '#ffffff' : '#18181b') : 'none' }} />
            <span>{books.length}</span>
          </Link>
          <button
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            style={{
              padding: '8px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              borderRadius: '8px',
              color: '#18181b',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Dropdown */}
      {mobileMenuOpen && (
        <div
          style={{
            padding: '14px 24px 20px 24px',
            backgroundColor: '#ffffff',
            borderTop: '1px solid #f4f4f5',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}
          className="md:hidden fade-in"
        >
          {/* Mobile Search input */}
          <form onSubmit={handleSearchSubmit} style={{ width: '100%' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                backgroundColor: '#f4f4f5',
                borderRadius: '9999px',
                padding: '0 14px',
                height: '40px',
                border: '1px solid #e4e4e7',
              }}
            >
              <SearchIcon size={16} color="#71717a" style={{ marginRight: '8px' }} />
              <input
                type="text"
                placeholder="Search books, authors..."
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  fontSize: '0.88rem',
                  width: '100%',
                  color: '#18181b',
                }}
              />
              {searchValue && (
                <button type="button" onClick={handleClear} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                  <X size={14} color="#71717a" />
                </button>
              )}
            </div>
          </form>

          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            style={{
              padding: '10px 14px',
              borderRadius: '10px',
              fontWeight: '600',
              fontSize: '0.94rem',
              color: '#18181b',
              backgroundColor: isDiscover ? '#f4f4f5' : 'transparent',
              textDecoration: 'none',
            }}
          >
            Discover Books
          </Link>

          <Link
            to="/catalogs"
            onClick={() => setMobileMenuOpen(false)}
            style={{
              padding: '10px 14px',
              borderRadius: '10px',
              fontWeight: '600',
              fontSize: '0.94rem',
              color: '#18181b',
              backgroundColor: isCatalogs ? '#f4f4f5' : 'transparent',
              textDecoration: 'none',
            }}
          >
            All Catalogs &amp; Genres
          </Link>

          <Link
            to="/shelf"
            onClick={() => setMobileMenuOpen(false)}
            style={{
              padding: '10px 14px',
              borderRadius: '10px',
              fontWeight: '600',
              fontSize: '0.94rem',
              color: '#18181b',
              backgroundColor: isShelf ? '#f4f4f5' : 'transparent',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <span>My Shelf</span>
            <span style={{ fontSize: '0.78rem', color: '#71717a' }}>{books.length} saved</span>
          </Link>
        </div>
      )}
    </header>
  );
};

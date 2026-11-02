import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Trash2, LayoutGrid, Library, Eye, BookOpen } from 'lucide-react';
import { useShelfStore } from '../store/useShelfStore.ts';
import { BookCard } from '../components/BookCard.tsx';
import type { ReadingStatus, ShelfBook } from '../types/index.ts';

const STATUS_TABS: Array<{ id: ReadingStatus | 'all'; label: string }> = [
  { id: 'all', label: 'All' },
  { id: 'reading', label: 'Currently Reading' },
  { id: 'want_to_read', label: 'Want to Read' },
  { id: 'completed', label: 'Completed' },
];

const BOOKS_PER_SHELF = 6;

export const MyShelfPage: React.FC = () => {
  const { books, removeBook, updateStatus } = useShelfStore();
  const [filter, setFilter] = useState<ReadingStatus | 'all'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'bookshelf'>('bookshelf');
  const [hoveredKey, setHoveredKey] = useState<string | null>(null);

  const filteredBooks = books.filter((b) => {
    if (filter === 'all') return true;
    return b.status === filter;
  });

  const getCount = (statusId: ReadingStatus | 'all') => {
    if (statusId === 'all') return books.length;
    return books.filter((b) => b.status === statusId).length;
  };

  // Chunk books across wooden shelves for Bookshelf view
  const shelves: ShelfBook[][] = [];
  for (let i = 0; i < filteredBooks.length; i += BOOKS_PER_SHELF) {
    shelves.push(filteredBooks.slice(i, i + BOOKS_PER_SHELF));
  }
  // If fewer than 2 shelves, ensure at least 2 shelves exist for a realistic bookcase look
  while (shelves.length < 2) {
    shelves.push([]);
  }

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '24px 20px 60px 20px' }}>
      {/* Top Header & View Switcher */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
          flexWrap: 'wrap',
          gap: '14px',
        }}
      >
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: '800', margin: 0, letterSpacing: '-0.3px', color: '#18181b' }}>
            My Reading Shelf
          </h1>
          <p style={{ color: '#71717a', margin: '4px 0 0 0', fontSize: '0.9rem' }}>
            {books.length} {books.length === 1 ? 'book' : 'books'} saved in your library
          </p>
        </div>

        {/* View Mode Toggle: Normal Grid vs Wooden Bookshelf */}
        <div
          style={{
            display: 'inline-flex',
            backgroundColor: '#f4f4f5',
            padding: '3px',
            borderRadius: '8px',
            border: '1px solid #e4e4e7',
          }}
        >
          <button
            onClick={() => setViewMode('bookshelf')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              borderRadius: '6px',
              border: 'none',
              backgroundColor: viewMode === 'bookshelf' ? '#ffffff' : 'transparent',
              color: viewMode === 'bookshelf' ? '#18181b' : '#71717a',
              fontWeight: viewMode === 'bookshelf' ? '700' : '500',
              fontSize: '0.84rem',
              cursor: 'pointer',
              boxShadow: viewMode === 'bookshelf' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              transition: 'all 0.15s ease',
            }}
          >
            <Library size={15} />
            <span>Bookshelf View</span>
          </button>

          <button
            onClick={() => setViewMode('grid')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              borderRadius: '6px',
              border: 'none',
              backgroundColor: viewMode === 'grid' ? '#ffffff' : 'transparent',
              color: viewMode === 'grid' ? '#18181b' : '#71717a',
              fontWeight: viewMode === 'grid' ? '700' : '500',
              fontSize: '0.84rem',
              cursor: 'pointer',
              boxShadow: viewMode === 'grid' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              transition: 'all 0.15s ease',
            }}
          >
            <LayoutGrid size={15} />
            <span>Grid View</span>
          </button>
        </div>
      </div>

      {/* Filter Status Pills */}
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
        {STATUS_TABS.map((tab) => {
          const isActive = filter === tab.id;
          const count = getCount(tab.id);

          return (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
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
                transition: 'all 0.15s ease',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <span>{tab.label}</span>
              <span
                style={{
                  fontSize: '0.74rem',
                  padding: '1px 6px',
                  borderRadius: '999px',
                  backgroundColor: isActive ? '#27272a' : '#f4f4f5',
                  color: isActive ? '#ffffff' : '#71717a',
                }}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* --------------------------------------------------------------------- */}
      {/* VIEW A: REALISTIC WOODEN BOOKSHELF VIEW (matching sample images)       */}
      {/* --------------------------------------------------------------------- */}
      {viewMode === 'bookshelf' && (
        <div
          style={{
            background: 'linear-gradient(180deg, #caa06d 0%, #b88b56 30%, #c49964 60%, #ad7f4b 100%)',
            borderLeft: '20px solid #7c5123',
            borderRight: '20px solid #7c5123',
            borderTop: '16px solid #8e602f',
            borderBottom: '24px solid #6b431a',
            borderRadius: '12px',
            boxShadow: 'inset 0 10px 30px rgba(0, 0, 0, 0.4), inset 0 -12px 30px rgba(0, 0, 0, 0.4), 0 16px 36px rgba(0, 0, 0, 0.25)',
            position: 'relative',
            paddingTop: '16px',
            overflow: 'hidden',
          }}
        >
          {filteredBooks.length === 0 ? (
            <div style={{ padding: '80px 20px', textAlign: 'center' }}>
              <div
                style={{
                  display: 'inline-block',
                  backgroundColor: 'rgba(255, 255, 255, 0.92)',
                  padding: '24px 32px',
                  borderRadius: '10px',
                  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)',
                  maxWidth: '420px',
                }}
              >
                <p style={{ fontSize: '1.05rem', fontWeight: '700', color: '#18181b', margin: '0 0 6px 0' }}>
                  {filter === 'all'
                    ? 'Your bookshelf is currently empty'
                    : `No books marked as "${STATUS_TABS.find((t) => t.id === filter)?.label}".`}
                </p>
                <p style={{ fontSize: '0.88rem', color: '#71717a', margin: '0 0 18px 0' }}>
                  Explore Open Library's public catalogs and add books to place them on your shelves.
                </p>
                <Link
                  to="/catalogs"
                  style={{
                    display: 'inline-block',
                    backgroundColor: '#18181b',
                    color: '#ffffff',
                    fontWeight: '600',
                    fontSize: '0.88rem',
                    padding: '8px 18px',
                    borderRadius: '6px',
                    textDecoration: 'none',
                  }}
                >
                  Explore Catalogs &rarr;
                </Link>
              </div>
            </div>
          ) : (
            shelves.map((shelf, shelfIdx) => (
              <div key={shelfIdx} style={{ position: 'relative' }}>
                {/* Books Row */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'flex-end',
                    gap: '24px',
                    padding: '36px 32px 0 32px',
                    minHeight: '220px',
                    overflowX: 'auto',
                  }}
                  className="hide-scrollbar"
                >
                  {shelf.map((book) => {
                    const coverSrc = book.coverUrl ? `http://localhost:3000${book.coverUrl}` : undefined;
                    const isHovered = hoveredKey === book.key;

                    return (
                      <div
                        key={book.key}
                        onMouseEnter={() => setHoveredKey(book.key)}
                        onMouseLeave={() => setHoveredKey(null)}
                        style={{
                          flex: '0 0 130px',
                          width: '130px',
                          position: 'relative',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          marginBottom: '-2px', // Books stand firmly on the shelf plank
                          cursor: 'pointer',
                          transform: isHovered ? 'translateY(-10px) scale(1.03)' : 'translateY(0)',
                          transition: 'transform 0.22s cubic-bezier(0.2, 0, 0.2, 1)',
                          zIndex: isHovered ? 20 : 10,
                        }}
                      >
                        {/* Status Ribbon (matching sample image corner tags) */}
                        <div
                          style={{
                            position: 'absolute',
                            top: '8px',
                            right: '-4px',
                            backgroundColor:
                              book.status === 'reading'
                                ? '#2563eb'
                                : book.status === 'completed'
                                ? '#059669'
                                : '#374151',
                            color: '#ffffff',
                            fontSize: '0.62rem',
                            fontWeight: '800',
                            letterSpacing: '0.5px',
                            textTransform: 'uppercase',
                            padding: '3px 7px',
                            borderRadius: '3px',
                            boxShadow: '0 2px 6px rgba(0,0,0,0.35)',
                            zIndex: 15,
                            pointerEvents: 'none',
                          }}
                        >
                          {book.status === 'reading' ? 'Reading' : book.status === 'completed' ? 'Done' : 'Saved'}
                        </div>

                        {/* 3D Realistic Book Cover on Shelf */}
                        <Link
                          to={`/book/${book.key}`}
                          style={{
                            display: 'block',
                            width: '100%',
                            aspectRatio: '1 / 1.48',
                            position: 'relative',
                            borderRadius: '2px 5px 5px 2px',
                            overflow: 'hidden',
                            backgroundColor: '#f4f4f5',
                            boxShadow: isHovered
                              ? '0 16px 28px rgba(0, 0, 0, 0.55), 0 4px 8px rgba(0, 0, 0, 0.35)'
                              : '0 8px 18px rgba(0, 0, 0, 0.45), 0 2px 4px rgba(0, 0, 0, 0.3)',
                            transition: 'box-shadow 0.2s ease',
                          }}
                          title={book.title}
                        >
                          {coverSrc ? (
                            <img
                              src={coverSrc}
                              alt={book.title}
                              loading="lazy"
                              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                              onError={(e) => {
                                (e.target as HTMLElement).style.display = 'none';
                              }}
                            />
                          ) : (
                            <div
                              style={{
                                width: '100%',
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                padding: '12px',
                                textAlign: 'center',
                                color: '#52525b',
                                backgroundColor: '#f4f4f5',
                              }}
                            >
                              <BookOpen size={28} style={{ opacity: 0.5, marginBottom: '6px' }} />
                              <span
                                style={{
                                  fontSize: '0.75rem',
                                  fontWeight: 'bold',
                                  lineHeight: '1.2',
                                  display: '-webkit-box',
                                  WebkitLineClamp: 3,
                                  WebkitBoxOrient: 'vertical',
                                  overflow: 'hidden',
                                }}
                              >
                                {book.title}
                              </span>
                            </div>
                          )}

                          {/* Spine Shadow on Left Edge */}
                          <div
                            style={{
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              bottom: 0,
                              width: '100%',
                              pointerEvents: 'none',
                              background:
                                'linear-gradient(90deg, rgba(0, 0, 0, 0.22) 0%, rgba(0, 0, 0, 0.05) 3%, rgba(255, 255, 255, 0.25) 4%, transparent 7%, transparent 100%)',
                              boxShadow: 'inset 1px 0 1px rgba(0,0,0,0.15)',
                            }}
                          />
                        </Link>

                        {/* Interactive Hover Actions Card */}
                        {isHovered && (
                          <div
                            style={{
                              position: 'absolute',
                              bottom: '-84px',
                              width: '170px',
                              backgroundColor: 'rgba(24, 24, 27, 0.96)',
                              color: '#ffffff',
                              padding: '10px 12px',
                              borderRadius: '8px',
                              boxShadow: '0 8px 20px rgba(0,0,0,0.4)',
                              backdropFilter: 'blur(6px)',
                              zIndex: 30,
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '6px',
                              textAlign: 'center',
                            }}
                          >
                            <p
                              style={{
                                fontSize: '0.75rem',
                                fontWeight: '700',
                                margin: 0,
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                              }}
                            >
                              {book.title}
                            </p>

                            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                              {book.isReadable && (
                                <Link
                                  to={`/read/${book.key}`}
                                  style={{
                                    flex: 1,
                                    backgroundColor: '#ffffff',
                                    color: '#18181b',
                                    fontSize: '0.72rem',
                                    fontWeight: '700',
                                    padding: '4px 6px',
                                    borderRadius: '4px',
                                    textDecoration: 'none',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '3px',
                                  }}
                                >
                                  <Eye size={12} /> Read
                                </Link>
                              )}

                              <select
                                value={book.status}
                                onChange={(e) => updateStatus(book.key, e.target.value as ReadingStatus)}
                                style={{
                                  flex: 1,
                                  fontSize: '0.68rem',
                                  fontWeight: '600',
                                  color: '#ffffff',
                                  backgroundColor: '#27272a',
                                  border: '1px solid #3f3f46',
                                  borderRadius: '4px',
                                  padding: '4px',
                                  outline: 'none',
                                  cursor: 'pointer',
                                }}
                              >
                                <option value="want_to_read">To Read</option>
                                <option value="reading">Reading</option>
                                <option value="completed">Done</option>
                              </select>

                              <button
                                onClick={() => removeBook(book.key)}
                                style={{
                                  background: 'none',
                                  border: '1px solid #3f3f46',
                                  color: '#a1a1aa',
                                  borderRadius: '4px',
                                  padding: '4px',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                }}
                                title="Remove from shelf"
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* 3D Wooden Shelf Plank */}
                <div style={{ width: '100%', position: 'relative', zIndex: 5 }}>
                  {/* Top Surface where books stand */}
                  <div
                    style={{
                      height: '14px',
                      background: 'linear-gradient(180deg, #dfba92 0%, #caa06e 100%)',
                      borderTop: '1px solid rgba(255, 255, 255, 0.45)',
                      boxShadow: 'inset 0 1px 2px rgba(255, 255, 255, 0.3)',
                    }}
                  />
                  {/* Beveled Front Lip of Plank */}
                  <div
                    style={{
                      height: '22px',
                      background: 'linear-gradient(180deg, #aa7845 0%, #875727 60%, #6e431a 100%)',
                      borderTop: '1px solid rgba(255, 255, 255, 0.18)',
                      borderBottom: '1px solid rgba(0, 0, 0, 0.35)',
                      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.25)',
                    }}
                  />
                  {/* Deep Shadow cast beneath shelf */}
                  <div
                    style={{
                      height: '28px',
                      background: 'linear-gradient(180deg, rgba(0, 0, 0, 0.45) 0%, rgba(0, 0, 0, 0.15) 50%, rgba(0, 0, 0, 0) 100%)',
                      pointerEvents: 'none',
                    }}
                  />
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* --------------------------------------------------------------------- */}
      {/* VIEW B: NORMAL GRID VIEW                                              */}
      {/* --------------------------------------------------------------------- */}
      {viewMode === 'grid' && (
        <div>
          {filteredBooks.length === 0 ? (
            <div style={{ padding: '60px 0', textAlign: 'center', color: '#71717a' }}>
              <p style={{ fontSize: '1rem', fontWeight: '600', color: '#18181b', margin: '0 0 6px 0' }}>
                {filter === 'all'
                  ? 'Your reading shelf is empty'
                  : `No books currently marked as "${STATUS_TABS.find((t) => t.id === filter)?.label}".`}
              </p>
              <p style={{ fontSize: '0.88rem', margin: '0 0 20px 0' }}>
                Browse catalogs or search books to add them to your shelf.
              </p>
              <Link
                to="/catalogs"
                style={{
                  display: 'inline-block',
                  backgroundColor: '#18181b',
                  color: '#ffffff',
                  fontWeight: '600',
                  fontSize: '0.88rem',
                  padding: '9px 18px',
                  borderRadius: '6px',
                  textDecoration: 'none',
                }}
              >
                Explore Catalogs &rarr;
              </Link>
            </div>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                gap: '28px 18px',
              }}
            >
              {filteredBooks.map((book) => (
                <BookCard
                  key={book.key}
                  book={book}
                  footer={
                    <div
                      style={{
                        marginTop: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      <select
                        value={book.status}
                        onChange={(e) => updateStatus(book.key, e.target.value as ReadingStatus)}
                        style={{
                          flex: 1,
                          fontSize: '0.74rem',
                          fontWeight: '600',
                          color: '#18181b',
                          backgroundColor: '#f4f4f5',
                          border: '1px solid #e4e4e7',
                          borderRadius: '4px',
                          padding: '5px 6px',
                          cursor: 'pointer',
                          outline: 'none',
                        }}
                      >
                        <option value="want_to_read">Want to Read</option>
                        <option value="reading">Reading</option>
                        <option value="completed">Completed</option>
                      </select>

                      <button
                        onClick={() => removeBook(book.key)}
                        style={{
                          background: 'none',
                          border: '1px solid #e4e4e7',
                          borderRadius: '4px',
                          color: '#71717a',
                          cursor: 'pointer',
                          padding: '5px 7px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'all 0.15s ease',
                        }}
                        title="Remove from shelf"
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = '#fca5a5';
                          e.currentTarget.style.color = '#ef4444';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = '#e4e4e7';
                          e.currentTarget.style.color = '#71717a';
                        }}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  }
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

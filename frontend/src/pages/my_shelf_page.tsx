import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Trash2, Eye, BookOpen, ChevronDown, HardDrive, BookMarked, CheckCircle2 } from 'lucide-react';
import { useShelfStore } from '../store/useShelfStore.ts';
import { BookCard } from '../components/BookCard.tsx';
import { StorageBackupModal } from '../components/StorageBackupModal.tsx';
import { resolveCoverUrl } from '../api/client.ts';
import type { ReadingStatus, ShelfBook } from '../types/index.ts';

const STATUS_TABS: Array<{ id: ReadingStatus | 'all'; label: string }> = [
  { id: 'all', label: 'All Books' },
  { id: 'reading', label: 'Currently Reading' },
  { id: 'want_to_read', label: 'Want to Read' },
  { id: 'completed', label: 'Completed' },
];

const BOOKS_PER_SHELF = 6;

export const MyShelfPage: React.FC = () => {
  const { books, removeBook, updateStatus } = useShelfStore();
  const [filter, setFilter] = useState<ReadingStatus | 'all'>('all');
  const [viewMode, setViewMode] = useState<'bookshelf' | 'grid'>('bookshelf');
  const [shelfStyle, setShelfStyle] = useState<'modern' | 'wood'>('modern');
  const [hoveredKey, setHoveredKey] = useState<string | null>(null);
  const [activeBookModal, setActiveBookModal] = useState<ShelfBook | null>(null);
  const [isBackupOpen, setIsBackupOpen] = useState(false);

  const filteredBooks = books.filter((b) => {
    if (filter === 'all') return true;
    return b.status === filter;
  });

  const getCount = (statusId: ReadingStatus | 'all') => {
    if (statusId === 'all') return books.length;
    return books.filter((b) => b.status === statusId).length;
  };

  const readingCount = books.filter((b) => b.status === 'reading').length;
  const completedCount = books.filter((b) => b.status === 'completed').length;

  // Chunk books across shelves
  const shelves: ShelfBook[][] = [];
  for (let i = 0; i < filteredBooks.length; i += BOOKS_PER_SHELF) {
    shelves.push(filteredBooks.slice(i, i + BOOKS_PER_SHELF));
  }
  while (shelves.length < 2) {
    shelves.push([]);
  }

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '24px 20px 60px 20px' }}>
      {/* Top Header & Stats */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div>
          <h1 style={{ fontSize: '1.65rem', fontWeight: '800', margin: 0, letterSpacing: '-0.3px', color: '#18181b' }}>
            My Reading Shelf
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginTop: '6px', fontSize: '0.82rem', color: '#71717a' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <BookMarked size={14} /> {books.length} saved
            </span>
            <span>•</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <BookOpen size={14} color="#2563eb" /> {readingCount} reading
            </span>
            <span>•</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <CheckCircle2 size={14} color="#059669" /> {completedCount} finished
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {/* Chrome Storage & Backup Button */}
          <button
            onClick={() => setIsBackupOpen(true)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '7px 16px',
              borderRadius: '9999px',
              border: '1px solid #e4e4e7',
              backgroundColor: '#ffffff',
              color: '#27272a',
              fontSize: '0.84rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
            }}
            title="Manage Chrome local storage and export/restore backup"
          >
            <HardDrive size={15} />
            <span>Storage &amp; Backup</span>
          </button>

          {/* View Mode Toggle: BookShelf vs Grid */}
          <div
            style={{
              position: 'relative',
              display: 'inline-grid',
              gridTemplateColumns: '1fr 1fr',
              backgroundColor: '#f4f4f5',
              padding: '3px',
              borderRadius: '9999px',
              border: '1px solid #e4e4e7',
              userSelect: 'none',
              minWidth: '180px',
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: '3px',
                bottom: '3px',
                left: '3px',
                width: 'calc(50% - 3px)',
                backgroundColor: '#ffffff',
                borderRadius: '9999px',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                transform: viewMode === 'bookshelf' ? 'translateX(0)' : 'translateX(100%)',
                transition: 'transform 0.25s cubic-bezier(0.2, 0, 0, 1)',
                pointerEvents: 'none',
              }}
            />

            <button
              type="button"
              onClick={() => setViewMode('bookshelf')}
              style={{
                position: 'relative',
                zIndex: 1,
                padding: '6px 16px',
                borderRadius: '9999px',
                border: 'none',
                backgroundColor: 'transparent',
                color: viewMode === 'bookshelf' ? '#18181b' : '#71717a',
                fontWeight: viewMode === 'bookshelf' ? '600' : '500',
                fontSize: '0.84rem',
                cursor: 'pointer',
                textAlign: 'center',
              }}
            >
              Bookshelf
            </button>

            <button
              type="button"
              onClick={() => setViewMode('grid')}
              style={{
                position: 'relative',
                zIndex: 1,
                padding: '6px 16px',
                borderRadius: '9999px',
                border: 'none',
                backgroundColor: 'transparent',
                color: viewMode === 'grid' ? '#18181b' : '#71717a',
                fontWeight: viewMode === 'grid' ? '600' : '500',
                fontSize: '0.84rem',
                cursor: 'pointer',
                textAlign: 'center',
              }}
            >
              Grid
            </button>
          </div>
        </div>
      </div>

      {/* Filter Status Pills & Shelf Style Switcher */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '12px',
          flexWrap: 'wrap',
          marginBottom: '28px',
        }}
      >
        <div
          style={{
            display: 'flex',
            gap: '8px',
            overflowX: 'auto',
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
                  padding: '7px 16px',
                  borderRadius: '9999px',
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
                    minWidth: '20px',
                    height: '20px',
                    padding: '0 6px',
                    borderRadius: '9999px',
                    backgroundColor: isActive ? '#27272a' : '#f4f4f5',
                    color: isActive ? '#ffffff' : '#71717a',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Shelf Theme Toggle when in Bookshelf Mode */}
        {viewMode === 'bookshelf' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: '#71717a' }}>
            <span>Theme:</span>
            <button
              onClick={() => setShelfStyle('modern')}
              style={{
                padding: '4px 10px',
                borderRadius: '6px',
                border: '1px solid',
                borderColor: shelfStyle === 'modern' ? '#18181b' : '#e4e4e7',
                backgroundColor: shelfStyle === 'modern' ? '#18181b' : '#ffffff',
                color: shelfStyle === 'modern' ? '#ffffff' : '#52525b',
                fontWeight: shelfStyle === 'modern' ? '600' : '500',
                fontSize: '0.76rem',
                cursor: 'pointer',
              }}
            >
              Modern
            </button>
            <button
              onClick={() => setShelfStyle('wood')}
              style={{
                padding: '4px 10px',
                borderRadius: '6px',
                border: '1px solid',
                borderColor: shelfStyle === 'wood' ? '#7c5123' : '#e4e4e7',
                backgroundColor: shelfStyle === 'wood' ? '#8e602f' : '#ffffff',
                color: shelfStyle === 'wood' ? '#ffffff' : '#52525b',
                fontWeight: shelfStyle === 'wood' ? '600' : '500',
                fontSize: '0.76rem',
                cursor: 'pointer',
              }}
            >
              Classic Wood
            </button>
          </div>
        )}
      </div>

      {/* --------------------------------------------------------------------- */}
      {/* VIEW A: BOOKSHELF VIEW (Modern or Classic Wood)                      */}
      {/* --------------------------------------------------------------------- */}
      {viewMode === 'bookshelf' && (
        <div
          className="fade-in"
          style={
            shelfStyle === 'modern'
              ? {
                  background: 'linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%)',
                  border: '1px solid #e2e8f0',
                  borderRadius: '24px',
                  boxShadow: '0 8px 30px rgba(0, 0, 0, 0.04), inset 0 1px 2px rgba(255, 255, 255, 0.8)',
                  position: 'relative',
                  paddingTop: '16px',
                  overflow: 'hidden',
                }
              : {
                  background: 'linear-gradient(180deg, #caa06d 0%, #b88b56 30%, #c49964 60%, #ad7f4b 100%)',
                  borderLeft: '20px solid #7c5123',
                  borderRight: '20px solid #7c5123',
                  borderTop: '16px solid #8e602f',
                  borderBottom: '24px solid #6b431a',
                  borderRadius: '24px',
                  boxShadow: 'inset 0 10px 30px rgba(0, 0, 0, 0.4), inset 0 -12px 30px rgba(0, 0, 0, 0.4), 0 16px 36px rgba(0, 0, 0, 0.25)',
                  position: 'relative',
                  paddingTop: '16px',
                  overflow: 'hidden',
                }
          }
        >
          {filteredBooks.length === 0 ? (
            <div style={{ padding: '80px 20px', textAlign: 'center' }}>
              <div
                style={{
                  display: 'inline-block',
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  padding: '28px 36px',
                  borderRadius: '20px',
                  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.1)',
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
                    padding: '10px 22px',
                    borderRadius: '9999px',
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
                    justifyContent: 'center',
                    alignItems: 'flex-end',
                    gap: '24px',
                    padding: '36px 32px 0 32px',
                    minHeight: '220px',
                    overflowX: 'auto',
                  }}
                  className="hide-scrollbar"
                >
                  {shelf.map((book) => {
                    const coverSrc = resolveCoverUrl(book.coverUrl);
                    const isHovered = hoveredKey === book.key;

                    return (
                      <div
                        key={book.key}
                        onMouseEnter={() => setHoveredKey(book.key)}
                        onMouseLeave={() => setHoveredKey(null)}
                        onClick={() => setActiveBookModal(book)}
                        style={{
                          flex: '0 0 130px',
                          width: '130px',
                          position: 'relative',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          marginBottom: '-2px',
                          cursor: 'pointer',
                          transform: isHovered ? 'translateY(-10px) scale(1.03)' : 'translateY(0)',
                          transition: 'transform 0.22s cubic-bezier(0.2, 0, 0.2, 1)',
                          zIndex: isHovered ? 20 : 10,
                        }}
                      >
                        {/* Status Ribbon */}
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
                            boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
                            zIndex: 15,
                            pointerEvents: 'none',
                          }}
                        >
                          {book.status === 'reading' ? 'Reading' : book.status === 'completed' ? 'Done' : 'Saved'}
                        </div>

                        {/* 3D Realistic Book Cover on Shelf */}
                        <Link
                          to={`/book/${book.key}`}
                          onClick={(e) => {
                            // On small screens, allow modal to handle tap
                            if (window.innerWidth < 768) {
                              e.preventDefault();
                              setActiveBookModal(book);
                            }
                          }}
                          style={{
                            display: 'block',
                            width: '100%',
                            aspectRatio: '1 / 1.48',
                            position: 'relative',
                            borderRadius: '2px 5px 5px 2px',
                            overflow: 'hidden',
                            backgroundColor: '#f4f4f5',
                            boxShadow: isHovered
                              ? '0 16px 28px rgba(0, 0, 0, 0.35), 0 4px 8px rgba(0, 0, 0, 0.2)'
                              : '0 8px 18px rgba(0, 0, 0, 0.25), 0 2px 4px rgba(0, 0, 0, 0.15)',
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

                        {/* Interactive Hover Actions Card (Desktop) */}
                        {isHovered && (
                          <div
                            style={{
                              position: 'absolute',
                              top: '-76px',
                              width: '176px',
                              backgroundColor: 'rgba(24, 24, 27, 0.96)',
                              color: '#ffffff',
                              padding: '8px 10px',
                              borderRadius: '12px',
                              boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
                              backdropFilter: 'blur(6px)',
                              zIndex: 30,
                              flexDirection: 'column',
                              gap: '6px',
                              textAlign: 'center',
                            }}
                            className="show-md-flex fade-in"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <p
                              style={{
                                fontSize: '0.74rem',
                                fontWeight: '700',
                                margin: 0,
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                              }}
                            >
                              {book.title}
                            </p>

                            <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
                              {book.isReadable && (
                                <Link
                                  to={`/read/${book.key}`}
                                  style={{
                                    flex: 1,
                                    backgroundColor: '#ffffff',
                                    color: '#18181b',
                                    fontSize: '0.7rem',
                                    fontWeight: '700',
                                    padding: '4px 6px',
                                    borderRadius: '9999px',
                                    textDecoration: 'none',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '3px',
                                  }}
                                >
                                  <Eye size={11} /> Read
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
                                  borderRadius: '9999px',
                                  padding: '4px 6px',
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
                                  borderRadius: '9999px',
                                  padding: '4px',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                }}
                                title="Remove from shelf"
                              >
                                <Trash2 size={11} />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* 3D Shelf Plank (Modern vs Classic Wood) */}
                <div style={{ width: '100%', position: 'relative', zIndex: 5 }}>
                  {shelfStyle === 'modern' ? (
                    <>
                      {/* Modern Frosted Acrylic Ledge */}
                      <div
                        style={{
                          height: '10px',
                          background: 'linear-gradient(180deg, #ffffff 0%, #f1f5f9 100%)',
                          borderTop: '1px solid #e2e8f0',
                          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
                        }}
                      />
                      <div
                        style={{
                          height: '16px',
                          background: '#e2e8f0',
                          borderBottom: '1px solid #cbd5e1',
                          boxShadow: '0 4px 10px rgba(0, 0, 0, 0.06)',
                        }}
                      />
                      <div
                        style={{
                          height: '24px',
                          background: 'linear-gradient(180deg, rgba(0, 0, 0, 0.08) 0%, rgba(0, 0, 0, 0) 100%)',
                          pointerEvents: 'none',
                        }}
                      />
                    </>
                  ) : (
                    <>
                      {/* Classic Warm Wood Plank */}
                      <div
                        style={{
                          height: '14px',
                          background: 'linear-gradient(180deg, #dfba92 0%, #caa06e 100%)',
                          borderTop: '1px solid rgba(255, 255, 255, 0.45)',
                          boxShadow: 'inset 0 1px 2px rgba(255, 255, 255, 0.3)',
                        }}
                      />
                      <div
                        style={{
                          height: '22px',
                          background: 'linear-gradient(180deg, #aa7845 0%, #875727 60%, #6e431a 100%)',
                          borderTop: '1px solid rgba(255, 255, 255, 0.18)',
                          borderBottom: '1px solid rgba(0, 0, 0, 0.35)',
                          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.25)',
                        }}
                      />
                      <div
                        style={{
                          height: '28px',
                          background: 'linear-gradient(180deg, rgba(0, 0, 0, 0.45) 0%, rgba(0, 0, 0, 0.15) 50%, rgba(0, 0, 0, 0) 100%)',
                          pointerEvents: 'none',
                        }}
                      />
                    </>
                  )}
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
        <div className="fade-in">
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
                  padding: '10px 22px',
                  borderRadius: '9999px',
                  textDecoration: 'none',
                }}
              >
                Explore Catalogs
              </Link>
            </div>
          ) : (
            <div>
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
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          width: '100%',
                        }}
                      >
                        <div style={{ position: 'relative', flex: 1 }}>
                          <select
                            value={book.status}
                            onChange={(e) => updateStatus(book.key, e.target.value as ReadingStatus)}
                            style={{
                              width: '100%',
                              appearance: 'none',
                              WebkitAppearance: 'none',
                              backgroundColor: '#f4f4f5',
                              color: '#18181b',
                              fontSize: '0.76rem',
                              fontWeight: '600',
                              padding: '7px 28px 7px 12px',
                              borderRadius: '9999px',
                              border: '1px solid #e4e4e7',
                              cursor: 'pointer',
                              outline: 'none',
                            }}
                          >
                            <option value="want_to_read">Want to Read</option>
                            <option value="reading">Reading</option>
                            <option value="completed">Completed</option>
                          </select>
                          <ChevronDown
                            size={13}
                            style={{
                              position: 'absolute',
                              right: '10px',
                              top: '50%',
                              transform: 'translateY(-50%)',
                              color: '#71717a',
                              pointerEvents: 'none',
                            }}
                          />
                        </div>

                        <button
                          onClick={() => removeBook(book.key)}
                          style={{
                            background: 'none',
                            border: 'none',
                            borderRadius: '9999px',
                            color: '#a1a1aa',
                            cursor: 'pointer',
                            padding: '7px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                          }}
                          title="Remove from shelf"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    }
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Mobile / Tap Book Quick Action Modal */}
      {activeBookModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(4px)',
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
          onClick={() => setActiveBookModal(null)}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '20px',
              padding: '24px',
              maxWidth: '380px',
              width: '100%',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
            }}
            onClick={(e) => e.stopPropagation()}
            className="fade-in"
          >
            <div>
              <h3 style={{ margin: '0 0 4px 0', fontSize: '1.15rem', fontWeight: '800', color: '#18181b' }}>
                {activeBookModal.title}
              </h3>
              <p style={{ margin: 0, fontSize: '0.86rem', color: '#71717a' }}>
                {activeBookModal.authors.join(', ')}
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '0.76rem', fontWeight: '700', textTransform: 'uppercase', color: '#a1a1aa' }}>
                Reading Status
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
                {(['want_to_read', 'reading', 'completed'] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => {
                      updateStatus(activeBookModal.key, st);
                      setActiveBookModal({ ...activeBookModal, status: st });
                    }}
                    style={{
                      padding: '8px 6px',
                      borderRadius: '8px',
                      border: '1px solid',
                      borderColor: activeBookModal.status === st ? '#18181b' : '#e4e4e7',
                      backgroundColor: activeBookModal.status === st ? '#18181b' : '#f4f4f5',
                      color: activeBookModal.status === st ? '#ffffff' : '#27272a',
                      fontSize: '0.78rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                    }}
                  >
                    {st === 'want_to_read' ? 'Want to Read' : st === 'reading' ? 'Reading' : 'Completed'}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
              <Link
                to={`/book/${activeBookModal.key}`}
                onClick={() => setActiveBookModal(null)}
                style={{
                  flex: 1,
                  padding: '10px 16px',
                  borderRadius: '9999px',
                  backgroundColor: '#f4f4f5',
                  color: '#18181b',
                  fontSize: '0.88rem',
                  fontWeight: '600',
                  textAlign: 'center',
                  textDecoration: 'none',
                }}
              >
                View Details
              </Link>
              {activeBookModal.isReadable && (
                <Link
                  to={`/read/${activeBookModal.key}`}
                  onClick={() => setActiveBookModal(null)}
                  style={{
                    flex: 1,
                    padding: '10px 16px',
                    borderRadius: '9999px',
                    backgroundColor: '#18181b',
                    color: '#ffffff',
                    fontSize: '0.88rem',
                    fontWeight: '600',
                    textAlign: 'center',
                    textDecoration: 'none',
                  }}
                >
                  Read Book
                </Link>
              )}
            </div>

            <button
              onClick={() => {
                removeBook(activeBookModal.key);
                setActiveBookModal(null);
              }}
              style={{
                background: 'none',
                border: 'none',
                color: '#ef4444',
                fontSize: '0.82rem',
                fontWeight: '600',
                cursor: 'pointer',
                padding: '6px',
                textAlign: 'center',
              }}
            >
              Remove from My Shelf
            </button>
          </div>
        </div>
      )}

      {/* Chrome Storage & Library Backup Modal */}
      <StorageBackupModal
        isOpen={isBackupOpen}
        onClose={() => setIsBackupOpen(false)}
      />
    </div>
  );
};

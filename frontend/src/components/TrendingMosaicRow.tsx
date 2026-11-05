import React, { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useSubjectBooks } from '../api/hooks.ts';
import type { BookSummary } from '../types/index.ts';

interface TrendingBook {
  key: string;
  title: string;
  author: string;
  coverId?: number;
  coverUrl?: string;
  isReadable?: boolean;
}

const TRENDING_FALLBACK: TrendingBook[] = [
  { key: 'OL7222246M', title: '1984', author: 'George Orwell', coverId: 7222246, isReadable: true },
  { key: 'OL45804W', title: 'The Great Gatsby', author: 'F. Scott Fitzgerald', coverId: 8432047, isReadable: true },
  { key: 'OL10521270M', title: 'Harry Potter and the Philosopher\'s Stone', author: 'J.K. Rowling', coverId: 10521270 },
  { key: 'OL9259256M', title: 'Dune', author: 'Frank Herbert', coverId: 9259256, isReadable: true },
  { key: 'OL8406786M', title: 'The Hobbit', author: 'J.R.R. Tolkien', coverId: 8406786, isReadable: true },
  { key: 'OL12645114M', title: 'Atomic Habits', author: 'James Clear', coverId: 12645114 },
  { key: 'OL66554W', title: 'Pride and Prejudice', author: 'Jane Austen', coverId: 8231856, isReadable: true },
  { key: 'OL12345W', title: "Alice's Adventures in Wonderland", author: 'Lewis Carroll', coverId: 8228691, isReadable: true },
  { key: 'OL450063W', title: 'Frankenstein', author: 'Mary Shelley', coverId: 44556, isReadable: true },
  { key: 'OL262423W', title: 'The Adventures of Sherlock Holmes', author: 'Arthur Conan Doyle', coverId: 77889, isReadable: true },
  { key: 'OL8231850M', title: 'Hamlet', author: 'William Shakespeare', coverId: 8231850, isReadable: true },
  { key: 'OL8235114M', title: "The Hitchhiker's Guide to the Galaxy", author: 'Douglas Adams', coverId: 8235114, isReadable: true },
  { key: 'OL8231852M', title: 'Jane Eyre', author: 'Charlotte Brontë', coverId: 8231852, isReadable: true },
  { key: 'OL8231858M', title: 'Dracula', author: 'Bram Stoker', coverId: 8231858, isReadable: true },
  { key: 'OL8240110M', title: 'Sapiens: A Brief History of Humankind', author: 'Yuval Noah Harari', coverId: 8240110 },
  { key: 'OL8231874M', title: 'The Republic', author: 'Plato', coverId: 8231874, isReadable: true },
  { key: 'OL8231860M', title: 'Treasure Island', author: 'Robert Louis Stevenson', coverId: 8231860, isReadable: true },
  { key: 'OL8235275M', title: 'Cosmos', author: 'Carl Sagan', coverId: 8235275, isReadable: true },
  { key: 'OL8231862M', title: 'War and Peace', author: 'Leo Tolstoy', coverId: 8231862, isReadable: true },
  { key: 'OL8235222M', title: 'The Da Vinci Code', author: 'Dan Brown', coverId: 8235222 },
];

export const TrendingMosaicRow: React.FC = () => {
  const { data } = useSubjectBooks('trending', 1);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [hoveredKey, setHoveredKey] = useState<string | null>(null);

  // Combine fetched books with curated fallback
  const allBooks: TrendingBook[] = React.useMemo(() => {
    if (data && data.books && data.books.length >= 10) {
      return data.books.map((b: BookSummary) => ({
        key: b.key,
        title: b.title,
        author: b.authors[0] || 'Unknown Author',
        coverUrl: b.coverUrl,
        isReadable: b.isReadable,
      }));
    }
    return TRENDING_FALLBACK;
  }, [data]);

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 10);
      setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 10);
    }
  };

  useEffect(() => {
    checkScroll();
  }, [allBooks]);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const offset = direction === 'left' ? -520 : 520;
      scrollRef.current.scrollBy({ left: offset, behavior: 'smooth' });
      setTimeout(checkScroll, 350);
    }
  };

  // Group books into mosaic clusters: 1 tall + 2 stacked + 2 stacked = 5 books per group
  const mosaicGroups: TrendingBook[][] = [];
  for (let i = 0; i < allBooks.length; i += 5) {
    mosaicGroups.push(allBooks.slice(i, i + 5));
  }

  const renderCover = (book: TrendingBook, isTall: boolean) => {
    const isHovered = hoveredKey === book.key;
    const coverSrc = book.coverUrl
      ? `http://localhost:3000${book.coverUrl}`
      : book.coverId
      ? `https://covers.openlibrary.org/b/id/${book.coverId}-M.jpg`
      : undefined;

    return (
      <Link
        key={book.key}
        to={`/book/${book.key}`}
        onMouseEnter={() => setHoveredKey(book.key)}
        onMouseLeave={() => setHoveredKey(null)}
        style={{
          display: 'block',
          position: 'relative',
          width: '100%',
          height: isTall ? '318px' : '153px',
          borderRadius: '8px',
          overflow: 'hidden',
          backgroundColor: '#27272a',
          boxShadow: isHovered
            ? '0 12px 24px rgba(0, 0, 0, 0.25), 0 4px 8px rgba(0, 0, 0, 0.15)'
            : '0 4px 10px rgba(0, 0, 0, 0.1)',
          transform: isHovered ? 'translateY(-3px) scale(1.015)' : 'translateY(0)',
          transition: 'transform 0.2s cubic-bezier(0.2, 0, 0.2, 1), box-shadow 0.2s cubic-bezier(0.2, 0, 0.2, 1)',
          textDecoration: 'none',
        }}
        title={`${book.title} by ${book.author}`}
      >
        {coverSrc ? (
          <img
            src={coverSrc}
            alt={book.title}
            loading="lazy"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              display: 'block',
            }}
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
        ) : (
          <div
            style={{
              width: '100%',
              height: '100%',
              backgroundColor: '#18181b',
              color: '#ffffff',
              padding: '12px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-end',
            }}
          >
            <p style={{ margin: 0, fontSize: isTall ? '0.9rem' : '0.75rem', fontWeight: '700', lineHeight: '1.2' }}>
              {book.title}
            </p>
            <span style={{ fontSize: '0.7rem', color: '#a1a1aa', marginTop: '4px' }}>{book.author}</span>
          </div>
        )}

        {/* Subtle Spine Reflection on Left Edge */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            bottom: 0,
            width: '100%',
            pointerEvents: 'none',
            background:
              'linear-gradient(90deg, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.04) 2.5%, rgba(255,255,255,0.2) 3.5%, transparent 6%, transparent 100%)',
            boxShadow: 'inset 1px 0 1px rgba(0,0,0,0.15)',
          }}
        />

        {/* Hover Gradient Overlay with Title */}
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
            padding: isTall ? '36px 10px 10px 10px' : '20px 8px 6px 8px',
            background: 'linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.85) 100%)',
            color: '#ffffff',
            opacity: isHovered ? 1 : 0,
            transition: 'opacity 0.2s ease',
            pointerEvents: 'none',
          }}
        >
          <p
            style={{
              margin: 0,
              fontSize: isTall ? '0.82rem' : '0.72rem',
              fontWeight: '700',
              lineHeight: '1.25',
              display: '-webkit-box',
              WebkitLineClamp: isTall ? 2 : 1,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {book.title}
          </p>
          <span
            style={{
              fontSize: '0.68rem',
              color: '#d4d4d8',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: 'block',
              marginTop: '2px',
            }}
          >
            {book.author}
          </span>
        </div>
      </Link>
    );
  };

  return (
    <section style={{ margin: '40px 0 36px 0', position: 'relative' }}>
      {/* Section Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '16px',
        }}
      >
        <h2
          style={{
            fontSize: '1.35rem',
            fontWeight: '800',
            color: '#18181b',
            letterSpacing: '-0.3px',
            margin: 0,
          }}
        >
          Trending & Most Read
        </h2>

        <Link
          to="/catalogs"
          style={{
            fontSize: '0.88rem',
            color: '#18181b',
            fontWeight: '600',
            textDecoration: 'none',
          }}
        >
          View all
        </Link>
      </div>

      {/* Mosaic Carousel Container */}
      <div style={{ position: 'relative' }}>
        {/* Left Arrow Button */}
        {canScrollLeft && (
          <button
            onClick={() => scroll('left')}
            style={{
              position: 'absolute',
              left: '-16px',
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 30,
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              border: '1px solid #e4e4e7',
              backgroundColor: '#ffffff',
              color: '#18181b',
              boxShadow: '0 4px 14px rgba(0, 0, 0, 0.15)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'transform 0.15s ease, background-color 0.15s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-50%) scale(1.08)';
              e.currentTarget.style.backgroundColor = '#fafafa';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
              e.currentTarget.style.backgroundColor = '#ffffff';
            }}
            aria-label="Scroll left"
          >
            <ChevronLeft size={20} />
          </button>
        )}

        {/* Right Arrow Button (Matching screenshot) */}
        {canScrollRight && (
          <button
            onClick={() => scroll('right')}
            style={{
              position: 'absolute',
              right: '-16px',
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 30,
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              border: '1px solid #e4e4e7',
              backgroundColor: '#ffffff',
              color: '#18181b',
              boxShadow: '0 4px 14px rgba(0, 0, 0, 0.15)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'transform 0.15s ease, background-color 0.15s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-50%) scale(1.08)';
              e.currentTarget.style.backgroundColor = '#fafafa';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
              e.currentTarget.style.backgroundColor = '#ffffff';
            }}
            aria-label="Scroll right"
          >
            <ChevronRight size={20} />
          </button>
        )}

        {/* Horizontal Mosaic Track */}
        <div
          ref={scrollRef}
          onScroll={checkScroll}
          style={{
            display: 'flex',
            gap: '12px',
            alignItems: 'stretch',
            overflowX: 'auto',
            padding: '6px 2px 14px 2px',
          }}
          className="hide-scrollbar"
        >
          {mosaicGroups.map((group, groupIdx) => {
            const tallBook = group[0];
            const pair1Top = group[1];
            const pair1Bottom = group[2];
            const pair2Top = group[3];
            const pair2Bottom = group[4];

            return (
              <React.Fragment key={groupIdx}>
                {/* 1. Tall Cover Column (e.g. 214px wide) */}
                {tallBook && (
                  <div style={{ flex: '0 0 214px', width: '214px' }}>
                    {renderCover(tallBook, true)}
                  </div>
                )}

                {/* 2. First Stacked Pair Column (e.g. 103px wide, 2 books stacked) */}
                {(pair1Top || pair1Bottom) && (
                  <div
                    style={{
                      flex: '0 0 103px',
                      width: '103px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '12px',
                      height: '318px',
                    }}
                  >
                    {pair1Top && <div style={{ flex: 1 }}>{renderCover(pair1Top, false)}</div>}
                    {pair1Bottom && <div style={{ flex: 1 }}>{renderCover(pair1Bottom, false)}</div>}
                  </div>
                )}

                {/* 3. Second Stacked Pair Column (e.g. 103px wide, 2 books stacked) */}
                {(pair2Top || pair2Bottom) && (
                  <div
                    style={{
                      flex: '0 0 103px',
                      width: '103px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '12px',
                      height: '318px',
                    }}
                  >
                    {pair2Top && <div style={{ flex: 1 }}>{renderCover(pair2Top, false)}</div>}
                    {pair2Bottom && <div style={{ flex: 1 }}>{renderCover(pair2Bottom, false)}</div>}
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </section>
  );
};


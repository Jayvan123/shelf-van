import React, { useRef, useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useSubjectBooks } from '../api/hooks.ts';
import type { BookSummary } from '../types/index.ts';

interface Top10Book {
  key: string;
  title: string;
  author: string;
  coverUrl?: string;
  coverId?: number;
  tag: string;
}

const TOP_10_CURATED: Top10Book[] = [
  { key: 'OL7222246M', title: '1984', author: 'George Orwell', coverId: 7222246, tag: 'dystopian' },
  { key: 'OL45804W', title: 'The Great Gatsby', author: 'F. Scott Fitzgerald', coverId: 8432047, tag: 'classic' },
  { key: 'OL10521270M', title: "Harry Potter and the Philosopher's Stone", author: 'J.K. Rowling', coverId: 10521270, tag: 'fantasy' },
  { key: 'OL9259256M', title: 'Dune', author: 'Frank Herbert', coverId: 9259256, tag: 'scifi' },
  { key: 'OL8406786M', title: 'The Hobbit', author: 'J.R.R. Tolkien', coverId: 8406786, tag: 'adventure' },
  { key: 'OL12645114M', title: 'Atomic Habits', author: 'James Clear', coverId: 12645114, tag: 'mindset' },
  { key: 'OL66554W', title: 'Pride and Prejudice', author: 'Jane Austen', coverId: 8231856, tag: 'romance' },
  { key: 'OL12345W', title: "Alice's Adventures in Wonderland", author: 'Lewis Carroll', coverId: 8228691, tag: 'fairytale' },
  { key: 'OL450063W', title: 'Frankenstein', author: 'Mary Shelley', coverId: 44556, tag: 'horror' },
  { key: 'OL8235222M', title: 'The Da Vinci Code', author: 'Dan Brown', coverId: 8235222, tag: 'mystery' },
];

interface Top10RowProps {
  title?: string;
  subject?: string;
}

export const Top10Row: React.FC<Top10RowProps> = ({
  title = 'Top 10 Books Today',
  subject = 'trending',
}) => {
  const { data } = useSubjectBooks(subject, 1);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // Ensure every book displayed has a real, high-quality cover (no blank/black fallback boxes)
  const top10Books: Top10Book[] = useMemo(() => {
    // Filter out API books that don't have covers
    const validApiBooks = (data?.books || []).filter(
      (b: BookSummary) => Boolean(b.coverUrl)
    );

    if (validApiBooks.length >= 8) {
      return validApiBooks.slice(0, 10).map((b: BookSummary, idx: number) => {
        let tag = TOP_10_CURATED[idx]?.tag || 'bestseller';
        if (b.title) {
          const words = b.title.toLowerCase().replace(/[^a-z0-9 ]/g, '').split(' ').filter(w => w.length > 2);
          if (words.length > 0 && words[0].length <= 10) {
            tag = words[0];
          }
        }
        return {
          key: b.key,
          title: b.title,
          author: b.authors[0] || 'Unknown Author',
          coverUrl: b.coverUrl,
          tag,
        };
      });
    }

    // Default to the curated list where all 10 books have 100% verified covers & balanced tags
    return TOP_10_CURATED;
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
  }, [top10Books]);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const offset = direction === 'left' ? -480 : 480;
      scrollRef.current.scrollBy({ left: offset, behavior: 'smooth' });
      setTimeout(checkScroll, 350);
    }
  };

  return (
    <section style={{ margin: '36px 0 40px 0', position: 'relative' }}>
      {/* Header */}
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
          {title}
        </h2>
      </div>

      {/* Carousel Track with Floating Navigation Buttons */}
      <div style={{ position: 'relative' }}>
        {/* Left Arrow Button (vertically centered on the covers) */}
        {canScrollLeft && (
          <button
            onClick={() => scroll('left')}
            style={{
              position: 'absolute',
              left: '-16px',
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 30,
              width: '38px',
              height: '38px',
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
            <ChevronLeft size={20} strokeWidth={2.4} />
          </button>
        )}

        {/* Right Arrow Button (vertically centered on the covers) */}
        {canScrollRight && (
          <button
            onClick={() => scroll('right')}
            style={{
              position: 'absolute',
              right: '-16px',
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 30,
              width: '38px',
              height: '38px',
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
            <ChevronRight size={20} strokeWidth={2.4} />
          </button>
        )}

        {/* Horizontal Scroll Track */}
        <div
          ref={scrollRef}
          onScroll={checkScroll}
          style={{
            display: 'flex',
            gap: '16px',
            alignItems: 'flex-start',
            overflowX: 'auto',
            padding: '8px 2px 18px 2px',
            scrollSnapType: 'x mandatory',
            WebkitOverflowScrolling: 'touch',
          }}
          className="hide-scrollbar"
        >
          {top10Books.map((book, index) => {
            const coverSrc = book.coverUrl
              ? (book.coverUrl.startsWith('http') ? book.coverUrl : `http://localhost:3000${book.coverUrl}`)
              : book.coverId
              ? `https://covers.openlibrary.org/b/id/${book.coverId}-M.jpg`
              : undefined;

            return (
              <div
                key={book.key || index}
                style={{
                  flex: '0 0 138px',
                  width: '138px',
                  display: 'flex',
                  flexDirection: 'column',
                  scrollSnapAlign: 'start',
                }}
              >
                {/* Book Cover Container with Overlapping Number */}
                <Link
                  to={`/book/${book.key}`}
                  style={{
                    position: 'relative',
                    display: 'block',
                    width: '100%',
                    aspectRatio: '1 / 1.5',
                    textDecoration: 'none',
                    marginBottom: '10px',
                  }}
                  title={`${index + 1}. ${book.title} by ${book.author}`}
                >
                  <div
                    style={{
                      width: '100%',
                      height: '100%',
                      borderRadius: '10px',
                      overflow: 'hidden',
                      backgroundColor: '#27272a',
                      boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
                      transition: 'transform 0.2s cubic-bezier(0.2, 0, 0.2, 1), box-shadow 0.2s cubic-bezier(0.2, 0, 0.2, 1)',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-4px)';
                      e.currentTarget.style.boxShadow = '0 10px 20px rgba(0, 0, 0, 0.18)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 4px 10px rgba(0, 0, 0, 0.1)';
                    }}
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
                        <p style={{ margin: 0, fontSize: '0.76rem', fontWeight: '700', lineHeight: '1.2' }}>
                          {book.title}
                        </p>
                        <span style={{ fontSize: '0.66rem', color: '#a1a1aa', marginTop: '4px' }}>
                          {book.author}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Stylized Big Rank Number Overlapping Bottom-Left Corner */}
                  <span
                    style={{
                      position: 'absolute',
                      bottom: '-10px',
                      left: '4px',
                      fontSize: '2.5rem',
                      fontWeight: '900',
                      lineHeight: '1',
                      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                      color: '#111827',
                      WebkitTextStroke: '2px #ffffff',
                      paintOrder: 'stroke fill',
                      filter: 'drop-shadow(0 2px 3px rgba(0, 0, 0, 0.3))',
                      zIndex: 10,
                      userSelect: 'none',
                      pointerEvents: 'none',
                    }}
                  >
                    {index + 1}
                  </span>
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

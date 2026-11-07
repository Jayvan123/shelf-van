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

const DEFAULT_TAGS = [
  'thelastlapseries1',
  'theonewiththepl...',
  'bl',
  'mikhaiah',
  'romance',
  'younglove',
  'sweet',
  'love',
  'fantasy',
  'mystery',
];

const TOP_10_FALLBACK: Top10Book[] = [
  { key: 'OL7222246M', title: 'Out of Control', author: 'Tiramisukaja', coverId: 7222246, tag: 'thelastlapseries1' },
  { key: 'OL45804W', title: 'The One with the Pleasure', author: 'Moonlighttv', coverId: 8432047, tag: 'theonewiththepl...' },
  { key: 'OL10521270M', title: 'In The Key Of Then', author: 'Rouverlic', coverId: 10521270, tag: 'bl' },
  { key: 'OL9259256M', title: 'XYLO At The Bar With You', author: 'Mikhaiah AU', coverId: 9259256, tag: 'mikhaiah' },
  { key: 'OL66554W', title: "When It's Time", author: 'Shadowcrisaxshers', coverId: 8231856, tag: 'romance' },
  { key: 'OL8406786M', title: 'scars & maybes', author: 'Aubrtinker', coverId: 8406786, tag: 'younglove' },
  { key: 'OL12645114M', title: 'One Night Stand with the Mayor', author: 'Jmglited', coverId: 12645114, tag: 'sweet' },
  { key: 'OL450063W', title: 'Loving a Spencer', author: 'Zero6', coverId: 44556, tag: 'love' },
  { key: 'OL8235114M', title: 'Shadows in the Mist', author: 'Douglas Adams', coverId: 8235114, tag: 'mystery' },
  { key: 'OL8235222M', title: 'Secrets of the Heart', author: 'Dan Brown', coverId: 8235222, tag: 'drama' },
];

interface Top10RowProps {
  title?: string;
  subject?: string;
}

export const Top10Row: React.FC<Top10RowProps> = ({
  title = 'Top 10 Books Today',
  subject = 'popular',
}) => {
  const { data } = useSubjectBooks(subject, 1);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const top10Books: Top10Book[] = useMemo(() => {
    if (data && data.books && data.books.length >= 10) {
      return data.books.slice(0, 10).map((b: BookSummary, idx: number) => {
        let tag = DEFAULT_TAGS[idx] || 'popular';
        if (b.title) {
          const simplified = b.title.toLowerCase().replace(/[^a-z0-9]/g, '');
          if (simplified.length > 0 && simplified.length <= 16) {
            tag = simplified;
          }
        }
        return {
          key: b.key,
          title: b.title,
          author: b.authors[0] || 'Unknown Author',
          coverUrl: b.coverUrl,
          tag: DEFAULT_TAGS[idx] || tag,
        };
      });
    }
    return TOP_10_FALLBACK;
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
      const offset = direction === 'left' ? -460 : 460;
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
        {/* Left Arrow Button */}
        {canScrollLeft && (
          <button
            onClick={() => scroll('left')}
            style={{
              position: 'absolute',
              left: '-16px',
              top: '40%',
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

        {/* Right Arrow Button (matches screenshot) */}
        {canScrollRight && (
          <button
            onClick={() => scroll('right')}
            style={{
              position: 'absolute',
              right: '-16px',
              top: '40%',
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
            gap: '14px',
            overflowX: 'auto',
            padding: '6px 2px 16px 2px',
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
                  flex: '0 0 134px',
                  width: '134px',
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
                    aspectRatio: '1 / 1.45',
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

                  {/* Stylized Big Rank Number Overlapping Bottom-Left (matching screenshot) */}
                  <span
                    style={{
                      position: 'absolute',
                      bottom: '-14px',
                      left: '2px',
                      fontSize: '2.4rem',
                      fontWeight: '900',
                      lineHeight: '1',
                      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                      color: '#111827',
                      WebkitTextStroke: '2px #ffffff',
                      paintOrder: 'stroke fill',
                      filter: 'drop-shadow(0 2px 3px rgba(0, 0, 0, 0.35))',
                      zIndex: 10,
                      userSelect: 'none',
                      pointerEvents: 'none',
                    }}
                  >
                    {index + 1}
                  </span>
                </Link>

                {/* Pill Tag below the rank number (matching screenshot) */}
                <div style={{ marginTop: '2px' }}>
                  <span
                    style={{
                      display: 'inline-block',
                      maxWidth: '100%',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      backgroundColor: '#f3f4f6',
                      color: '#374151',
                      fontSize: '0.74rem',
                      fontWeight: '500',
                      padding: '3px 8px',
                      borderRadius: '6px',
                    }}
                    title={book.tag}
                  >
                    {book.tag}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};


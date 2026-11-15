import React, { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useSubjectBooks } from '../api/hooks.ts';
import { BookCard } from './BookCard.tsx';

interface BookRowProps {
  title: string;
  subject: string;
}

export const BookRow: React.FC<BookRowProps> = ({ title, subject }) => {
  const { data, isLoading, isError } = useSubjectBooks(subject, 1);
  const rowRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    if (rowRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = rowRef.current;
      setCanScrollLeft(scrollLeft > 10);
      setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 10);
    }
  };

  useEffect(() => {
    checkScroll();
  }, [data]);

  const scrollLeft = () => {
    if (rowRef.current) {
      rowRef.current.scrollBy({ left: -480, behavior: 'smooth' });
      setTimeout(checkScroll, 350);
    }
  };

  const scrollRight = () => {
    if (rowRef.current) {
      rowRef.current.scrollBy({ left: 480, behavior: 'smooth' });
      setTimeout(checkScroll, 350);
    }
  };

  if (isError) {
    return null; // Gracefully omit row if subject fails
  }

  const navButtonStyle = (position: 'left' | 'right'): React.CSSProperties => ({
    position: 'absolute',
    [position]: '-12px',
    top: '40%',
    transform: 'translateY(-50%)',
    zIndex: 25,
    width: '38px',
    height: '38px',
    borderRadius: '50%',
    border: '1px solid #e4e4e7',
    backgroundColor: '#ffffff',
    color: '#18181b',
    boxShadow: '0 4px 14px rgba(0, 0, 0, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    outline: 'none',
    padding: 0,
    transition: 'transform 0.15s ease, box-shadow 0.15s ease',
  });

  return (
    <section style={{ marginBottom: '44px' }}>
      {/* Row Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '16px',
        }}
      >
        <h3 style={{ margin: 0, fontSize: '1.28rem', fontWeight: '800', color: '#18181b', letterSpacing: '-0.3px' }}>
          {title}
        </h3>

        <Link
          to={`/catalogs?genre=${encodeURIComponent(subject)}`}
          style={{
            fontSize: '0.86rem',
            color: '#71717a',
            fontWeight: '600',
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            transition: 'color 0.15s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = '#18181b';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = '#71717a';
          }}
        >
          <span>View all</span>
          <span>&rarr;</span>
        </Link>
      </div>

      {/* Relative Carousel Container with Side Overlay Buttons */}
      <div style={{ position: 'relative' }}>
        {/* Left Floating Circle Button (Desktop only) */}
        {canScrollLeft && (
          <button
            onClick={scrollLeft}
            aria-label="Previous books"
            style={navButtonStyle('left')}
            className="hidden md:flex"
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.transform = 'translateY(-50%) scale(1.08)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.transform = 'translateY(-50%) scale(1)';
            }}
          >
            <ChevronLeft size={18} strokeWidth={2.4} />
          </button>
        )}

        {/* Right Floating Circle Button (Desktop only) */}
        {canScrollRight && (
          <button
            onClick={scrollRight}
            aria-label="Next books"
            style={navButtonStyle('right')}
            className="hidden md:flex"
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.transform = 'translateY(-50%) scale(1.08)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.transform = 'translateY(-50%) scale(1)';
            }}
          >
            <ChevronRight size={18} strokeWidth={2.4} />
          </button>
        )}

        {/* Seamless Horizontal Scrollable Book Row */}
        {isLoading ? (
          <div
            className="hide-scrollbar"
            style={{
              display: 'flex',
              gap: '18px',
              overflowX: 'auto',
              padding: '6px 2px 14px 2px',
            }}
          >
            {[1, 2, 3, 4, 5, 6, 7].map((n) => (
              <div
                key={n}
                style={{
                  flex: '0 0 160px',
                  width: '160px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                }}
              >
                <div
                  className="skeleton-shimmer"
                  style={{
                    width: '100%',
                    aspectRatio: '1 / 1.48',
                    borderRadius: '8px',
                  }}
                />
                <div
                  className="skeleton-shimmer"
                  style={{
                    width: '85%',
                    height: '14px',
                    borderRadius: '4px',
                    marginTop: '4px',
                  }}
                />
                <div
                  className="skeleton-shimmer"
                  style={{
                    width: '55%',
                    height: '12px',
                    borderRadius: '4px',
                  }}
                />
              </div>
            ))}
          </div>
        ) : (
          <div
            ref={rowRef}
            onScroll={checkScroll}
            className="hide-scrollbar"
            style={{
              display: 'flex',
              gap: '18px',
              overflowX: 'auto',
              padding: '6px 2px 14px 2px',
              scrollSnapType: 'x mandatory',
              WebkitOverflowScrolling: 'touch',
            }}
          >
            {data?.books.map((book) => (
              <div
                key={book.key}
                style={{
                  flex: '0 0 160px',
                  width: '160px',
                  scrollSnapAlign: 'start',
                }}
              >
                <BookCard book={book} />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

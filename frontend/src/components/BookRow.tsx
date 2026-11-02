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
    [position]: '-16px',
    top: '42%',
    transform: 'translateY(-50%)',
    zIndex: 25,
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    border: '1px solid #e4e4e7',
    backgroundColor: '#ffffff',
    color: '#18181b',
    boxShadow: '0 4px 14px rgba(0, 0, 0, 0.15)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    outline: 'none',
    padding: 0,
    transition: 'transform 0.15s ease, box-shadow 0.15s ease, opacity 0.2s ease',
  });

  return (
    <section style={{ marginBottom: '40px' }}>
      {/* Row Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '14px',
        }}
      >
        <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '800', color: '#1a1a1a', letterSpacing: '-0.3px' }}>
          {title}
        </h3>

        <Link
          to={`/catalogs`}
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

      {/* Relative Carousel Container with Side Overlay Buttons */}
      <div style={{ position: 'relative' }}>
        {/* Left Floating Circle Button */}
        {canScrollLeft && (
          <button
            onClick={scrollLeft}
            aria-label="Previous books"
            style={navButtonStyle('left')}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.transform = 'translateY(-50%) scale(1.05)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.transform = 'translateY(-50%) scale(1)';
            }}
          >
            <ChevronLeft size={20} strokeWidth={2.4} />
          </button>
        )}

        {/* Right Floating Circle Button */}
        {canScrollRight && (
          <button
            onClick={scrollRight}
            aria-label="Next books"
            style={navButtonStyle('right')}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.transform = 'translateY(-50%) scale(1.05)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.transform = 'translateY(-50%) scale(1)';
            }}
          >
            <ChevronRight size={20} strokeWidth={2.4} />
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
              scrollbarWidth: 'none',
            }}
          >
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div
                key={n}
                style={{
                  flex: '0 0 165px',
                  height: '240px',
                  backgroundColor: '#f5f5f5',
                  borderRadius: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#aaa',
                  fontSize: '0.8rem',
                }}
              >
                Loading...
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
              scrollbarWidth: 'none',
            }}
          >
            {data?.books.map((book) => (
              <div
                key={book.key}
                style={{
                  flex: '0 0 165px',
                  width: '165px',
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

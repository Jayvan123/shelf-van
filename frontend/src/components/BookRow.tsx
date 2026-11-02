import React, { useRef } from 'react';
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

  const scrollLeft = () => {
    if (rowRef.current) {
      rowRef.current.scrollBy({ left: -480, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (rowRef.current) {
      rowRef.current.scrollBy({ left: 480, behavior: 'smooth' });
    }
  };

  if (isError) {
    return null; // Gracefully omit row if subject fails
  }

  const circleButtonStyle: React.CSSProperties = {
    width: '34px',
    height: '34px',
    borderRadius: '50%',
    border: '1px solid #d4d4d8',
    backgroundColor: '#ffffff',
    color: '#18181b',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    padding: 0,
    flexShrink: 0,
    outline: 'none',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
    transition: 'background-color 0.15s ease, border-color 0.15s ease',
  };

  return (
    <section style={{ marginBottom: '36px' }}>
      {/* Row Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '14px',
        }}
      >
        <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '700', color: '#1a1a1a' }}>
          {title}
        </h3>

        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
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

          {/* Full Circle Arrow Buttons matching image */}
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <button
              onClick={scrollLeft}
              aria-label="Scroll left"
              style={circleButtonStyle}
            >
              <ChevronLeft size={16} strokeWidth={2.2} />
            </button>
            <button
              onClick={scrollRight}
              aria-label="Scroll right"
              style={circleButtonStyle}
            >
              <ChevronRight size={16} strokeWidth={2.2} />
            </button>
          </div>
        </div>
      </div>

      {/* Seamless Horizontal Scrollable Book Row */}
      {isLoading ? (
        <div
          className="hide-scrollbar"
          style={{
            display: 'flex',
            gap: '16px',
            overflowX: 'auto',
            padding: '4px 2px 8px 2px',
            scrollbarWidth: 'none',
          }}
        >
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div
              key={n}
              style={{
                flex: '0 0 160px',
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
          className="hide-scrollbar"
          style={{
            display: 'flex',
            gap: '16px',
            overflowX: 'auto',
            padding: '4px 2px 8px 2px',
            scrollSnapType: 'x mandatory',
            WebkitOverflowScrolling: 'touch',
            scrollbarWidth: 'none',
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
    </section>
  );
};

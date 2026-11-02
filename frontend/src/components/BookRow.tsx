import React from 'react';
import { Link } from 'react-router-dom';
import { useSubjectBooks } from '../api/hooks.ts';
import { BookCard } from './BookCard.tsx';

interface BookRowProps {
  title: string;
  subject: string;
  icon?: string;
}

export const BookRow: React.FC<BookRowProps> = ({ title, subject, icon }) => {
  const { data, isLoading, isError } = useSubjectBooks(subject, 1);

  if (isError) {
    return null; // Gracefully omit row if subject fails
  }

  return (
    <section style={{ marginBottom: '32px' }}>
      {/* Row Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '12px',
          paddingBottom: '6px',
          borderBottom: '1px solid #f0f0f0',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {icon && <span style={{ fontSize: '1.2rem' }}>{icon}</span>}
          <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: '700', color: '#1a1a1a' }}>
            {title}
          </h3>
          {data && (
            <span style={{ fontSize: '0.8rem', color: '#888' }}>
              ({data.total.toLocaleString()} books)
            </span>
          )}
        </div>

        <Link
          to={`/catalogs`}
          style={{
            fontSize: '0.85rem',
            color: '#ff5436',
            fontWeight: '600',
            textDecoration: 'none',
          }}
        >
          View all in Catalogs &rarr;
        </Link>
      </div>

      {/* Horizontal Scrollable Book Row */}
      {isLoading ? (
        <div style={{ display: 'flex', gap: '16px', overflowX: 'auto', padding: '8px 0' }}>
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
          style={{
            display: 'flex',
            gap: '16px',
            overflowX: 'auto',
            padding: '8px 2px 14px 2px',
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
    </section>
  );
};


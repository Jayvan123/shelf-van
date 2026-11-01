import React from 'react';
import { Link } from 'react-router-dom';
import type { BookSummary, ReadingStatus } from '../types/index.ts';
import { useShelfStore } from '../store/useShelfStore.ts';

interface BookCardProps {
  book: BookSummary;
  onQuickAdd?: (book: BookSummary, status: ReadingStatus) => void;
}

export const BookCard: React.FC<BookCardProps> = ({ book, onQuickAdd }) => {
  const { getBook, addOrUpdateBook } = useShelfStore();
  const shelfEntry = getBook(book.key);

  const coverSrc = book.coverUrl ? `http://localhost:3000${book.coverUrl}` : undefined;

  const handleAdd = (e: React.MouseEvent, status: ReadingStatus) => {
    e.preventDefault();
    e.stopPropagation();
    if (onQuickAdd) {
      onQuickAdd(book, status);
    } else {
      addOrUpdateBook(book, status);
    }
  };

  return (
    <div
      style={{
        border: '1px solid #ddd',
        borderRadius: '6px',
        overflow: 'hidden',
        backgroundColor: '#fff',
        display: 'flex',
        flexDirection: 'column',
        width: '180px',
        maxWidth: '100%',
        boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
      }}
    >
      {/* Cover Image Area */}
      <Link
        to={`/book/${book.key}`}
        style={{
          display: 'block',
          position: 'relative',
          width: '100%',
          height: '240px',
          backgroundColor: '#eee',
          textDecoration: 'none',
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
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '12px',
              textAlign: 'center',
              backgroundColor: '#f2f2f2',
              color: '#666',
              fontSize: '0.85rem',
            }}
          >
            <span style={{ fontSize: '2rem', marginBottom: '8px' }}>📖</span>
            <strong>{book.title}</strong>
          </div>
        )}

        {/* Scan Available Badge */}
        {book.isReadable && (
          <div
            style={{
              position: 'absolute',
              top: '8px',
              right: '8px',
              backgroundColor: 'rgba(2, 132, 199, 0.95)',
              color: '#fff',
              fontSize: '0.7rem',
              fontWeight: 'bold',
              padding: '3px 6px',
              borderRadius: '4px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
            }}
          >
            📖 Read
          </div>
        )}
      </Link>

      {/* Book Info Area */}
      <div style={{ padding: '10px', display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between' }}>
        <div>
          <Link
            to={`/book/${book.key}`}
            style={{
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              fontSize: '0.95rem',
              fontWeight: 'bold',
              color: '#111',
              margin: '0 0 4px 0',
              lineHeight: '1.25',
              textDecoration: 'none',
            }}
            title={book.title}
          >
            {book.title}
          </Link>
          <p
            style={{
              fontSize: '0.8rem',
              color: '#666',
              margin: '0 0 6px 0',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
            title={book.authors.join(', ')}
          >
            {book.authors.length > 0 ? book.authors.join(', ') : 'Unknown'}
          </p>
          {book.firstPublishYear && (
            <p style={{ fontSize: '0.75rem', color: '#999', margin: '0 0 8px 0' }}>
              {book.firstPublishYear}
            </p>
          )}
        </div>

        {/* Quick Shelf Action */}
        <div style={{ marginTop: '6px', borderTop: '1px solid #f0f0f0', paddingTop: '8px' }}>
          {shelfEntry ? (
            <span style={{ fontSize: '0.75rem', color: '#2e7d32', fontWeight: 'bold' }}>
              ✓ Saved ({shelfEntry.status})
            </span>
          ) : (
            <div style={{ display: 'flex', gap: '4px' }}>
              <button
                onClick={(e) => handleAdd(e, 'want_to_read')}
                style={{
                  fontSize: '0.75rem',
                  padding: '3px 6px',
                  flex: 1,
                  textAlign: 'center',
                }}
              >
                + Want to Read
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};


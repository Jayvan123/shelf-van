import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Book, Bookmark, Check, Eye } from 'lucide-react';
import type { BookSummary, ReadingStatus } from '../types/index.ts';
import { useShelfStore } from '../store/useShelfStore.ts';

interface BookCardProps {
  book: BookSummary;
  onQuickAdd?: (book: BookSummary, status: ReadingStatus) => void;
  footer?: React.ReactNode;
}

export const BookCard: React.FC<BookCardProps> = ({ book, onQuickAdd, footer }) => {
  const { getBook, addOrUpdateBook } = useShelfStore();
  const shelfEntry = getBook(book.key);
  const [isHovered, setIsHovered] = useState(false);

  const coverSrc = book.coverUrl
    ? (book.coverUrl.startsWith('http') ? book.coverUrl : `http://localhost:3000${book.coverUrl}`)
    : undefined;

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
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        width: '100%',
        height: '100%',
      }}
    >
      {/* 3D Book Cover */}
      <div className="book-cover">
        <Link
          to={`/book/${book.key}`}
          title={book.title}
          style={{
            display: 'block',
            width: '100%',
            height: '100%',
            textDecoration: 'none',
            color: 'inherit',
          }}
        >
          {coverSrc ? (
            <img
              src={coverSrc}
              alt={book.title}
              loading="lazy"
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
                padding: '16px',
                textAlign: 'center',
                backgroundColor: '#f4f4f5',
                color: '#52525b',
              }}
            >
              <Book size={32} style={{ marginBottom: '8px', opacity: 0.5 }} />
              <span
                style={{
                  fontSize: '0.82rem',
                  fontWeight: 'bold',
                  lineHeight: '1.25',
                  display: '-webkit-box',
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}
              >
                {book.title}
              </span>
              <span style={{ fontSize: '0.7rem', color: '#71717a', marginTop: '6px' }}>
                {book.authors[0] || (book.provider === 'googlebooks' ? 'Google Books' : 'Open Library')}
              </span>
            </div>
          )}
        </Link>

        {/* Hover Quick Action Overlay */}
        <div
          style={{
            position: 'absolute',
            bottom: '8px',
            left: '8px',
            right: '8px',
            display: 'flex',
            gap: '6px',
            zIndex: 10,
            opacity: isHovered ? 1 : 0,
            transform: isHovered ? 'translateY(0)' : 'translateY(8px)',
            transition: 'all 0.2s ease',
          }}
        >
          {book.isReadable && (
            <Link
              to={`/read/${book.key}`}
              onClick={(e) => e.stopPropagation()}
              style={{
                flex: 1,
                backgroundColor: 'rgba(24, 24, 27, 0.92)',
                color: '#fff',
                fontSize: '0.75rem',
                fontWeight: '600',
                padding: '6px 10px',
                borderRadius: '9999px',
                textAlign: 'center',
                backdropFilter: 'blur(4px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px',
                textDecoration: 'none',
              }}
            >
              <Eye size={13} />
              Read
            </Link>
          )}

          <button
            type="button"
            onClick={(e) => handleAdd(e, 'want_to_read')}
            style={{
              flex: book.isReadable ? undefined : 1,
              backgroundColor: shelfEntry ? '#27272a' : '#18181b',
              color: '#fff',
              border: 'none',
              fontSize: '0.75rem',
              fontWeight: '600',
              padding: '6px 12px',
              borderRadius: '9999px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
            }}
            title={shelfEntry ? 'In your shelf' : 'Add to shelf'}
          >
            {shelfEntry ? <Check size={13} /> : <Bookmark size={13} />}
            {shelfEntry ? 'Saved' : 'Save'}
          </button>
        </div>
      </div>

      {/* Title & Author */}
      <div style={{ marginTop: '8px', padding: '0 2px', display: 'flex', flexDirection: 'column', flex: 1 }}>
        <Link
          to={`/book/${book.key}`}
          style={{
            fontSize: '0.88rem',
            fontWeight: '600',
            color: '#18181b',
            lineHeight: '1.3',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            minHeight: '2.35em',
          }}
          title={book.title}
        >
          {book.title}
        </Link>
        <p
          style={{
            fontSize: '0.78rem',
            color: '#71717a',
            marginTop: '2px',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            minHeight: '1.2em',
          }}
        >
          {book.authors.length > 0 ? book.authors.join(', ') : 'Unknown Author'}
        </p>
        {footer && <div style={{ marginTop: 'auto', paddingTop: '8px' }}>{footer}</div>}
      </div>
    </div>
  );
};

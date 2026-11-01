import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Book, Tablet, Bookmark, Check, Eye } from 'lucide-react';
import type { BookSummary, ReadingStatus } from '../types/index.ts';
import { useShelfStore } from '../store/useShelfStore.ts';

interface BookCardProps {
  book: BookSummary;
  onQuickAdd?: (book: BookSummary, status: ReadingStatus) => void;
}

export const BookCard: React.FC<BookCardProps> = ({ book, onQuickAdd }) => {
  const { getBook, addOrUpdateBook } = useShelfStore();
  const shelfEntry = getBook(book.key);
  const [isHovered, setIsHovered] = useState(false);

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
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        width: '100%',
      }}
    >
      {/* 3D Book Cover */}
      <Link
        to={`/book/${book.key}`}
        className="book-cover"
        title={book.title}
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
              backgroundColor: '#eae8e3',
              color: '#444',
            }}
          >
            <Book size={32} style={{ marginBottom: '8px', opacity: 0.6 }} />
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
            <span style={{ fontSize: '0.7rem', color: '#777', marginTop: '6px' }}>
              {book.authors[0] || 'Open Library'}
            </span>
          </div>
        )}

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
                backgroundColor: 'rgba(26, 26, 26, 0.9)',
                color: '#fff',
                fontSize: '0.75rem',
                fontWeight: '600',
                padding: '6px 8px',
                borderRadius: '4px',
                textAlign: 'center',
                backdropFilter: 'blur(4px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px',
              }}
            >
              <Eye size={13} />
              Read
            </Link>
          )}

          <button
            onClick={(e) => handleAdd(e, 'want_to_read')}
            style={{
              flex: book.isReadable ? undefined : 1,
              backgroundColor: shelfEntry ? '#2e7d32' : 'rgba(255, 84, 54, 0.95)',
              color: '#fff',
              border: 'none',
              fontSize: '0.75rem',
              fontWeight: '600',
              padding: '6px 8px',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
              boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
            }}
            title={shelfEntry ? 'In your shelf' : 'Add to shelf'}
          >
            {shelfEntry ? <Check size={13} /> : <Bookmark size={13} />}
            {shelfEntry ? 'Saved' : 'Save'}
          </button>
        </div>
      </Link>

      {/* Meta Row Directly Under Cover matching reference image */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: '8px',
          padding: '0 2px',
        }}
      >
        {/* Format Icons (Hardcover / E-Book) */}
        <div style={{ display: 'flex', gap: '6px', color: '#9e9e9e', alignItems: 'center' }}>
          <span title="Book edition available" style={{ display: 'inline-flex' }}>
            <Book size={14} />
          </span>
          {book.isReadable && (
            <span title="Digital scan readable online" style={{ display: 'inline-flex' }}>
              <Tablet size={14} color="#ff5436" />
            </span>
          )}
        </div>

        {/* Coral Price/Tag matching reference UI ($18 or Free / Year) */}
        <div
          style={{
            color: '#ff5436',
            fontSize: '0.85rem',
            fontWeight: 'bold',
            letterSpacing: '-0.2px',
          }}
        >
          {book.isReadable ? 'FREE' : book.firstPublishYear ? `'${String(book.firstPublishYear).slice(-2)}` : 'OL'}
        </div>
      </div>

      {/* Title & Author */}
      <div style={{ marginTop: '4px', padding: '0 2px' }}>
        <Link
          to={`/book/${book.key}`}
          style={{
            fontSize: '0.88rem',
            fontWeight: '600',
            color: '#1a1a1a',
            lineHeight: '1.3',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
          title={book.title}
        >
          {book.title}
        </Link>
        <p
          style={{
            fontSize: '0.78rem',
            color: '#8a8a8a',
            marginTop: '2px',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {book.authors.length > 0 ? book.authors.join(', ') : 'Unknown Author'}
        </p>
      </div>
    </div>
  );
};

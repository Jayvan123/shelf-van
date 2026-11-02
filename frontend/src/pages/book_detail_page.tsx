import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ExternalLink, Check, Bookmark } from 'lucide-react';
import { useBookDetail } from '../api/hooks.ts';
import { useShelfStore } from '../store/useShelfStore.ts';
import type { ReadingStatus } from '../types/index.ts';

export const BookDetailPage: React.FC = () => {
  const { key } = useParams<{ key: string }>();
  const navigate = useNavigate();

  const { data: book, isLoading, isError, error } = useBookDetail(key);
  const { addOrUpdateBook, getBook, removeBook } = useShelfStore();

  const shelfEntry = key ? getBook(key) : undefined;
  const [selectedStatus, setSelectedStatus] = useState<ReadingStatus>(
    shelfEntry?.status || 'want_to_read'
  );

  if (isLoading) {
    return (
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '60px 20px', textAlign: 'center', color: '#71717a' }}>
        <p style={{ fontSize: '1rem' }}>Loading book details...</p>
      </div>
    );
  }

  if (isError || !book) {
    return (
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '40px 20px' }}>
        <p style={{ color: '#dc2626', marginBottom: '16px', fontSize: '0.95rem' }}>
          {error instanceof Error ? error.message : 'Unable to load book details.'}
        </p>
        <button
          onClick={() => navigate(-1)}
          style={{
            padding: '8px 16px',
            borderRadius: '6px',
            border: '1px solid #d4d4d8',
            backgroundColor: '#ffffff',
            cursor: 'pointer',
            fontWeight: '600',
            fontSize: '0.88rem',
            color: '#18181b',
          }}
        >
          &larr; Go Back
        </button>
      </div>
    );
  }

  const handleSaveToShelf = () => {
    addOrUpdateBook(book, selectedStatus);
  };

  const coverSrc = book.coverUrl ? `http://localhost:3000${book.coverUrl}` : undefined;

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '24px 20px 60px 20px' }}>
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        style={{
          background: 'none',
          border: '1px solid #d4d4d8',
          borderRadius: '6px',
          padding: '6px 14px',
          fontSize: '0.88rem',
          fontWeight: '600',
          cursor: 'pointer',
          color: '#18181b',
          backgroundColor: '#ffffff',
          marginBottom: '28px',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
        }}
      >
        &larr; Back
      </button>

      {/* Main Details Section */}
      <div style={{ display: 'flex', gap: '36px', flexWrap: 'wrap', alignItems: 'flex-start' }}>
        {/* Left: 3D Book Cover */}
        <div style={{ width: '220px', maxWidth: '100%', flexShrink: 0 }}>
          <div className="book-cover">
            {coverSrc ? (
              <img
                src={coverSrc}
                alt={book.title}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
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
                  padding: '20px',
                  textAlign: 'center',
                  backgroundColor: '#f4f4f5',
                  color: '#71717a',
                }}
              >
                <strong style={{ fontSize: '0.95rem' }}>{book.title}</strong>
              </div>
            )}
          </div>
        </div>

        {/* Right: Book Details & Actions */}
        <div style={{ flex: 1, minWidth: '280px' }}>
          <h1
            style={{
              fontSize: '1.85rem',
              fontWeight: '800',
              letterSpacing: '-0.4px',
              color: '#18181b',
              lineHeight: '1.25',
              margin: '0 0 6px 0',
            }}
          >
            {book.title}
          </h1>

          <p style={{ fontSize: '1rem', color: '#71717a', margin: '0 0 16px 0' }}>
            By <strong style={{ color: '#18181b' }}>{book.authors.length > 0 ? book.authors.join(', ') : 'Unknown Author'}</strong>
          </p>

          {/* Simple Clean Availability Badge */}
          <div style={{ marginBottom: '24px' }}>
            <span
              style={{
                display: 'inline-block',
                backgroundColor: '#f4f4f5',
                color: '#18181b',
                fontSize: '0.78rem',
                fontWeight: '600',
                padding: '4px 10px',
                borderRadius: '999px',
              }}
            >
              {book.isReadable ? 'Free Digital Scan Available' : 'Print / Lending Edition'}
            </span>
          </div>

          {/* Action Bar */}
          <div
            style={{
              display: 'flex',
              gap: '10px',
              alignItems: 'center',
              flexWrap: 'wrap',
              padding: '16px',
              backgroundColor: '#fafafa',
              borderRadius: '8px',
              border: '1px solid #e4e4e7',
              marginBottom: '28px',
            }}
          >
            {book.isReadable && book.readerUrl && (
              <Link
                to={`/read/${book.key}`}
                style={{
                  backgroundColor: '#18181b',
                  color: '#ffffff',
                  fontWeight: '600',
                  fontSize: '0.88rem',
                  padding: '9px 18px',
                  borderRadius: '6px',
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                Read Book
              </Link>
            )}

            {/* Shelf Status Dropdown */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as ReadingStatus)}
              style={{
                padding: '8px 12px',
                borderRadius: '6px',
                border: '1px solid #d4d4d8',
                backgroundColor: '#ffffff',
                fontSize: '0.86rem',
                fontWeight: '500',
                color: '#18181b',
                cursor: 'pointer',
                outline: 'none',
              }}
            >
              <option value="want_to_read">Want to Read</option>
              <option value="reading">Currently Reading</option>
              <option value="completed">Completed</option>
            </select>

            {/* Save Button */}
            <button
              onClick={handleSaveToShelf}
              style={{
                backgroundColor: shelfEntry ? '#27272a' : '#18181b',
                color: '#ffffff',
                border: 'none',
                fontWeight: '600',
                fontSize: '0.88rem',
                padding: '9px 16px',
                borderRadius: '6px',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              {shelfEntry ? <Check size={15} /> : <Bookmark size={15} />}
              {shelfEntry ? 'In Shelf' : 'Save to Shelf'}
            </button>

            {shelfEntry && (
              <button
                onClick={() => removeBook(book.key)}
                style={{
                  background: 'none',
                  border: '1px solid #e4e4e7',
                  borderRadius: '6px',
                  color: '#71717a',
                  fontSize: '0.84rem',
                  fontWeight: '500',
                  cursor: 'pointer',
                  padding: '8px 12px',
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#fca5a5';
                  e.currentTarget.style.color = '#ef4444';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#e4e4e7';
                  e.currentTarget.style.color = '#71717a';
                }}
              >
                Remove
              </button>
            )}

            {book.previewUrl && (
              <a
                href={book.previewUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: '#71717a',
                  fontSize: '0.84rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  marginLeft: 'auto',
                  textDecoration: 'none',
                }}
              >
                Open Library
                <ExternalLink size={13} />
              </a>
            )}
          </div>

          {/* Clean Metadata Grid (No unneeded icons) */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
              gap: '16px',
            }}
          >
            {book.publishDate && (
              <div>
                <span style={{ fontSize: '0.74rem', color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.4px', fontWeight: '600' }}>
                  Published
                </span>
                <p style={{ margin: '4px 0 0 0', fontSize: '0.92rem', fontWeight: '600', color: '#18181b' }}>
                  {book.publishDate}
                </p>
              </div>
            )}

            {book.pageCount && (
              <div>
                <span style={{ fontSize: '0.74rem', color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.4px', fontWeight: '600' }}>
                  Length
                </span>
                <p style={{ margin: '4px 0 0 0', fontSize: '0.92rem', fontWeight: '600', color: '#18181b' }}>
                  {book.pageCount} pages
                </p>
              </div>
            )}

            {book.publishers && book.publishers.length > 0 && (
              <div>
                <span style={{ fontSize: '0.74rem', color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.4px', fontWeight: '600' }}>
                  Publisher
                </span>
                <p style={{ margin: '4px 0 0 0', fontSize: '0.92rem', fontWeight: '600', color: '#18181b' }}>
                  {book.publishers[0]}
                </p>
              </div>
            )}

            {book.isbn && book.isbn.length > 0 && (
              <div>
                <span style={{ fontSize: '0.74rem', color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.4px', fontWeight: '600' }}>
                  ISBN
                </span>
                <p style={{ margin: '4px 0 0 0', fontSize: '0.92rem', fontWeight: '600', color: '#18181b' }}>
                  {book.isbn[0]}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Synopsis / Description */}
      {book.description && (
        <div style={{ marginTop: '40px', paddingTop: '28px', borderTop: '1px solid #f4f4f5' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: '700', margin: '0 0 12px 0', color: '#18181b' }}>
            Synopsis
          </h2>
          <p style={{ lineHeight: '1.7', color: '#3f3f46', fontSize: '0.95rem', whiteSpace: 'pre-wrap', maxWidth: '840px', margin: 0 }}>
            {book.description}
          </p>
        </div>
      )}

      {/* Subjects & Topics */}
      {book.subjects && book.subjects.length > 0 && (
        <div style={{ marginTop: '32px' }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: '700', margin: '0 0 10px 0', color: '#18181b' }}>
            Genres & Topics
          </h3>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {book.subjects.slice(0, 15).map((subj) => (
              <Link
                key={subj}
                to={`/catalogs?genre=${encodeURIComponent(subj.toLowerCase().replace(/\s+/g, '_'))}`}
                style={{
                  backgroundColor: '#f4f4f5',
                  color: '#52525b',
                  padding: '5px 12px',
                  borderRadius: '999px',
                  fontSize: '0.8rem',
                  fontWeight: '500',
                  textDecoration: 'none',
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#18181b';
                  e.currentTarget.style.color = '#ffffff';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#f4f4f5';
                  e.currentTarget.style.color = '#52525b';
                }}
              >
                {subj}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

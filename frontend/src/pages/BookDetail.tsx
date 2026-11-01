import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, BookOpen, Bookmark, Check, ExternalLink, Calendar, FileText, Building2, Hash, Tablet } from 'lucide-react';
import { useBookDetail } from '../api/hooks.ts';
import { useShelfStore } from '../store/useShelfStore.ts';
import type { ReadingStatus } from '../types/index.ts';

export const BookDetail: React.FC = () => {
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
      <div style={{ maxWidth: '960px', margin: '40px auto', padding: '0 24px', textAlign: 'center', color: '#666' }}>
        <p style={{ fontSize: '1.1rem' }}>Loading book details from Open Library...</p>
      </div>
    );
  }

  if (isError || !book) {
    return (
      <div style={{ maxWidth: '960px', margin: '40px auto', padding: '0 24px' }}>
        <p style={{ color: '#d32f2f', marginBottom: '16px' }}>
          {error instanceof Error ? error.message : 'Unable to load book details.'}
        </p>
        <button
          onClick={() => navigate(-1)}
          style={{ padding: '8px 16px', borderRadius: '6px', border: '1px solid #ccc', cursor: 'pointer' }}
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
    <div style={{ backgroundColor: '#fff', minHeight: '90vh', padding: '24px 0 60px 0' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 24px' }}>
        {/* Back Link */}
        <button
          onClick={() => navigate(-1)}
          style={{
            background: 'none',
            border: 'none',
            color: '#777',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '0.9rem',
            cursor: 'pointer',
            padding: '4px 0',
            marginBottom: '24px',
          }}
        >
          <ArrowLeft size={16} />
          Back
        </button>

        {/* Hero Card */}
        <div style={{ display: 'flex', gap: '40px', flexWrap: 'wrap' }}>
          {/* Left: 3D Book Cover */}
          <div style={{ width: '220px', maxWidth: '100%', flexShrink: 0 }}>
            <div className="book-cover" style={{ height: '320px', aspectRatio: 'unset' }}>
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
                    backgroundColor: '#eae8e3',
                    color: '#555',
                  }}
                >
                  <BookOpen size={40} style={{ opacity: 0.5, marginBottom: '12px' }} />
                  <strong style={{ fontSize: '0.95rem' }}>{book.title}</strong>
                </div>
              )}
            </div>
          </div>

          {/* Right: Book Details */}
          <div style={{ flex: 1, minWidth: '280px' }}>
            <h1
              style={{
                fontSize: '1.85rem',
                fontWeight: '800',
                letterSpacing: '-0.5px',
                color: '#1a1a1a',
                lineHeight: '1.25',
                marginBottom: '8px',
              }}
            >
              {book.title}
            </h1>

            <p style={{ fontSize: '1.1rem', color: '#666', marginBottom: '20px' }}>
              By{' '}
              <strong style={{ color: '#222' }}>
                {book.authors.length > 0 ? book.authors.join(', ') : 'Unknown Author'}
              </strong>
            </p>

            {/* Read / Availability Pill */}
            {book.isReadable ? (
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  backgroundColor: '#fff3f0',
                  color: '#ff5436',
                  fontSize: '0.82rem',
                  fontWeight: '700',
                  padding: '4px 10px',
                  borderRadius: '16px',
                  marginBottom: '20px',
                }}
              >
                <Tablet size={14} />
                FULL DIGITAL SCAN AVAILABLE
              </div>
            ) : (
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  backgroundColor: '#f5f5f5',
                  color: '#777',
                  fontSize: '0.82rem',
                  padding: '4px 10px',
                  borderRadius: '16px',
                  marginBottom: '20px',
                }}
              >
                PHYSICAL / LENDING ONLY
              </div>
            )}

            {/* Action Bar */}
            <div
              style={{
                display: 'flex',
                gap: '12px',
                alignItems: 'center',
                flexWrap: 'wrap',
                padding: '16px',
                backgroundColor: '#f9f9f9',
                borderRadius: '8px',
                border: '1px solid #ededed',
                marginBottom: '28px',
              }}
            >
              {book.isReadable && book.readerUrl && (
                <Link to={`/read/${book.key}`}>
                  <button
                    style={{
                      backgroundColor: '#ff5436',
                      color: '#fff',
                      border: 'none',
                      fontWeight: '700',
                      fontSize: '0.92rem',
                      padding: '10px 20px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      boxShadow: '0 2px 6px rgba(255, 84, 54, 0.3)',
                    }}
                  >
                    <BookOpen size={17} />
                    Read Book Scan
                  </button>
                </Link>
              )}

              {/* Shelf Status Dropdown & Save */}
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value as ReadingStatus)}
                style={{
                  padding: '9px 12px',
                  borderRadius: '6px',
                  border: '1px solid #ddd',
                  backgroundColor: '#fff',
                  fontSize: '0.88rem',
                  cursor: 'pointer',
                }}
              >
                <option value="want_to_read">Want to Read</option>
                <option value="reading">Currently Reading</option>
                <option value="completed">Completed</option>
              </select>

              <button
                onClick={handleSaveToShelf}
                style={{
                  backgroundColor: shelfEntry ? '#2e7d32' : '#1a1a1a',
                  color: '#fff',
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
                {shelfEntry ? <Check size={16} /> : <Bookmark size={16} />}
                {shelfEntry ? 'Update Status' : 'Save to Shelf'}
              </button>

              {shelfEntry && (
                <button
                  onClick={() => removeBook(book.key)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#c00',
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    padding: '8px',
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
                    color: '#555',
                    fontSize: '0.85rem',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    marginLeft: 'auto',
                  }}
                >
                  Open Library
                  <ExternalLink size={13} />
                </a>
              )}
            </div>

            {/* Metadata Grid */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                gap: '16px',
                paddingTop: '8px',
              }}
            >
              {book.publishDate && (
                <div>
                  <span style={{ fontSize: '0.78rem', color: '#888', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Calendar size={13} /> Published
                  </span>
                  <strong style={{ fontSize: '0.9rem', color: '#222' }}>{book.publishDate}</strong>
                </div>
              )}

              {book.pageCount && (
                <div>
                  <span style={{ fontSize: '0.78rem', color: '#888', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <FileText size={13} /> Pages
                  </span>
                  <strong style={{ fontSize: '0.9rem', color: '#222' }}>{book.pageCount} pages</strong>
                </div>
              )}

              {book.publishers && book.publishers.length > 0 && (
                <div>
                  <span style={{ fontSize: '0.78rem', color: '#888', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Building2 size={13} /> Publisher
                  </span>
                  <strong style={{ fontSize: '0.9rem', color: '#222' }}>{book.publishers[0]}</strong>
                </div>
              )}

              {book.isbn && book.isbn.length > 0 && (
                <div>
                  <span style={{ fontSize: '0.78rem', color: '#888', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Hash size={13} /> ISBN
                  </span>
                  <strong style={{ fontSize: '0.9rem', color: '#222' }}>{book.isbn[0]}</strong>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Synopsis / Description */}
        {book.description && (
          <div style={{ marginTop: '48px', paddingTop: '28px', borderTop: '1px solid #ededed' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '12px' }}>Synopsis</h2>
            <p style={{ lineHeight: '1.7', color: '#333', fontSize: '0.95rem', whiteSpace: 'pre-wrap', maxWidth: '800px' }}>
              {book.description}
            </p>
          </div>
        )}

        {/* Subjects Tags */}
        {book.subjects && book.subjects.length > 0 && (
          <div style={{ marginTop: '28px' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: '700', marginBottom: '10px', color: '#666' }}>Genres & Topics</h3>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {book.subjects.map((subj) => (
                <Link
                  key={subj}
                  to={`/search?catalog=${encodeURIComponent(subj.toLowerCase().replace(/\s+/g, '_'))}`}
                  style={{
                    backgroundColor: '#f5f5f5',
                    color: '#444',
                    padding: '4px 10px',
                    borderRadius: '16px',
                    fontSize: '0.8rem',
                    textDecoration: 'none',
                  }}
                >
                  {subj}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

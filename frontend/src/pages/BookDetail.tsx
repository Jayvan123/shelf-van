import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
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
      <div style={{ padding: '24px 16px' }}>
        <p>Loading book details from Open Library via ShelfVan BFF...</p>
      </div>
    );
  }

  if (isError || !book) {
    return (
      <div style={{ padding: '24px 16px' }}>
        <p style={{ color: '#c00' }}>
          Error: {error instanceof Error ? error.message : 'Unable to load book details.'}
        </p>
        <button onClick={() => navigate(-1)}>&larr; Go Back</button>
      </div>
    );
  }

  const handleSaveToShelf = () => {
    addOrUpdateBook(book, selectedStatus);
  };

  const coverSrc = book.coverUrl ? `http://localhost:3000${book.coverUrl}` : undefined;

  return (
    <div style={{ padding: '0 16px', maxWidth: '800px' }}>
      <button onClick={() => navigate(-1)} style={{ marginBottom: '16px' }}>
        &larr; Back
      </button>

      <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
        {/* Cover */}
        <div>
          {coverSrc ? (
            <img
              src={coverSrc}
              alt={book.title}
              style={{ width: '180px', height: '260px', objectFit: 'cover', border: '1px solid #ccc' }}
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          ) : (
            <div
              style={{
                width: '180px',
                height: '260px',
                backgroundColor: '#eee',
                border: '1px solid #ccc',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                padding: '8px',
              }}
            >
              No Cover Available
            </div>
          )}
        </div>

        {/* Metadata */}
        <div style={{ flex: 1, minWidth: '280px' }}>
          <h1 style={{ margin: '0 0 8px 0', fontSize: '1.8rem' }}>{book.title}</h1>
          <p style={{ fontSize: '1.1rem', color: '#444', margin: '0 0 12px 0' }}>
            By {book.authors.length > 0 ? book.authors.join(', ') : 'Unknown Author'}
          </p>

          {/* Action Toolbar */}
          <div
            style={{
              padding: '12px',
              backgroundColor: '#f9f9f9',
              border: '1px solid #e0e0e0',
              marginBottom: '16px',
              display: 'flex',
              gap: '12px',
              alignItems: 'center',
              flexWrap: 'wrap',
            }}
          >
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as ReadingStatus)}
            >
              <option value="want_to_read">Want to Read</option>
              <option value="reading">Currently Reading</option>
              <option value="completed">Completed</option>
            </select>

            <button onClick={handleSaveToShelf} style={{ fontWeight: 'bold' }}>
              {shelfEntry ? 'Update Shelf Status' : 'Save to Shelf'}
            </button>

            {shelfEntry && (
              <button onClick={() => removeBook(book.key)} style={{ color: '#c00' }}>
                Remove from Shelf
              </button>
            )}

            {book.isReadable && book.readerUrl ? (
              <Link to={`/read/${book.key}`}>
                <button
                  style={{
                    backgroundColor: '#1e88e5',
                    color: '#fff',
                    fontWeight: 'bold',
                    padding: '4px 12px',
                  }}
                >
                  📖 Read Book
                </button>
              </Link>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '0.85rem', color: '#777' }}>
                  🔒 No Digital Scan
                </span>
                {book.previewUrl && (
                  <a href={book.previewUrl} target="_blank" rel="noopener noreferrer">
                    <button style={{ fontSize: '0.85rem' }}>Borrow on Open Library ↗</button>
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Detailed Info */}
          <table style={{ width: '100%', fontSize: '0.9rem', marginBottom: '16px' }}>
            <tbody>
              {book.publishDate && (
                <tr>
                  <td style={{ fontWeight: 'bold', width: '120px' }}>Published Date:</td>
                  <td>{book.publishDate}</td>
                </tr>
              )}
              {book.pageCount && (
                <tr>
                  <td style={{ fontWeight: 'bold' }}>Pages:</td>
                  <td>{book.pageCount} pages</td>
                </tr>
              )}
              {book.publishers && book.publishers.length > 0 && (
                <tr>
                  <td style={{ fontWeight: 'bold' }}>Publisher(s):</td>
                  <td>{book.publishers.join(', ')}</td>
                </tr>
              )}
              {book.isbn && book.isbn.length > 0 && (
                <tr>
                  <td style={{ fontWeight: 'bold' }}>ISBN:</td>
                  <td>{book.isbn.join(', ')}</td>
                </tr>
              )}
              {book.iaId && (
                <tr>
                  <td style={{ fontWeight: 'bold' }}>Archive.org ID:</td>
                  <td>
                    <code>{book.iaId}</code>
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {book.previewUrl && (
            <p style={{ fontSize: '0.85rem' }}>
              <a href={book.previewUrl} target="_blank" rel="noopener noreferrer">
                View on Open Library &rarr;
              </a>
            </p>
          )}
        </div>
      </div>

      {/* Description */}
      {book.description && (
        <div style={{ marginTop: '24px', borderTop: '1px solid #eee', paddingTop: '16px' }}>
          <h3>Description</h3>
          <p style={{ lineHeight: '1.6', whiteSpace: 'pre-wrap', color: '#333' }}>
            {book.description}
          </p>
        </div>
      )}

      {/* Subjects */}
      {book.subjects && book.subjects.length > 0 && (
        <div style={{ marginTop: '16px' }}>
          <h4>Subjects / Tags</h4>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {book.subjects.map((subj) => (
              <span
                key={subj}
                style={{
                  fontSize: '0.8rem',
                  padding: '2px 8px',
                  backgroundColor: '#eee',
                  borderRadius: '12px',
                }}
              >
                {subj}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

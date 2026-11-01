import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useShelfStore } from '../store/useShelfStore.ts';
import type { ReadingStatus } from '../types/index.ts';

export const Home: React.FC = () => {
  const { books, removeBook, updateStatus } = useShelfStore();
  const [filter, setFilter] = useState<ReadingStatus | 'all'>('all');

  const filteredBooks = books.filter((b) => {
    if (filter === 'all') return true;
    return b.status === filter;
  });

  return (
    <div style={{ padding: '0 16px' }}>
      <h2>My Reading Shelf</h2>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', margin: '16px 0' }}>
        <button
          onClick={() => setFilter('all')}
          style={{ fontWeight: filter === 'all' ? 'bold' : 'normal' }}
        >
          All ({books.length})
        </button>
        <button
          onClick={() => setFilter('reading')}
          style={{ fontWeight: filter === 'reading' ? 'bold' : 'normal' }}
        >
          Currently Reading ({books.filter((b) => b.status === 'reading').length})
        </button>
        <button
          onClick={() => setFilter('want_to_read')}
          style={{ fontWeight: filter === 'want_to_read' ? 'bold' : 'normal' }}
        >
          Want to Read ({books.filter((b) => b.status === 'want_to_read').length})
        </button>
        <button
          onClick={() => setFilter('completed')}
          style={{ fontWeight: filter === 'completed' ? 'bold' : 'normal' }}
        >
          Completed ({books.filter((b) => b.status === 'completed').length})
        </button>
      </div>

      {filteredBooks.length === 0 ? (
        <div style={{ padding: '24px 0', borderTop: '1px solid #eee' }}>
          <p>No books in this list yet.</p>
          <p>
            <Link to="/search">Find books to add &rarr;</Link>
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {filteredBooks.map((book) => {
            const coverSrc = book.coverUrl ? `http://localhost:3000${book.coverUrl}` : undefined;

            return (
              <div
                key={book.key}
                style={{
                  display: 'flex',
                  gap: '16px',
                  border: '1px solid #ddd',
                  padding: '12px',
                  borderRadius: '4px',
                }}
              >
                {coverSrc ? (
                  <img
                    src={coverSrc}
                    alt={book.title}
                    style={{ width: '80px', height: '110px', objectFit: 'cover' }}
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: '80px',
                      height: '110px',
                      backgroundColor: '#eee',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '11px',
                      textAlign: 'center',
                    }}
                  >
                    No Cover
                  </div>
                )}

                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: '0 0 6px 0' }}>
                    <Link to={`/book/${book.key}`}>{book.title}</Link>
                  </h3>
                  <p style={{ margin: '0 0 4px 0', color: '#555' }}>
                    Author(s): {book.authors.length > 0 ? book.authors.join(', ') : 'Unknown'}
                  </p>
                  {book.firstPublishYear && (
                    <p style={{ margin: '0 0 8px 0', fontSize: '0.85rem', color: '#777' }}>
                      Published: {book.firstPublishYear}
                    </p>
                  )}

                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                    <label style={{ fontSize: '0.9rem' }}>
                      Status:{' '}
                      <select
                        value={book.status}
                        onChange={(e) => updateStatus(book.key, e.target.value as ReadingStatus)}
                      >
                        <option value="want_to_read">Want to Read</option>
                        <option value="reading">Currently Reading</option>
                        <option value="completed">Completed</option>
                      </select>
                    </label>

                    <Link to={`/book/${book.key}`}>
                      <button>Details</button>
                    </Link>

                    {book.isReadable && (
                      <Link to={`/read/${book.key}`}>
                        <button style={{ backgroundColor: '#eef', fontWeight: 'bold' }}>
                          📖 Read Book
                        </button>
                      </Link>
                    )}

                    <button
                      onClick={() => removeBook(book.key)}
                      style={{ color: '#c00' }}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};


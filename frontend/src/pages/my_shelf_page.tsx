import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useShelfStore } from '../store/useShelfStore.ts';
import type { ReadingStatus } from '../types/index.ts';

export const MyShelfPage: React.FC = () => {
  const { books, removeBook, updateStatus } = useShelfStore();
  const [filter, setFilter] = useState<ReadingStatus | 'all'>('all');

  const filteredBooks = books.filter((b) => {
    if (filter === 'all') return true;
    return b.status === filter;
  });

  return (
    <div style={{ padding: '0 16px', maxWidth: '1200px', margin: '0 auto' }}>
      <h2>My Reading Shelf</h2>

      {/* Status Filter Tabs */}
      <div style={{ display: 'flex', gap: '8px', margin: '16px 0', flexWrap: 'wrap' }}>
        <button
          onClick={() => setFilter('all')}
          style={{ fontWeight: filter === 'all' ? 'bold' : 'normal', backgroundColor: filter === 'all' ? '#e0e0e0' : '#f7f7f7' }}
        >
          All ({books.length})
        </button>
        <button
          onClick={() => setFilter('reading')}
          style={{ fontWeight: filter === 'reading' ? 'bold' : 'normal', backgroundColor: filter === 'reading' ? '#e0e0e0' : '#f7f7f7' }}
        >
          Currently Reading ({books.filter((b) => b.status === 'reading').length})
        </button>
        <button
          onClick={() => setFilter('want_to_read')}
          style={{ fontWeight: filter === 'want_to_read' ? 'bold' : 'normal', backgroundColor: filter === 'want_to_read' ? '#e0e0e0' : '#f7f7f7' }}
        >
          Want to Read ({books.filter((b) => b.status === 'want_to_read').length})
        </button>
        <button
          onClick={() => setFilter('completed')}
          style={{ fontWeight: filter === 'completed' ? 'bold' : 'normal', backgroundColor: filter === 'completed' ? '#e0e0e0' : '#f7f7f7' }}
        >
          Completed ({books.filter((b) => b.status === 'completed').length})
        </button>
      </div>

      {filteredBooks.length === 0 ? (
        <div style={{ padding: '40px 16px', border: '1px dashed #ccc', borderRadius: '8px', textAlign: 'center', marginTop: '24px' }}>
          <span style={{ fontSize: '3rem' }}>📚</span>
          <h3>Your shelf is empty</h3>
          <p style={{ color: '#666', maxWidth: '400px', margin: '8px auto 16px auto' }}>
            Discover books from Open Library, preview scans, and save them to your shelf.
          </p>
          <Link to="/search">
            <button style={{ backgroundColor: '#1a73e8', color: '#fff', fontWeight: 'bold', padding: '8px 16px' }}>
              Explore Book Catalogs &rarr;
            </button>
          </Link>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
            gap: '20px',
            marginTop: '20px',
          }}
        >
          {filteredBooks.map((book) => {
            const coverSrc = book.coverUrl ? `http://localhost:3000${book.coverUrl}` : undefined;

            return (
              <div
                key={book.key}
                style={{
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  overflow: 'hidden',
                  backgroundColor: '#fff',
                  display: 'flex',
                  flexDirection: 'column',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                }}
              >
                {/* Book Cover */}
                <Link
                  to={`/book/${book.key}`}
                  style={{
                    display: 'block',
                    width: '100%',
                    height: '240px',
                    backgroundColor: '#eee',
                    position: 'relative',
                  }}
                >
                  {coverSrc ? (
                    <img
                      src={coverSrc}
                      alt={book.title}
                      loading="lazy"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
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
                        color: '#666',
                      }}
                    >
                      <span style={{ fontSize: '2rem' }}>📖</span>
                      <strong>{book.title}</strong>
                    </div>
                  )}

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
                      }}
                    >
                      📖 Read
                    </div>
                  )}
                </Link>

                {/* Details & Actions */}
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
                      }}
                      title={book.title}
                    >
                      {book.title}
                    </Link>
                    <p
                      style={{
                        fontSize: '0.8rem',
                        color: '#666',
                        margin: '0 0 8px 0',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {book.authors.length > 0 ? book.authors.join(', ') : 'Unknown'}
                    </p>
                  </div>

                  <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: '8px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <select
                      value={book.status}
                      onChange={(e) => updateStatus(book.key, e.target.value as ReadingStatus)}
                      style={{ fontSize: '0.8rem', width: '100%', padding: '4px' }}
                    >
                      <option value="want_to_read">Want to Read</option>
                      <option value="reading">Currently Reading</option>
                      <option value="completed">Completed</option>
                    </select>

                    <div style={{ display: 'flex', gap: '4px' }}>
                      {book.isReadable && (
                        <Link to={`/read/${book.key}`} style={{ flex: 1 }}>
                          <button style={{ width: '100%', fontSize: '0.75rem', backgroundColor: '#eef', fontWeight: 'bold' }}>
                            📖 Read
                          </button>
                        </Link>
                      )}
                      <button
                        onClick={() => removeBook(book.key)}
                        style={{ fontSize: '0.75rem', color: '#c00', flex: book.isReadable ? undefined : 1 }}
                      >
                        Remove
                      </button>
                    </div>
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

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

  const tabStyle = (active: boolean) => ({
    padding: '8px 16px',
    borderRadius: '6px',
    border: '1px solid',
    borderColor: active ? '#18181b' : '#e4e4e7',
    backgroundColor: active ? '#18181b' : '#f4f4f5',
    color: active ? '#fff' : '#18181b',
    fontWeight: active ? '700' : '500',
    fontSize: '0.9rem',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  });

  return (
    <div style={{ padding: '24px 20px 60px 20px', maxWidth: '1280px', margin: '0 auto' }}>
      <h2 style={{ fontSize: '1.4rem', fontWeight: '800', marginBottom: '16px' }}>My Reading Shelf</h2>

      {/* Status Filter Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
        <button onClick={() => setFilter('all')} style={tabStyle(filter === 'all')}>
          All ({books.length})
        </button>
        <button onClick={() => setFilter('reading')} style={tabStyle(filter === 'reading')}>
          Currently Reading ({books.filter((b) => b.status === 'reading').length})
        </button>
        <button onClick={() => setFilter('want_to_read')} style={tabStyle(filter === 'want_to_read')}>
          Want to Read ({books.filter((b) => b.status === 'want_to_read').length})
        </button>
        <button onClick={() => setFilter('completed')} style={tabStyle(filter === 'completed')}>
          Completed ({books.filter((b) => b.status === 'completed').length})
        </button>
      </div>

      {filteredBooks.length === 0 ? (
        <div style={{ padding: '48px 16px', border: '1px dashed #d4d4d8', borderRadius: '8px', textAlign: 'center', marginTop: '16px' }}>
          <span style={{ fontSize: '3rem' }}>📚</span>
          <h3 style={{ marginTop: '12px', fontSize: '1.2rem', fontWeight: '700' }}>Your shelf is empty</h3>
          <p style={{ color: '#71717a', maxWidth: '400px', margin: '8px auto 20px auto', fontSize: '0.92rem' }}>
            Discover books from Open Library, preview scans, and save them to your shelf.
          </p>
          <Link to="/">
            <button style={{ backgroundColor: '#18181b', color: '#fff', fontWeight: '600', padding: '10px 20px', borderRadius: '6px', border: 'none', cursor: 'pointer' }}>
              Explore Book Catalogs &rarr;
            </button>
          </Link>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
            gap: '24px',
            marginTop: '16px',
          }}
        >
          {filteredBooks.map((book) => {
            const coverSrc = book.coverUrl ? `http://localhost:3000${book.coverUrl}` : undefined;

            return (
              <div
                key={book.key}
                style={{
                  border: '1px solid #e4e4e7',
                  borderRadius: '6px',
                  overflow: 'hidden',
                  backgroundColor: '#fff',
                  display: 'flex',
                  flexDirection: 'column',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.04)',
                }}
              >
                {/* Book Cover */}
                <Link
                  to={`/book/${book.key}`}
                  style={{
                    display: 'block',
                    width: '100%',
                    height: '240px',
                    backgroundColor: '#f4f4f5',
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
                        color: '#71717a',
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
                        backgroundColor: '#18181b',
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
                <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between' }}>
                  <div>
                    <Link
                      to={`/book/${book.key}`}
                      style={{
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        fontSize: '0.92rem',
                        fontWeight: '600',
                        color: '#18181b',
                        margin: '0 0 4px 0',
                        lineHeight: '1.25',
                      }}
                      title={book.title}
                    >
                      {book.title}
                    </Link>
                    <p
                      style={{
                        fontSize: '0.78rem',
                        color: '#71717a',
                        margin: '0 0 8px 0',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {book.authors.length > 0 ? book.authors.join(', ') : 'Unknown'}
                    </p>
                  </div>

                  <div style={{ borderTop: '1px solid #f4f4f5', paddingTop: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <select
                      value={book.status}
                      onChange={(e) => updateStatus(book.key, e.target.value as ReadingStatus)}
                      style={{ fontSize: '0.82rem', width: '100%', padding: '6px', borderRadius: '4px', border: '1px solid #d4d4d8' }}
                    >
                      <option value="want_to_read">Want to Read</option>
                      <option value="reading">Currently Reading</option>
                      <option value="completed">Completed</option>
                    </select>

                    <div style={{ display: 'flex', gap: '6px' }}>
                      {book.isReadable && (
                        <Link to={`/read/${book.key}`} style={{ flex: 1 }}>
                          <button style={{ width: '100%', fontSize: '0.78rem', backgroundColor: '#18181b', color: '#fff', fontWeight: '600', padding: '6px', borderRadius: '4px', border: 'none', cursor: 'pointer' }}>
                            Read
                          </button>
                        </Link>
                      )}
                      <button
                        onClick={() => removeBook(book.key)}
                        style={{ fontSize: '0.78rem', color: '#71717a', border: '1px solid #e4e4e7', background: '#fff', padding: '6px 10px', borderRadius: '4px', cursor: 'pointer', flex: book.isReadable ? undefined : 1 }}
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

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Trash2 } from 'lucide-react';
import { useShelfStore } from '../store/useShelfStore.ts';
import { BookCard } from '../components/BookCard.tsx';
import type { ReadingStatus } from '../types/index.ts';

const STATUS_TABS: Array<{ id: ReadingStatus | 'all'; label: string }> = [
  { id: 'all', label: 'All' },
  { id: 'reading', label: 'Currently Reading' },
  { id: 'want_to_read', label: 'Want to Read' },
  { id: 'completed', label: 'Completed' },
];

export const MyShelfPage: React.FC = () => {
  const { books, removeBook, updateStatus } = useShelfStore();
  const [filter, setFilter] = useState<ReadingStatus | 'all'>('all');

  const filteredBooks = books.filter((b) => {
    if (filter === 'all') return true;
    return b.status === filter;
  });

  const getCount = (statusId: ReadingStatus | 'all') => {
    if (statusId === 'all') return books.length;
    return books.filter((b) => b.status === statusId).length;
  };

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '24px 20px 60px 20px' }}>
      {/* Header matching DiscoverPage */}
      <div style={{ marginBottom: '20px' }}>
        <h2 style={{ fontSize: '1.4rem', fontWeight: '800', margin: 0, letterSpacing: '-0.3px' }}>
          My Reading Shelf
        </h2>
        <p style={{ color: '#71717a', margin: '4px 0 0 0', fontSize: '0.9rem' }}>
          {books.length} {books.length === 1 ? 'book' : 'books'} saved in your library
        </p>
      </div>

      {/* Filter Pills matching DiscoverPage & CatalogsPage */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          overflowX: 'auto',
          marginBottom: '28px',
          paddingBottom: '4px',
        }}
        className="hide-scrollbar"
      >
        {STATUS_TABS.map((tab) => {
          const isActive = filter === tab.id;
          const count = getCount(tab.id);

          return (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              style={{
                padding: '6px 14px',
                borderRadius: '999px',
                border: isActive ? '1px solid #18181b' : '1px solid #e4e4e7',
                backgroundColor: isActive ? '#18181b' : '#ffffff',
                color: isActive ? '#ffffff' : '#52525b',
                fontSize: '0.84rem',
                fontWeight: '600',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <span>{tab.label}</span>
              <span
                style={{
                  fontSize: '0.74rem',
                  padding: '1px 6px',
                  borderRadius: '999px',
                  backgroundColor: isActive ? '#27272a' : '#f4f4f5',
                  color: isActive ? '#ffffff' : '#71717a',
                }}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Books Grid */}
      {filteredBooks.length === 0 ? (
        <div style={{ padding: '60px 0', textAlign: 'center', color: '#71717a' }}>
          <p style={{ fontSize: '1rem', fontWeight: '600', color: '#18181b', margin: '0 0 6px 0' }}>
            {filter === 'all'
              ? 'Your reading shelf is empty'
              : `No books currently marked as "${STATUS_TABS.find((t) => t.id === filter)?.label}".`}
          </p>
          <p style={{ fontSize: '0.88rem', margin: '0 0 20px 0' }}>
            Browse catalogs or search books to add them to your shelf.
          </p>
          <Link
            to="/catalogs"
            style={{
              display: 'inline-block',
              backgroundColor: '#18181b',
              color: '#ffffff',
              fontWeight: '600',
              fontSize: '0.88rem',
              padding: '9px 18px',
              borderRadius: '6px',
              textDecoration: 'none',
            }}
          >
            Explore Catalogs &rarr;
          </Link>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
            gap: '28px 18px',
          }}
        >
          {filteredBooks.map((book) => (
            <BookCard
              key={book.key}
              book={book}
              footer={
                <div
                  style={{
                    marginTop: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <select
                    value={book.status}
                    onChange={(e) => updateStatus(book.key, e.target.value as ReadingStatus)}
                    style={{
                      flex: 1,
                      fontSize: '0.74rem',
                      fontWeight: '600',
                      color: '#18181b',
                      backgroundColor: '#f4f4f5',
                      border: '1px solid #e4e4e7',
                      borderRadius: '4px',
                      padding: '5px 6px',
                      cursor: 'pointer',
                      outline: 'none',
                    }}
                  >
                    <option value="want_to_read">Want to Read</option>
                    <option value="reading">Reading</option>
                    <option value="completed">Completed</option>
                  </select>

                  <button
                    onClick={() => removeBook(book.key)}
                    style={{
                      background: 'none',
                      border: '1px solid #e4e4e7',
                      borderRadius: '4px',
                      color: '#71717a',
                      cursor: 'pointer',
                      padding: '5px 7px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.15s ease',
                    }}
                    title="Remove from shelf"
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = '#fca5a5';
                      e.currentTarget.style.color = '#ef4444';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = '#e4e4e7';
                      e.currentTarget.style.color = '#71717a';
                    }}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              }
            />
          ))}
        </div>
      )}
    </div>
  );
};

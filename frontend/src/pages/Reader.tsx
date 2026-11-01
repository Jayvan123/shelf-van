import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useBookDetail } from '../api/hooks.ts';

export const Reader: React.FC = () => {
  const { key } = useParams<{ key: string }>();
  const { data: book, isLoading, isError, error } = useBookDetail(key);

  if (isLoading) {
    return (
      <div style={{ padding: '24px 16px' }}>
        <p>Loading reading scan from Internet Archive via ShelfVan...</p>
      </div>
    );
  }

  if (isError || !book) {
    return (
      <div style={{ padding: '24px 16px' }}>
        <p style={{ color: '#c00' }}>
          Error: {error instanceof Error ? error.message : 'Failed to load reader.'}
        </p>
        <Link to="/">&larr; Back to Shelf</Link>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', margin: 0, padding: 0 }}>
      {/* Reader Control Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '8px 16px',
          backgroundColor: '#222',
          color: '#fff',
          fontSize: '0.9rem',
        }}
      >
        <div>
          <strong>Reading:</strong> {book.title}{' '}
          <span style={{ color: '#aaa', fontSize: '0.8rem' }}>
            ({book.authors.length > 0 ? book.authors.join(', ') : 'Unknown Author'})
          </span>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <Link to={`/book/${book.key}`} style={{ color: '#64b5f6' }}>
            &larr; Book Details
          </Link>
          <Link to="/" style={{ color: '#64b5f6' }}>
            My Shelf
          </Link>
        </div>
      </div>

      {/* Reader Frame or Fallback */}
      <div style={{ flex: 1, backgroundColor: '#111' }}>
        {book.isReadable && book.readerUrl ? (
          <iframe
            src={book.readerUrl}
            title={book.title}
            width="100%"
            height="100%"
            style={{ border: 0, width: '100%', height: 'calc(100vh - 40px)' }}
            allow="fullscreen"
          />
        ) : (
          <div
            style={{
              padding: '48px 16px',
              textAlign: 'center',
              color: '#ddd',
              maxWidth: '600px',
              margin: '0 auto',
            }}
          >
            <h3>Digital Scan Not Available</h3>
            <p style={{ color: '#aaa', lineHeight: '1.6' }}>
              Internet Archive does not have an open public-domain scan for this specific title (many modern copyrighted books are restricted to physical libraries or 1-hour waitlist borrowing).
            </p>
            {book.previewUrl && (
              <p style={{ margin: '16px 0' }}>
                <a
                  href={book.previewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: '#64b5f6', textDecoration: 'underline' }}
                >
                  Check lending status on Open Library &rarr;
                </a>
              </p>
            )}

            <div style={{ marginTop: '24px', padding: '16px', border: '1px solid #333', borderRadius: '6px', textAlign: 'left' }}>
              <strong style={{ color: '#fff' }}>Want to test the Reader?</strong>
              <p style={{ color: '#888', margin: '8px 0 12px 0', fontSize: '0.9rem' }}>
                Try one of these public-domain classics with 100% full-text scans:
              </p>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <Link to="/search">
                  <button style={{ fontSize: '0.85rem' }}>Browse Catalogs &rarr;</button>
                </Link>
              </div>
            </div>

            <p style={{ marginTop: '24px' }}>
              <Link to={`/book/${book.key}`} style={{ color: '#64b5f6' }}>
                &larr; Return to Book Details
              </Link>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};


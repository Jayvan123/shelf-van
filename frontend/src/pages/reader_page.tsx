import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, ExternalLink, RotateCcw, BookOpen } from 'lucide-react';
import { useBookDetail } from '../api/hooks.ts';

export const ReaderPage: React.FC = () => {
  const { key } = useParams<{ key: string }>();
  const { data: book, isLoading, isError, error } = useBookDetail(key);
  const [viewMode, setViewMode] = useState<'2up' | '1up'>('2up');
  const [reloadKey, setReloadKey] = useState(0);

  if (isLoading) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          backgroundColor: '#18181b',
          color: '#ffffff',
        }}
      >
        <BookOpen size={36} style={{ opacity: 0.6, marginBottom: '16px' }} />
        <p style={{ fontSize: '1rem', fontWeight: '600' }}>Loading reader...</p>
        <span style={{ fontSize: '0.82rem', color: '#71717a' }}>Preparing pages from Open Library & Archive.org</span>
      </div>
    );
  }

  if (isError || !book) {
    return (
      <div style={{ padding: '48px 20px', maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
        <p style={{ color: '#ef4444', fontWeight: '600', marginBottom: '16px' }}>
          {error instanceof Error ? error.message : 'Failed to load reader.'}
        </p>
        <Link to="/" style={{ color: '#2563eb', textDecoration: 'none', fontWeight: '600' }}>
          &larr; Back to My Shelf
        </Link>
      </div>
    );
  }

  // Construct active reader embed URL starting at page 1
  const readerSrc = book.iaId
    ? `https://archive.org/embed/${encodeURIComponent(book.iaId)}?ui=embed#page/n0/mode/${viewMode}`
    : book.readerUrl;

  const handleRestart = () => {
    setReloadKey((prev) => prev + 1);
  };

  const gutenbergUrl = `https://www.gutenberg.org/ebooks/search/?query=${encodeURIComponent(book.title)}`;
  const archiveDetailsUrl = book.iaId
    ? `https://archive.org/details/${encodeURIComponent(book.iaId)}`
    : undefined;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        margin: 0,
        padding: 0,
        backgroundColor: '#09090b',
        color: '#ffffff',
        overflow: 'hidden',
      }}
    >
      {/* Reader Control Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '10px 16px',
          backgroundColor: '#18181b',
          borderBottom: '1px solid #27272a',
          fontSize: '0.88rem',
          flexWrap: 'wrap',
          gap: '10px',
          zIndex: 20,
        }}
      >
        {/* Left: Back & Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
          <Link
            to={`/book/${book.key}`}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              color: '#d4d4d8',
              textDecoration: 'none',
              fontSize: '0.84rem',
              fontWeight: '600',
              padding: '5px 10px',
              borderRadius: '8px',
              backgroundColor: '#27272a',
              transition: 'background-color 0.15s ease',
            }}
            title="Back to Book Details"
          >
            <ArrowLeft size={15} />
            <span>Details</span>
          </Link>

          <div style={{ minWidth: 0 }}>
            <p
              style={{
                margin: 0,
                fontWeight: '700',
                fontSize: '0.92rem',
                color: '#ffffff',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                maxWidth: '380px',
              }}
              title={book.title}
            >
              {book.title}
            </p>
            <span style={{ color: '#a1a1aa', fontSize: '0.78rem' }}>
              {book.authors.length > 0 ? book.authors.join(', ') : 'Unknown Author'}
            </span>
          </div>
        </div>

        {/* Center: Controls (Restart & Mode Toggle) */}
        {readerSrc && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={handleRestart}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '6px 12px',
                borderRadius: '8px',
                border: '1px solid #3f3f46',
                backgroundColor: '#27272a',
                color: '#ffffff',
                fontSize: '0.8rem',
                fontWeight: '600',
                cursor: 'pointer',
              }}
              title="Reload and restart reader at Page 1"
            >
              <RotateCcw size={13} />
              <span>Page 1</span>
            </button>

            {book.iaId && (
              <div
                style={{
                  display: 'inline-flex',
                  backgroundColor: '#27272a',
                  padding: '2px',
                  borderRadius: '8px',
                  border: '1px solid #3f3f46',
                }}
              >
                <button
                  onClick={() => setViewMode('2up')}
                  style={{
                    padding: '4px 10px',
                    borderRadius: '6px',
                    border: 'none',
                    backgroundColor: viewMode === '2up' ? '#3f3f46' : 'transparent',
                    color: viewMode === '2up' ? '#ffffff' : '#a1a1aa',
                    fontSize: '0.76rem',
                    fontWeight: viewMode === '2up' ? '700' : '500',
                    cursor: 'pointer',
                  }}
                  title="2-page book spread"
                >
                  2 Pages
                </button>
                <button
                  onClick={() => setViewMode('1up')}
                  style={{
                    padding: '4px 10px',
                    borderRadius: '6px',
                    border: 'none',
                    backgroundColor: viewMode === '1up' ? '#3f3f46' : 'transparent',
                    color: viewMode === '1up' ? '#ffffff' : '#a1a1aa',
                    fontSize: '0.76rem',
                    fontWeight: viewMode === '1up' ? '700' : '500',
                    cursor: 'pointer',
                  }}
                  title="Single page view"
                >
                  1 Page
                </button>
              </div>
            )}
          </div>
        )}

        {/* Right: Unlock / External Readers */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {archiveDetailsUrl && (
            <a
              href={archiveDetailsUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                backgroundColor: '#2563eb',
                color: '#ffffff',
                padding: '6px 14px',
                borderRadius: '8px',
                textDecoration: 'none',
                fontWeight: '600',
                fontSize: '0.82rem',
                boxShadow: '0 2px 6px rgba(37, 99, 235, 0.3)',
              }}
              title="Open full reader on Archive.org"
            >
              <span>Archive.org</span>
              <ExternalLink size={13} />
            </a>
          )}

          <a
            href={gutenbergUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              backgroundColor: '#27272a',
              color: '#d4d4d8',
              padding: '6px 12px',
              borderRadius: '8px',
              textDecoration: 'none',
              fontWeight: '500',
              fontSize: '0.8rem',
              border: '1px solid #3f3f46',
            }}
            title="Read free full text on Project Gutenberg"
          >
            <span>Gutenberg</span>
            <ExternalLink size={12} />
          </a>

          <Link
            to="/"
            style={{
              color: '#a1a1aa',
              padding: '6px 10px',
              textDecoration: 'none',
              fontWeight: '500',
              fontSize: '0.82rem',
            }}
          >
            My Shelf
          </Link>
        </div>
      </div>

      {/* Reader Frame */}
      <div style={{ flex: 1, backgroundColor: '#000000', position: 'relative' }}>
        {readerSrc ? (
          <iframe
            key={`${readerSrc}-${reloadKey}`}
            src={readerSrc}
            title={book.title}
            width="100%"
            height="100%"
            style={{ border: 0, width: '100%', height: '100%', display: 'block' }}
            allow="fullscreen; clipboard-read; clipboard-write"
          />
        ) : (
          <div
            style={{
              padding: '60px 20px',
              textAlign: 'center',
              color: '#d4d4d8',
              maxWidth: '620px',
              margin: '0 auto',
            }}
          >
            <BookOpen size={48} style={{ opacity: 0.4, marginBottom: '16px' }} />
            <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#ffffff', margin: '0 0 10px 0' }}>
              Digital Scan Not Directly Embeddable
            </h3>
            <p style={{ color: '#a1a1aa', lineHeight: '1.6', fontSize: '0.9rem' }}>
              {book.provider === 'googlebooks'
                ? 'This title does not provide an open iframe preview from Google Books.'
                : 'This book scan is managed under physical library archives.'}
            </p>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginTop: '24px', flexWrap: 'wrap' }}>
              {book.previewUrl && (
                <a
                  href={book.previewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    backgroundColor: '#ffffff',
                    color: '#18181b',
                    fontWeight: '700',
                    fontSize: '0.86rem',
                    padding: '10px 22px',
                    borderRadius: '9999px',
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  Open on {book.provider === 'googlebooks' ? 'Google Books' : 'Open Library'}
                  <ExternalLink size={14} />
                </a>
              )}

              <a
                href={gutenbergUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  backgroundColor: '#27272a',
                  color: '#ffffff',
                  fontWeight: '600',
                  fontSize: '0.86rem',
                  padding: '10px 22px',
                  borderRadius: '9999px',
                  textDecoration: 'none',
                  border: '1px solid #3f3f46',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                Search Project Gutenberg
                <ExternalLink size={14} />
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

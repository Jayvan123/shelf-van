import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen } from 'lucide-react';
import { useSubjectBooks } from '../api/hooks.ts';

const CURATED_FEATURED = [
  { key: 'OL45804W', title: 'The Great Gatsby', author: 'F. Scott Fitzgerald', coverId: 12345 },
  { key: 'OL12345W', title: "Alice's Adventures in Wonderland", author: 'Lewis Carroll', coverId: 67890 },
  { key: 'OL66554W', title: 'Pride and Prejudice', author: 'Jane Austen', coverId: 11223 },
  { key: 'OL450063W', title: 'Frankenstein', author: 'Mary Shelley', coverId: 44556 },
  { key: 'OL262423W', title: 'The Adventures of Sherlock Holmes', author: 'Arthur Conan Doyle', coverId: 77889 },
];

export const FeaturedBanner: React.FC = () => {
  const navigate = useNavigate();
  const { data } = useSubjectBooks('classic_literature', 1);

  // Take first 5 books from API, or fallback to curated list
  const bannerBooks = data && data.books.length > 0 ? data.books.slice(0, 5) : CURATED_FEATURED;

  const handleRandomPick = () => {
    if (bannerBooks.length > 0) {
      const randomIndex = Math.floor(Math.random() * bannerBooks.length);
      const chosen = bannerBooks[randomIndex];
      if (chosen) {
        navigate(`/book/${chosen.key}`);
      }
    }
  };

  return (
    <div
      style={{
        borderRadius: '24px',
        background: 'linear-gradient(135deg, #18181b 0%, #27272a 60%, #1e1e24 100%)',
        color: '#ffffff',
        padding: '36px 32px',
        marginBottom: '40px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '28px',
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Subtle background glow effect */}
      <div
        style={{
          position: 'absolute',
          right: '-50px',
          top: '-50px',
          width: '350px',
          height: '350px',
          background: 'radial-gradient(circle, rgba(255, 255, 255, 0.05) 0%, rgba(0,0,0,0) 70%)',
          pointerEvents: 'none',
        }}
      />

      {/* Left Text Content */}
      <div style={{ flex: '1 1 340px', zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          
          <span
            style={{
              fontSize: '0.82rem',
              fontWeight: '700',
              letterSpacing: '1.5px',
              textTransform: 'uppercase',
              color: '#d4d4d8',
            }}
          >
            Featured Spotlight
          </span>
        </div>

        <h2
          style={{
            fontSize: '2.1rem',
            fontWeight: '900',
            letterSpacing: '-0.8px',
            lineHeight: '1.15',
            margin: '0 0 14px 0',
            textTransform: 'uppercase',
          }}
        >
          Everyone's Reading RN
        </h2>

        <div style={{ width: '48px', height: '3px', backgroundColor: '#52525b', marginBottom: '14px' }} />

        <p style={{ fontSize: '1rem', color: '#a1a1aa', margin: '0 0 24px 0', maxWidth: '440px', lineHeight: '1.5' }}>
          Explore iconic literature and full digital scans preserved by the Open Library & Internet Archive.
        </p>

        {/* Buttons */}
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button
            onClick={handleRandomPick}
            style={{
              backgroundColor: '#ffffff',
              color: '#18181b',
              border: 'none',
              padding: '11px 24px',
              borderRadius: '9999px',
              fontWeight: '700',
              fontSize: '0.9rem',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
              transition: 'transform 0.15s ease',
            }}
          >
            <BookOpen size={16} />
            Suggest Random Book
          </button>

          <Link to="/catalogs">
            <button
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                color: '#ffffff',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                padding: '11px 22px',
                borderRadius: '9999px',
                fontWeight: '600',
                fontSize: '0.9rem',
                cursor: 'pointer',
                backdropFilter: 'blur(4px)',
              }}
            >
              Browse All Catalogs
            </button>
          </Link>
        </div>
      </div>

      {/* Right Book Covers Showcase */}
      <div
        style={{
          display: 'flex',
          gap: '14px',
          alignItems: 'center',
          overflowX: 'auto',
          padding: '6px 2px 10px 2px',
          maxWidth: '100%',
          zIndex: 10,
        }}
        className="hide-scrollbar"
      >
        {bannerBooks.map((book, index) => {
          const coverSrc =
            'coverUrl' in book && book.coverUrl
              ? (book.coverUrl.startsWith('http') ? book.coverUrl : `http://localhost:3000${book.coverUrl}`)
              : undefined;

          return (
            <Link
              key={book.key || index}
              to={`/book/${book.key}`}
              style={{
                display: 'block',
                flex: '0 0 115px',
                width: '115px',
                height: '170px',
                borderRadius: '12px',
                overflow: 'hidden',
                boxShadow: '0 8px 18px rgba(0, 0, 0, 0.4)',
                backgroundColor: '#27272a',
                position: 'relative',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.transform = 'translateY(-6px) scale(1.03)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.transform = 'translateY(0) scale(1)';
              }}
              title={book.title}
            >
              {coverSrc ? (
                <img
                  src={coverSrc}
                  alt={book.title}
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
                    padding: '8px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    textAlign: 'center',
                    color: '#a1a1aa',
                    fontSize: '0.72rem',
                    backgroundColor: '#27272a',
                  }}
                >
                  <BookOpen size={20} style={{ opacity: 0.5, marginBottom: '4px' }} />
                  <span
                    style={{
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      fontWeight: 'bold',
                      color: '#ffffff',
                    }}
                  >
                    {book.title}
                  </span>
                </div>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
};

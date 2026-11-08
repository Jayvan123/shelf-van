import React, { useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Check,
  Plus,
  Eye,
  Star,
  List,
  ChevronRight,
  BookOpen,
  ExternalLink,
} from 'lucide-react';
import { useBookDetail, useSubjectBooks } from '../api/hooks.ts';
import { useShelfStore } from '../store/useShelfStore.ts';
import { resolveCoverUrl } from '../api/client.ts';
import type { ReadingStatus } from '../types/index.ts';

interface RecItem {
  key: string;
  title: string;
  author: string;
  description: string;
  coverUrl?: string;
  parts: string;
  rating?: string;
}

const FALLBACK_RECS: RecItem[] = [
  {
    key: 'gb_her_reborn',
    title: 'HER REBORN',
    author: 'Aria Thorne',
    description: 'MAJOR EDITING! WARNING: MATURITY AHEAD, BE MINDFUL. When a police officer wants justice for her adopted sister, dark secrets unravel...',
    coverUrl: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=300&q=80',
    parts: '31 parts • Complete',
    rating: '4.9',
  },
  {
    key: 'gb_mafia_boss',
    title: "I Woke Up as the Mafia Boss's Rejected Wife",
    author: 'Elena Vance',
    description: 'I was just a normal college girl—reckless, loud, and a little bit of a troublemaker. But everything changed the moment I saved a mysterious stranger...',
    coverUrl: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=300&q=80',
    parts: '36 parts • Complete',
    rating: '4.8',
  },
  {
    key: 'gb_villainess_trying',
    title: 'VILLAINESS IS JUST TRYING TO SURVIVE',
    author: 'K. M. Sterling',
    description: 'Reincarnated into the royal court as the doomed villainess, she has only one urgent goal: dodge the guillotine and live peacefully in the countryside...',
    coverUrl: 'https://images.unsplash.com/photo-1532012164546-f432f2e3777f?auto=format&fit=crop&w=300&q=80',
    parts: '48 parts • Ongoing',
    rating: '4.7',
  },
  {
    key: 'gb_villainess_sister',
    title: 'THE SISTER OF THE TYRANT EMPEROR',
    author: 'MoonlightInk',
    description: 'To protect her imperial bloodline, she must tame the cruel emperor before the fated prophesy unfolds to steal his kingdom...',
    coverUrl: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&w=300&q=80',
    parts: '52 parts • Complete',
    rating: '4.9',
  },
  {
    key: 'OL45804W',
    title: 'THE GREAT GATSBY',
    author: 'F. Scott Fitzgerald',
    description: 'The story of the fabulously wealthy Jay Gatsby and his mysterious love for the beautiful Daisy Buchanan during the Roaring Twenties...',
    coverUrl: 'https://covers.openlibrary.org/b/id/8432047-M.jpg',
    parts: '9 parts • Complete',
    rating: '4.8',
  },
  {
    key: 'OL66554W',
    title: 'PRIDE AND PREJUDICE',
    author: 'Jane Austen',
    description: 'A turbulent, witty relationship between Elizabeth Bennet and the enigmatic Mr. Darcy in early 19th-century England...',
    coverUrl: 'https://covers.openlibrary.org/b/id/8231856-M.jpg',
    parts: '61 parts • Complete',
    rating: '4.9',
  },
  {
    key: 'OL7222246M',
    title: '1984',
    author: 'George Orwell',
    description: 'A dystopian masterpiece about Winston Smith, totalitarian surveillance, Big Brother, and the battle for the human mind...',
    coverUrl: 'https://covers.openlibrary.org/b/id/7222246-M.jpg',
    parts: '24 parts • Complete',
    rating: '4.8',
  },
  {
    key: 'OL9259256M',
    title: 'DUNE',
    author: 'Frank Herbert',
    description: 'Set on the desert planet Arrakis, young Paul Atreides navigates prophecy, spice melange, and galactic political betrayal...',
    coverUrl: 'https://covers.openlibrary.org/b/id/9259256-M.jpg',
    parts: '38 parts • Complete',
    rating: '4.9',
  },
];

function getDeterministicStats(key: string, pageCount?: number) {
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    hash = (hash * 31 + key.charCodeAt(i)) & 0xffffffff;
  }
  const abs = Math.abs(hash);
  const views = `${((abs % 450) + 50)}K`;
  const rating = `${((abs % 15) / 10 + 3.5).toFixed(1)}K`;
  const parts = pageCount ? `${Math.ceil(pageCount / 8)} parts` : `${(abs % 40) + 12} parts`;
  const readingTime = pageCount ? `${Math.ceil((pageCount * 1.5) / 60)}h ${Math.ceil((pageCount * 1.5) % 60)}m` : '5h 30m';
  return { views, rating, parts, readingTime };
}

export const BookDetailPage: React.FC = () => {
  const { key } = useParams<{ key: string }>();

  const { data: book, isLoading, isError, error } = useBookDetail(key);
  const { addOrUpdateBook, getBook, removeBook } = useShelfStore();

  const [activeTab, setActiveTab] = useState<'summary' | 'parts'>('summary');
  const [isDescExpanded, setIsDescExpanded] = useState(false);
  const [showStatusMenu, setShowStatusMenu] = useState(false);

  const recScrollRef = useRef<HTMLDivElement>(null);

  const shelfEntry = key ? getBook(key) : undefined;
  const [selectedStatus, setSelectedStatus] = useState<ReadingStatus>(
    shelfEntry?.status || 'want_to_read'
  );

  // Recommendations query based on primary genre
  const primarySubject = book?.subjects?.[0]?.toLowerCase().replace(/\s+/g, '_') || 'romance';
  const { data: recData } = useSubjectBooks(primarySubject, 1);

  // Combine recommendations
  const recommendations: RecItem[] = React.useMemo(() => {
    const list: RecItem[] = [];
    if (recData?.books) {
      for (const b of recData.books) {
        if (b.key !== key) {
          const stats = getDeterministicStats(b.key);
          list.push({
            key: b.key,
            title: b.title,
            author: b.authors[0] || 'Unknown Author',
            description: `${b.title} by ${b.authors[0] || 'Author'}. Explore this trending title on ShelfVan.`,
            coverUrl: b.coverUrl,
            parts: stats.parts,
            rating: stats.rating,
          });
        }
      }
    }
    // Fill with fallback items
    for (const fb of FALLBACK_RECS) {
      if (fb.key !== key && !list.some((item) => item.key === fb.key)) {
        list.push(fb);
      }
    }
    return list;
  }, [recData, key]);

  if (isLoading) {
    return (
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '60px 20px', textAlign: 'center', color: '#71717a' }}>
        <p style={{ fontSize: '1rem' }}>Loading book details...</p>
      </div>
    );
  }

  if (isError || !book) {
    return (
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '60px 20px', textAlign: 'center' }}>
        <p style={{ color: '#dc2626', marginBottom: '16px', fontSize: '0.95rem' }}>
          {error instanceof Error ? error.message : 'Unable to load book details.'}
        </p>
        <Link to="/" style={{ color: '#18181b', fontWeight: '600', textDecoration: 'underline' }}>
          Return to My Shelf
        </Link>
      </div>
    );
  }

  const coverSrc = resolveCoverUrl(book.coverUrl);

  const stats = getDeterministicStats(book.key, book.pageCount);
  const primaryAuthor = book.authors[0] || 'Unknown Author';
  const authorInitial = primaryAuthor.charAt(0).toUpperCase() || 'A';

  const handleToggleShelf = () => {
    if (shelfEntry) {
      removeBook(book.key);
    } else {
      addOrUpdateBook(book, selectedStatus);
    }
  };

  const handleStatusSelect = (status: ReadingStatus) => {
    setSelectedStatus(status);
    addOrUpdateBook(book, status);
    setShowStatusMenu(false);
  };

  const scrollRecs = (offset: number) => {
    if (recScrollRef.current) {
      recScrollRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  const descriptionText = book.description || 'No detailed synopsis available for this title yet. Read or preview this book using the links above.';
  const shouldTruncate = descriptionText.length > 220;

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 20px 80px 20px' }}>
      {/* Top Hero Section matching Wattpad / Modern Reader layout */}
      <div style={{ display: 'flex', gap: '32px', alignItems: 'flex-start', flexWrap: 'wrap', marginBottom: '40px' }}>
        {/* Left Book Cover */}
        <div style={{ width: '190px', maxWidth: '100%', flexShrink: 0 }}>
          <div
            style={{
              width: '190px',
              height: '275px',
              borderRadius: '16px',
              overflow: 'hidden',
              boxShadow: '0 10px 25px rgba(0,0,0,0.22)',
              backgroundColor: '#18181b',
              position: 'relative',
            }}
          >
            {coverSrc ? (
              <img
                src={coverSrc}
                alt={book.title}
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
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
                  padding: '16px',
                  textAlign: 'center',
                  color: '#e4e4e7',
                }}
              >
                <BookOpen size={36} style={{ marginBottom: '12px', opacity: 0.6 }} />
                <span style={{ fontSize: '0.9rem', fontWeight: 'bold', lineHeight: '1.3' }}>{book.title}</span>
              </div>
            )}
          </div>
        </div>

        {/* Right Info & Actions */}
        <div style={{ flex: 1, minWidth: '280px', display: 'flex', flexDirection: 'column' }}>
          {/* Title */}
          <h1
            style={{
              fontSize: '2.1rem',
              fontWeight: '800',
              lineHeight: '1.2',
              letterSpacing: '-0.5px',
              color: '#18181b',
              margin: '0 0 14px 0',
            }}
          >
            {book.title}
          </h1>

          {/* Author with Avatar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: '#18181b',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.85rem',
                fontWeight: '700',
              }}
            >
              {authorInitial}
            </div>
            <span style={{ fontSize: '0.95rem', fontWeight: '600', color: '#18181b' }}>
              {primaryAuthor}
            </span>
          </div>

          {/* Stats Bar (Views • Stars • Parts) */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '20px',
              fontSize: '0.86rem',
              color: '#52525b',
              marginBottom: '28px',
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Eye size={15} style={{ color: '#71717a' }} />
              <strong style={{ color: '#18181b', fontWeight: '600' }}>{stats.views}</strong>
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Star size={15} style={{ color: '#71717a' }} />
              <strong style={{ color: '#18181b', fontWeight: '600' }}>{stats.rating}</strong>
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <List size={15} style={{ color: '#71717a' }} />
              <strong style={{ color: '#18181b', fontWeight: '600' }}>{stats.parts}</strong>
            </span>
          </div>

          {/* Action Row: [Start reading]  (+) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', position: 'relative' }}>
            {book.isReadable || book.readerUrl ? (
              <Link
                to={`/read/${book.key}`}
                style={{
                  backgroundColor: '#18181b',
                  color: '#ffffff',
                  fontSize: '0.92rem',
                  fontWeight: '700',
                  padding: '12px 36px',
                  borderRadius: '999px',
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'background-color 0.15s ease',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                }}
              >
                Start reading
              </Link>
            ) : book.previewUrl ? (
              <a
                href={book.previewUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  backgroundColor: '#18181b',
                  color: '#ffffff',
                  fontSize: '0.92rem',
                  fontWeight: '700',
                  padding: '12px 36px',
                  borderRadius: '999px',
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                }}
              >
                Start reading
                <ExternalLink size={14} />
              </a>
            ) : (
              <button
                disabled
                style={{
                  backgroundColor: '#e4e4e7',
                  color: '#a1a1aa',
                  fontSize: '0.92rem',
                  fontWeight: '700',
                  padding: '12px 36px',
                  borderRadius: '999px',
                  border: 'none',
                  cursor: 'not-allowed',
                }}
              >
                Start reading
              </button>
            )}

            {/* Quick Add (+) Circle Button */}
            <div style={{ position: 'relative' }}>
              <button
                type="button"
                onClick={handleToggleShelf}
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '50%',
                  border: shelfEntry ? '1.5px solid #18181b' : '1.5px solid #d4d4d8',
                  backgroundColor: shelfEntry ? '#18181b' : '#ffffff',
                  color: shelfEntry ? '#ffffff' : '#18181b',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
                title={shelfEntry ? 'In Shelf (Click to remove)' : 'Add to Shelf'}
              >
                {shelfEntry ? <Check size={20} /> : <Plus size={22} />}
              </button>
            </div>

            {/* Shelf Status Changer */}
            <div style={{ display: 'inline-flex', alignItems: 'center', marginLeft: '6px' }}>
              <button
                onClick={() => setShowStatusMenu(!showStatusMenu)}
                style={{
                  background: 'none',
                  border: '1px solid #e4e4e7',
                  borderRadius: '9999px',
                  padding: '9px 18px',
                  fontSize: '0.84rem',
                  fontWeight: '600',
                  color: '#52525b',
                  cursor: 'pointer',
                }}
              >
                {shelfEntry ? (selectedStatus === 'reading' ? 'Reading' : selectedStatus === 'completed' ? 'Completed' : 'Want to Read') : 'Shelf status'} &or;
              </button>

              {showStatusMenu && (
                <div
                  style={{
                    position: 'absolute',
                    top: '52px',
                    left: '160px',
                    backgroundColor: '#ffffff',
                    border: '1px solid #e4e4e7',
                    borderRadius: '16px',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                    zIndex: 20,
                    minWidth: '170px',
                    overflow: 'hidden',
                    padding: '6px',
                  }}
                >
                  {(['want_to_read', 'reading', 'completed'] as ReadingStatus[]).map((st) => (
                    <button
                      key={st}
                      onClick={() => handleStatusSelect(st)}
                      style={{
                        display: 'block',
                        width: '100%',
                        textAlign: 'left',
                        padding: '10px 14px',
                        border: 'none',
                        borderRadius: '10px',
                        background: selectedStatus === st ? '#f4f4f5' : 'transparent',
                        fontSize: '0.84rem',
                        fontWeight: selectedStatus === st ? '700' : '500',
                        color: '#18181b',
                        cursor: 'pointer',
                      }}
                    >
                      {st === 'want_to_read' ? 'Want to Read' : st === 'reading' ? 'Currently Reading' : 'Completed'}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Row: [Summary] [Parts] */}
      <div
        style={{
          display: 'flex',
          gap: '32px',
          borderBottom: '1px solid #e4e4e7',
          marginBottom: '24px',
        }}
      >
        <button
          onClick={() => setActiveTab('summary')}
          style={{
            background: 'none',
            border: 'none',
            padding: '12px 2px',
            fontSize: '1rem',
            fontWeight: activeTab === 'summary' ? '800' : '600',
            color: activeTab === 'summary' ? '#18181b' : '#71717a',
            borderBottom: activeTab === 'summary' ? '2.5px solid #18181b' : '2.5px solid transparent',
            cursor: 'pointer',
            marginBottom: '-1px',
          }}
        >
          Summary
        </button>
        <button
          onClick={() => setActiveTab('parts')}
          style={{
            background: 'none',
            border: 'none',
            padding: '12px 2px',
            fontSize: '1rem',
            fontWeight: activeTab === 'parts' ? '800' : '600',
            color: activeTab === 'parts' ? '#18181b' : '#71717a',
            borderBottom: activeTab === 'parts' ? '2.5px solid #18181b' : '2.5px solid transparent',
            cursor: 'pointer',
            marginBottom: '-1px',
          }}
        >
          Details
        </button>
      </div>

      {/* Main 2-Column Content Layout (Details on Left, Promo Card on Right) */}
      <div style={{ display: 'flex', gap: '48px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
        {/* Left Column */}
        <div style={{ flex: '1 1 640px', minWidth: '300px' }}>
          {activeTab === 'summary' ? (
            <div>
              {/* Meta details line with icons */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '0.86rem',
                  color: '#52525b',
                  marginBottom: '10px',
                  flexWrap: 'wrap',
                }}
              >
                <BookOpen size={16} style={{ color: '#71717a' }} />
                <span>
                  <strong style={{ color: '#18181b' }}>Complete</strong> • First published {book.firstPublishYear || book.publishDate || '2024'} • {stats.readingTime}
                </span>
              </div>

              {/* Genres line */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '0.86rem',
                  color: '#52525b',
                  marginBottom: '20px',
                }}
              >
                <span style={{ color: '#71717a' }}>&#9432;</span>
                <span>
                  {book.subjects && book.subjects.length > 0
                    ? book.subjects.slice(0, 3).join(' • ')
                    : 'Fiction • General • Bestseller'}
                </span>
              </div>

              {/* Tags Row */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '22px' }}>
                <span style={{ fontSize: '0.84rem', fontWeight: '600', color: '#18181b', marginRight: '4px' }}>
                  Tags
                </span>
                {(book.subjects && book.subjects.length > 0
                  ? book.subjects.slice(0, 7)
                  : ['novel', 'trending', 'drama', 'fiction', 'romance']
                ).map((tag) => (
                  <span
                    key={tag}
                    style={{
                      backgroundColor: '#f4f4f5',
                      color: '#52525b',
                      fontSize: '0.78rem',
                      fontWeight: '500',
                      padding: '5px 14px',
                      borderRadius: '9999px',
                    }}
                  >
                    {tag.toLowerCase()}
                  </span>
                ))}
              </div>

              {/* Synopsis / Description with Read More toggle */}
              <div style={{ marginBottom: '24px' }}>
                <p
                  style={{
                    lineHeight: '1.7',
                    color: '#3f3f46',
                    fontSize: '0.92rem',
                    margin: 0,
                    whiteSpace: 'pre-wrap',
                  }}
                >
                  {shouldTruncate && !isDescExpanded
                    ? `${descriptionText.slice(0, 220)}...`
                    : descriptionText}
                </p>

                {shouldTruncate && (
                  <button
                    onClick={() => setIsDescExpanded(!isDescExpanded)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#18181b',
                      fontWeight: '700',
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                      padding: '8px 0',
                      display: 'block',
                    }}
                  >
                    {isDescExpanded ? 'Show less' : 'Read more'}
                  </button>
                )}
              </div>

              {/* Ranking banner from screenshot */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px 18px',
                  borderRadius: '16px',
                  border: '1px solid #e4e4e7',
                  backgroundColor: '#ffffff',
                  marginBottom: '36px',
                  cursor: 'pointer',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <strong style={{ fontSize: '0.9rem', color: '#18181b' }}>#1</strong>
                  <span
                    style={{
                      backgroundColor: '#f4f4f5',
                      padding: '4px 12px',
                      borderRadius: '9999px',
                      fontSize: '0.78rem',
                      color: '#52525b',
                    }}
                  >
                    {primarySubject.replace(/_/g, ' ')}
                  </span>
                </div>
                <ChevronRight size={16} color="#71717a" />
              </div>
            </div>
          ) : (
            /* Details Tab */
            <div style={{ marginBottom: '36px' }}>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                  gap: '20px',
                  padding: '24px',
                  backgroundColor: '#fafafa',
                  borderRadius: '18px',
                  border: '1px solid #e4e4e7',
                }}
              >
                <div>
                  <span style={{ fontSize: '0.75rem', color: '#71717a', textTransform: 'uppercase', fontWeight: '700' }}>
                    Publisher
                  </span>
                  <p style={{ margin: '4px 0 0 0', fontWeight: '600', color: '#18181b', fontSize: '0.9rem' }}>
                    {book.publishers?.[0] || 'ShelfVan Editions'}
                  </p>
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', color: '#71717a', textTransform: 'uppercase', fontWeight: '700' }}>
                    Length
                  </span>
                  <p style={{ margin: '4px 0 0 0', fontWeight: '600', color: '#18181b', fontSize: '0.9rem' }}>
                    {book.pageCount ? `${book.pageCount} pages` : 'Standard Edition'}
                  </p>
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', color: '#71717a', textTransform: 'uppercase', fontWeight: '700' }}>
                    Provider
                  </span>
                  <p style={{ margin: '4px 0 0 0', fontWeight: '600', color: '#18181b', fontSize: '0.9rem' }}>
                    {book.provider === 'googlebooks' ? 'Google Books' : 'Open Library'}
                  </p>
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', color: '#71717a', textTransform: 'uppercase', fontWeight: '700' }}>
                    ISBN
                  </span>
                  <p style={{ margin: '4px 0 0 0', fontWeight: '600', color: '#18181b', fontSize: '0.9rem' }}>
                    {book.isbn?.[0] || 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Advertisement / Companion Promo Card matching screenshot */}
        <div style={{ width: '280px', flexShrink: 0 }}>
          <span style={{ display: 'block', textAlign: 'center', fontSize: '0.72rem', color: '#a1a1aa', marginBottom: '6px' }}>
            Featured
          </span>
          <div
            style={{
              borderRadius: '20px',
              background: 'linear-gradient(135deg, #18181b 0%, #27272a 60%, #1e1e24 100%)',
              color: '#ffffff',
              padding: '24px 20px',
              textAlign: 'center',
              boxShadow: '0 8px 20px rgba(0, 0, 0, 0.25)',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <h3 style={{ margin: '0 0 6px 0', fontSize: '1.35rem', fontWeight: '800', lineHeight: '1.2' }}>
              Get lost.<br />Stay lost.
            </h3>
            <p style={{ margin: '0 0 20px 0', fontSize: '0.84rem', opacity: 0.9 }}>
              No ads, infinite shelves, all providers connected.
            </p>
            <Link
              to="/catalogs"
              style={{
                display: 'inline-block',
                backgroundColor: '#ffffff',
                color: '#18181b',
                fontWeight: '700',
                fontSize: '0.82rem',
                padding: '10px 22px',
                borderRadius: '9999px',
                textDecoration: 'none',
                boxShadow: '0 4px 10px rgba(0,0,0,0.15)',
              }}
            >
              EXPLORE CATALOGS
            </Link>
          </div>
        </div>
      </div>

      {/* "You may also like" Section matching the user's reference screenshot */}
      <section style={{ marginTop: '54px', position: 'relative' }}>
        <h2
          style={{
            fontSize: '1.35rem',
            fontWeight: '800',
            color: '#18181b',
            letterSpacing: '-0.3px',
            marginBottom: '18px',
          }}
        >
          You may also like
        </h2>

        {/* Carousel Container */}
        <div style={{ position: 'relative' }}>
          <div
            ref={recScrollRef}
            style={{
              display: 'grid',
              gridTemplateRows: 'repeat(2, 114px)',
              gridAutoFlow: 'column',
              gridAutoColumns: 'minmax(300px, 340px)',
              gap: '14px',
              overflowX: 'auto',
              paddingBottom: '8px',
              scrollSnapType: 'x mandatory',
            }}
            className="hide-scrollbar"
          >
            {recommendations.map((item) => {
              const itemCover = resolveCoverUrl(item.coverUrl);

              return (
                <Link
                  key={item.key}
                  to={`/book/${item.key}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '8px 12px',
                    backgroundColor: '#ffffff',
                    borderRadius: '16px',
                    border: '1px solid #f0f0f2',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                    textDecoration: 'none',
                    color: 'inherit',
                    transition: 'all 0.18s ease',
                    scrollSnapAlign: 'start',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#fafafa';
                    e.currentTarget.style.borderColor = '#e4e4e7';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.06)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#ffffff';
                    e.currentTarget.style.borderColor = '#f0f0f2';
                    e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.03)';
                  }}
                >
                  {/* Left Thumbnail */}
                  <div
                    style={{
                      width: '68px',
                      height: '96px',
                      flexShrink: 0,
                      borderRadius: '10px',
                      overflow: 'hidden',
                      backgroundColor: '#27272a',
                    }}
                  >
                    {itemCover ? (
                      <img
                        src={itemCover}
                        alt={item.title}
                        loading="lazy"
                        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
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
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#71717a',
                          padding: '4px',
                          textAlign: 'center',
                          fontSize: '0.65rem',
                        }}
                      >
                        {item.title}
                      </div>
                    )}
                  </div>

                  {/* Right Content */}
                  <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <h4
                      style={{
                        margin: '0 0 3px 0',
                        fontSize: '0.84rem',
                        fontWeight: '700',
                        color: '#18181b',
                        textTransform: 'uppercase',
                        letterSpacing: '-0.2px',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                      title={item.title}
                    >
                      {item.title}
                    </h4>

                    <p
                      style={{
                        margin: '0 0 6px 0',
                        fontSize: '0.74rem',
                        color: '#71717a',
                        lineHeight: '1.35',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                    >
                      {item.description}
                    </p>

                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontSize: '0.7rem',
                        color: '#a1a1aa',
                      }}
                    >
                      <List size={12} />
                      <span>{item.parts}</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Floating Right Scroll Button */}
          <button
            type="button"
            onClick={() => scrollRecs(340)}
            style={{
              position: 'absolute',
              right: '-16px',
              top: '50%',
              transform: 'translateY(-50%)',
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              backgroundColor: '#ffffff',
              border: '1px solid #e4e4e7',
              boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              zIndex: 10,
              transition: 'transform 0.15s ease',
            }}
            title="Next books"
          >
            <ChevronRight size={18} color="#18181b" />
          </button>
        </div>
      </section>
    </div>
  );
};

import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, useLocation, useParams } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HeaderPage } from './components/header_page.tsx';
import { NotFoundPage } from './pages/not_found_page.tsx';

const DiscoverPage = lazy(() => import('./pages/discover_page.tsx').then((m) => ({ default: m.DiscoverPage })));
const AllCatalogsPage = lazy(() => import('./pages/all_catalogs_page.tsx').then((m) => ({ default: m.AllCatalogsPage })));
const MyShelfPage = lazy(() => import('./pages/my_shelf_page.tsx').then((m) => ({ default: m.MyShelfPage })));
const BookDetailPage = lazy(() => import('./pages/book_detail_page.tsx').then((m) => ({ default: m.BookDetailPage })));
const ReaderPage = lazy(() => import('./pages/reader_page.tsx').then((m) => ({ default: m.ReaderPage })));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
    },
  },
});

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <section className="status-page" role="alert">
        <h1>Something went wrong</h1>
        <p>This page hit an unexpected error. Your shelf is safe.</p>
        <div className="status-page__actions">
          <button className="btn btn--primary" onClick={() => window.location.reload()}>
            Reload page
          </button>
          <a className="btn" href="/">Back to Discover</a>
        </div>
      </section>
    );
  }
}

const RouteFallback: React.FC = () => (
  <div className="route-fallback" role="status" aria-live="polite">
    <span className="visually-hidden">Loading…</span>
  </div>
);

// Re-mount per book so status, tab and description state never leak between books.
const KeyedBookDetail: React.FC = () => {
  const { key } = useParams();
  return <BookDetailPage key={key} />;
};

const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

const AppLayout: React.FC = () => {
  const location = useLocation();
  const isReaderPage = location.pathname.startsWith('/read/');

  // Automatically request Chrome / browser persistent storage on startup
  React.useEffect(() => {
    if (typeof navigator !== 'undefined' && navigator.storage && navigator.storage.persist) {
      navigator.storage.persisted().then((isPersisted) => {
        if (!isPersisted) {
          navigator.storage.persist().catch(() => {});
        }
      }).catch(() => {});
    }
  }, []);

  return (
    <div>
      <a className="skip-link" href="#main">Skip to content</a>
      <ScrollToTop />
      {!isReaderPage && <HeaderPage />}
      <main id="main" tabIndex={-1}>
        <ErrorBoundary key={location.pathname}>
          <Suspense fallback={<RouteFallback />}>
            <Routes>
              <Route path="/" element={<DiscoverPage />} />
              <Route path="/search" element={<DiscoverPage />} />
              <Route path="/catalogs" element={<AllCatalogsPage />} />
              <Route path="/shelf" element={<MyShelfPage />} />
              <Route path="/book/:key" element={<KeyedBookDetail />} />
              <Route path="/read/:key" element={<ReaderPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Suspense>
        </ErrorBoundary>
      </main>
    </div>
  );
};

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AppLayout />
      </BrowserRouter>
    </QueryClientProvider>
  );
}

import React from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HeaderPage } from './components/header_page.tsx';
import { DiscoverPage } from './pages/discover_page.tsx';
import { AllCatalogsPage } from './pages/all_catalogs_page.tsx';
import { MyShelfPage } from './pages/my_shelf_page.tsx';
import { BookDetailPage } from './pages/book_detail_page.tsx';
import { ReaderPage } from './pages/reader_page.tsx';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
    },
  },
});

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
      {!isReaderPage && <HeaderPage />}
      <main>
        <Routes>
          <Route path="/" element={<DiscoverPage />} />
          <Route path="/search" element={<DiscoverPage />} />
          <Route path="/catalogs" element={<AllCatalogsPage />} />
          <Route path="/shelf" element={<MyShelfPage />} />
          <Route path="/book/:key" element={<BookDetailPage />} />
          <Route path="/read/:key" element={<ReaderPage />} />
        </Routes>
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

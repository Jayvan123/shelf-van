import React from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Navbar } from './components/Navbar.tsx';
import { Home } from './pages/Home.tsx';
import { Search } from './pages/Search.tsx';
import { Catalogs } from './pages/Catalogs.tsx';
import { BookDetail } from './pages/BookDetail.tsx';
import { Reader } from './pages/Reader.tsx';

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

  return (
    <div>
      {!isReaderPage && <Navbar />}
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/catalogs" element={<Catalogs />} />
          <Route path="/search" element={<Search />} />
          <Route path="/book/:key" element={<BookDetail />} />
          <Route path="/read/:key" element={<Reader />} />
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

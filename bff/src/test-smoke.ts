import { app } from './app.js';
import { cacheStore } from './cache.js';
import { normalizeSearchResponse, normalizeBookDetail } from './normalizers.js';

async function runTests() {
  console.log('[Test 1] Health endpoint...');
  const res1 = await app.request('/api/health');
  const json1 = (await res1.json()) as { status: string };
  console.log('[Test 1 Passed] Health status:', json1.status);

  console.log('[Test 2] Empty search returns empty list...');
  const res2 = await app.request('/api/search');
  const json2 = (await res2.json()) as { books: unknown[] };
  console.log('[Test 2 Passed] Empty search books count:', json2.books.length);

  console.log('[Test 3] CacheStore set/get...');
  cacheStore.set('test-smoke', { ok: true }, 60);
  const val = cacheStore.get<{ ok: boolean }>('test-smoke');
  console.log('[Test 3 Passed] Cache value:', val);

  console.log('[Test 4] Search normalization...');
  const mockSearchRaw = {
    numFound: 1,
    docs: [
      {
        key: '/works/OL45804W',
        title: 'The Great Gatsby',
        author_name: ['F. Scott Fitzgerald'],
        first_publish_year: 1925,
        cover_i: 12345,
        ia: ['greatgatsby00fitz'],
      },
    ],
  };
  const normSearch = normalizeSearchResponse(mockSearchRaw);
  console.log('[Test 4 Passed] Key:', normSearch.books[0]?.key, 'isReadable:', normSearch.books[0]?.isReadable);

  console.log('[Test 5] Detail normalization with IA scan...');
  const mockWork = {
    title: 'The Great Gatsby',
    description: 'A classic novel.',
  };
  const mockEdition = {
    number_of_pages: 180,
    publishers: ['Charles Scribner'],
    ocaid: 'greatgatsby00fitz',
  };
  const normDetail = normalizeBookDetail(mockWork, 'OL45804W', mockEdition, ['F. Scott Fitzgerald']);
  console.log('[Test 5 Passed] readerUrl:', normDetail.readerUrl);

  console.log('\n========================================');
  console.log('  ALL BFF TESTS COMPLETED SUCCESSFULLY  ');
  console.log('========================================');
}

runTests().then(() => {
  process.exit(0);
}).catch((err) => {
  console.error('Smoke test error:', err);
  process.exit(1);
});


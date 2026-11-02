export interface CatalogGenre {
  name: string;
  subject: string;
  coverId: number;
  description?: string;
}

export interface CatalogCategory {
  category: string;
  shortName: string;
  genres: CatalogGenre[];
}

export const ALL_CATALOG_CATEGORIES: CatalogCategory[] = [
  {
    category: 'Fiction & Literature',
    shortName: 'Fiction',
    genres: [
      { name: 'Classic Literature', subject: 'classic_literature', coverId: 8231856, description: 'Timeless masterpieces & historical canons' },
      { name: 'Science Fiction', subject: 'science_fiction', coverId: 7222246, description: 'Futuristic worlds, space & cybernetics' },
      { name: 'Fantasy', subject: 'fantasy', coverId: 8406786, description: 'Magic, mythical creatures & epic quests' },
      { name: 'Mystery & Detective', subject: 'mystery_and_detective_stories', coverId: 77889, description: 'Whodunits, investigations & crime' },
      { name: 'Historical Fiction', subject: 'historical_fiction', coverId: 8231862, description: 'Stories set in bygone eras' },
      { name: 'Romance', subject: 'romance', coverId: 8231852, description: 'Love stories & emotional journeys' },
      { name: 'Thriller & Suspense', subject: 'thriller', coverId: 8235222, description: 'Fast-paced, edge-of-your-seat narratives' },
      { name: 'Horror', subject: 'horror', coverId: 44556, description: 'Gothic fiction & dark suspense' },
      { name: 'Short Stories', subject: 'short_stories', coverId: 8231870, description: 'Collections of compact fiction' },
      { name: 'Poetry', subject: 'poetry', coverId: 8231864, description: 'Verses, sonnets & lyric expression' },
      { name: 'Plays & Drama', subject: 'plays', coverId: 8231850, description: 'Theatrical scripts & classic stage plays' },
      { name: 'Action & Adventure', subject: 'adventure', coverId: 8231860, description: 'Expeditions & survival journeys' },
      { name: 'Humor & Satire', subject: 'humorous_stories', coverId: 8235114, description: 'Comedic fiction & witty commentary' },
    ],
  },
  {
    category: 'Non-Fiction, Humanities & Society',
    shortName: 'Non-Fiction',
    genres: [
      { name: 'World History', subject: 'history', coverId: 8240110, description: 'Ancient civilizations to contemporary events' },
      { name: 'Biography & Memoir', subject: 'biography', coverId: 8231872, description: 'True accounts of notable figures' },
      { name: 'Philosophy', subject: 'philosophy', coverId: 8231874, description: 'Ethics, logic & existential thought' },
      { name: 'Psychology', subject: 'psychology', coverId: 8235250, description: 'Human cognition & mental health' },
      { name: 'Politics & Government', subject: 'politics_and_government', coverId: 8231880, description: 'Statecraft & political theory' },
      { name: 'Economics & Commerce', subject: 'economics', coverId: 8231884, description: 'Markets, finance & economic systems' },
      { name: 'Sociology', subject: 'sociology', coverId: 8231886, description: 'Social structures & human cultures' },
      { name: 'Mythology & Folklore', subject: 'mythology', coverId: 8231890, description: 'Legends, pantheons & ancient myths' },
      { name: 'Religion & Theology', subject: 'religion', coverId: 8231893, description: 'World faiths & sacred texts' },
      { name: 'Education & Pedagogy', subject: 'education', coverId: 8231896, description: 'Teaching methods & learning theory' },
    ],
  },
  {
    category: 'Science, Math & Technology',
    shortName: 'Science & Tech',
    genres: [
      { name: 'General Science', subject: 'science', coverId: 8231898, description: 'Scientific discoveries & phenomena' },
      { name: 'Computer Science', subject: 'computer_science', coverId: 8240142, description: 'Algorithms, systems & computing' },
      { name: 'Physics', subject: 'physics', coverId: 8231900, description: 'Matter, energy & spacetime' },
      { name: 'Mathematics', subject: 'mathematics', coverId: 8231902, description: 'Pure mathematics, calculus & algebra' },
      { name: 'Astronomy & Space', subject: 'astronomy', coverId: 8235275, description: 'Stars, planets & astrophysics' },
      { name: 'Biology & Life', subject: 'biology', coverId: 8235280, description: 'Organisms & evolutionary biology' },
      { name: 'Chemistry', subject: 'chemistry', coverId: 8231905, description: 'Molecules & chemical processes' },
      { name: 'Medicine & Health', subject: 'medicine', coverId: 8240160, description: 'Human anatomy & medical science' },
      { name: 'Engineering', subject: 'engineering', coverId: 8235290, description: 'Mechanical & civil systems' },
    ],
  },
  {
    category: 'Arts, Culture & Entertainment',
    shortName: 'Arts & Culture',
    genres: [
      { name: 'Art & Art History', subject: 'art', coverId: 8235295, description: 'Visual arts, movements & masters' },
      { name: 'Music & Musicals', subject: 'music', coverId: 8240170, description: 'Composers & music history' },
      { name: 'Architecture', subject: 'architecture', coverId: 8235300, description: 'Structural design & urban planning' },
      { name: 'Photography', subject: 'photography', coverId: 8235305, description: 'Techniques & visual media' },
      { name: 'Film & Cinema', subject: 'film', coverId: 8240180, description: 'Cinematography & directors' },
      { name: 'Design & Graphics', subject: 'design', coverId: 8240185, description: 'Layout, typography & graphic identity' },
    ],
  },
  {
    category: 'Children & Young Readers',
    shortName: 'Children & YA',
    genres: [
      { name: 'Children\'s Fiction', subject: 'children', coverId: 67890, description: 'Illustrated stories & early chapters' },
      { name: 'Young Adult', subject: 'young_adult_fiction', coverId: 8231914, description: 'Coming-of-age & teen adventures' },
      { name: 'Fairy Tales & Fables', subject: 'fairy_tales', coverId: 8231916, description: 'Classic folk fables & tales' },
      { name: 'Picture Books', subject: 'picture_books', coverId: 8235326, description: 'Visual storytelling for young readers' },
    ],
  },
  {
    category: 'Lifestyle, Hobbies & Practical',
    shortName: 'Lifestyle',
    genres: [
      { name: 'Cooking & Food', subject: 'cooking', coverId: 8235330, description: 'Recipes & culinary history' },
      { name: 'Travel & Geography', subject: 'travel', coverId: 8240205, description: 'Voyages & world exploration' },
      { name: 'Personal Development', subject: 'self-help', coverId: 8231925, description: 'Habits, motivation & growth' },
      { name: 'Business & Management', subject: 'business', coverId: 8235340, description: 'Leadership & operational strategy' },
      { name: 'Sports & Athletics', subject: 'sports', coverId: 8240220, description: 'Athletic history & training' },
      { name: 'Gardening & Plants', subject: 'gardening', coverId: 8235350, description: 'Botanical care & horticulture' },
    ],
  },
];

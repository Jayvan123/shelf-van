export interface CatalogGenre {
  name: string;
  subject: string;
  icon?: string;
  description?: string;
}

export interface CatalogCategory {
  category: string;
  genres: CatalogGenre[];
}

export const ALL_CATALOG_CATEGORIES: CatalogCategory[] = [
  {
    category: 'Fiction & Literature',
    genres: [
      { name: 'Classic Literature', subject: 'classic_literature', icon: '📜', description: 'Timeless masterpieces and historical canons' },
      { name: 'Science Fiction', subject: 'science_fiction', icon: '🚀', description: 'Space operas, cybernetics, and futuristic worlds' },
      { name: 'Fantasy', subject: 'fantasy', icon: '🧙', description: 'Magic, mythical creatures, and epic quests' },
      { name: 'Mystery & Detective', subject: 'mystery_and_detective_stories', icon: '🕵️', description: 'Whodunits, investigations, and crime fiction' },
      { name: 'Historical Fiction', subject: 'historical_fiction', icon: '🏰', description: 'Period dramas and stories set in bygone eras' },
      { name: 'Romance', subject: 'romance', icon: '💖', description: 'Love stories, emotional journeys, and relationships' },
      { name: 'Thriller & Suspense', subject: 'thriller', icon: '⚡', description: 'Fast-paced, edge-of-your-seat narratives' },
      { name: 'Horror', subject: 'horror', icon: '👻', description: 'Gothic fiction, ghost tales, and dark suspense' },
      { name: 'Short Stories', subject: 'short_stories', icon: '📑', description: 'Collections of compact literary fiction' },
      { name: 'Poetry', subject: 'poetry', icon: '🪶', description: 'Verses, sonnets, and lyric expression' },
      { name: 'Plays & Drama', subject: 'plays', icon: '🎭', description: 'Theatrical scripts from classic to modern stages' },
      { name: 'Action & Adventure', subject: 'adventure', icon: '🗺️', description: 'Expeditions, survival, and high-stakes journeys' },
      { name: 'Humor & Satire', subject: 'humorous_stories', icon: '😄', description: 'Comedic fiction and witty commentary' },
    ],
  },
  {
    category: 'Non-Fiction, Humanities & Society',
    genres: [
      { name: 'World History', subject: 'history', icon: '🏛️', description: 'Ancient civilizations to contemporary events' },
      { name: 'Biography & Memoir', subject: 'biography', icon: '👤', description: 'True accounts of notable lives and figures' },
      { name: 'Philosophy', subject: 'philosophy', icon: '🧠', description: 'Ethics, metaphysics, logic, and existential thought' },
      { name: 'Psychology', subject: 'psychology', icon: '🧩', description: 'Human cognition, behavior, and mental health' },
      { name: 'Politics & Government', subject: 'politics_and_government', icon: '⚖️', description: 'Statecraft, civics, and political theory' },
      { name: 'Economics & Commerce', subject: 'economics', icon: '📈', description: 'Markets, finance, trade, and economic systems' },
      { name: 'Sociology', subject: 'sociology', icon: '👥', description: 'Social structures, cultures, and human societies' },
      { name: 'Mythology & Folklore', subject: 'mythology', icon: '🐉', description: 'Legends, mythological pantheons, and folklore' },
      { name: 'Religion & Theology', subject: 'religion', icon: '🕊️', description: 'World faiths, sacred texts, and spirituality' },
      { name: 'Education & Pedagogy', subject: 'education', icon: '🎓', description: 'Teaching methods and academic philosophy' },
    ],
  },
  {
    category: 'Science, Math & Technology',
    genres: [
      { name: 'General Science', subject: 'science', icon: '🔬', description: 'Scientific discoveries and natural phenomena' },
      { name: 'Computer Science', subject: 'computer_science', icon: '💻', description: 'Algorithms, computing systems, and programming' },
      { name: 'Physics', subject: 'physics', icon: '⚛️', description: 'Matter, motion, energy, and spacetime' },
      { name: 'Mathematics', subject: 'mathematics', icon: '📐', description: 'Pure mathematics, calculus, and algebra' },
      { name: 'Astronomy & Space', subject: 'astronomy', icon: '🌌', description: 'Stars, planets, astrophysics, and cosmology' },
      { name: 'Biology & Life', subject: 'biology', icon: '🧬', description: 'Ecology, organisms, and evolutionary biology' },
      { name: 'Chemistry', subject: 'chemistry', icon: '🧪', description: 'Molecular science and chemical processes' },
      { name: 'Medicine & Health', subject: 'medicine', icon: '🩺', description: 'Clinical studies, human anatomy, and therapies' },
      { name: 'Engineering', subject: 'engineering', icon: '⚙️', description: 'Mechanical, electrical, and civil systems' },
    ],
  },
  {
    category: 'Arts, Culture & Entertainment',
    genres: [
      { name: 'Art & Art History', subject: 'art', icon: '🎨', description: 'Visual arts, movements, and masters' },
      { name: 'Music & Musicals', subject: 'music', icon: '🎵', description: 'Composers, instruments, and music theory' },
      { name: 'Architecture', subject: 'architecture', icon: '🏢', description: 'Structural design, buildings, and urban planning' },
      { name: 'Photography', subject: 'photography', icon: '📷', description: 'Techniques, photojournalism, and visual media' },
      { name: 'Film & Cinema', subject: 'film', icon: '🎬', description: 'Cinematography, directors, and screenwriting' },
      { name: 'Design & Graphics', subject: 'design', icon: '✏️', description: 'Graphic design, layout, and visual identity' },
    ],
  },
  {
    category: 'Children & Young Readers',
    genres: [
      { name: 'Children\'s Fiction', subject: 'children', icon: '🧸', description: 'Illustrated stories and early reader chapter books' },
      { name: 'Young Adult', subject: 'young_adult_fiction', icon: '🎒', description: 'Coming-of-age tales and teen adventures' },
      { name: 'Fairy Tales & Fables', subject: 'fairy_tales', icon: '🧚', description: 'Classic folk fables and bedtime fairy tales' },
      { name: 'Picture Books', subject: 'picture_books', icon: '🎨', description: 'Visual storytelling for young minds' },
    ],
  },
  {
    category: 'Lifestyle, Hobbies & Practical',
    genres: [
      { name: 'Cooking & Food', subject: 'cooking', icon: '🍳', description: 'Recipes, culinary history, and dining' },
      { name: 'Travel & Geography', subject: 'travel', icon: '✈️', description: 'Voyages, travelogues, and world exploration' },
      { name: 'Personal Development', subject: 'self-help', icon: '🌱', description: 'Habits, motivation, and productivity' },
      { name: 'Business & Management', subject: 'business', icon: '💼', description: 'Leadership, startups, and operational strategy' },
      { name: 'Sports & Athletics', subject: 'sports', icon: '⚽', description: 'Athletic history, training, and competitions' },
      { name: 'Gardening & Plants', subject: 'gardening', icon: '🌻', description: 'Horticulture, botanical care, and urban gardens' },
    ],
  },
];


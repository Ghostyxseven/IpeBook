import { useEffect, useState } from 'react';
import type { BookExample, ExampleFilter, GuideId } from '../model/entities/BookExperience';
import {
  exampleTerms,
  filterBookExamples,
  readerGuides,
} from '../model/services/bookExperience.ts';

export function useBookExperience() {
  const [guideId, setGuideId] = useState<GuideId>('comprar');
  const [filter, setFilter] = useState<ExampleFilter>('Todos');
  const [query, setQuery] = useState('');
  const [selectedBook, setSelectedBook] = useState<BookExample | null>(null);
  useEffect(() => {
    const close = () => setSelectedBook(null);
    window.addEventListener('hashchange', close);
    return () => window.removeEventListener('hashchange', close);
  }, []);
  return {
    guideId,
    guide: readerGuides.find((guide) => guide.id === guideId)!,
    guides: readerGuides,
    selectGuide: setGuideId,
    openGuide: (id: GuideId) => {
      setGuideId(id);
      setSelectedBook(null);
      window.location.hash = 'como-funciona';
    },
    filter,
    query,
    setFilter,
    setQuery,
    examples: filterBookExamples(query, filter),
    resetSearch: () => {
      setQuery('');
      setFilter('Todos');
    },
    selectedBook,
    openExample: setSelectedBook,
    closeExample: () => setSelectedBook(null),
    exampleTerms,
  };
}

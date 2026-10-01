import { useEffect, useMemo, useState } from 'react';
import type { CatalogFilters, Modality } from '../model/entities/Listing';
import type { CatalogRepository } from '../model/repositories/CatalogRepository';
import {
  activeFilterCount,
  hasActiveSearch,
  normalizeQuery,
  toggleModality as toggle,
} from '../model/services/catalogFilters.ts';
import { categories } from '../model/services/categories.ts';
import { useCatalogPages } from './useCatalogPages.ts';

export const SEARCH_DEBOUNCE_MS = 300;

/** Buscar: texto com espera após a digitação, filtros combináveis e paginação. */
export function useCatalogSearchViewModel(
  repository: CatalogRepository,
  options: { initialCategory?: string | null; debounceMs?: number } = {},
) {
  const { initialCategory = null, debounceMs = SEARCH_DEBOUNCE_MS } = options;
  const [query, setQuery] = useState('');
  const [appliedQuery, setAppliedQuery] = useState('');
  const [modalities, setModalities] = useState<Modality[]>([]);
  const [category, setCategory] = useState<string | null>(initialCategory);

  // A categoria pode mudar quando a tela é reaberta por outro atalho do Início.
  useEffect(() => setCategory(initialCategory), [initialCategory]);

  useEffect(() => {
    const next = normalizeQuery(query);
    if (next === appliedQuery) return;
    const timer = setTimeout(() => setAppliedQuery(next), debounceMs);
    return () => clearTimeout(timer);
  }, [query, appliedQuery, debounceMs]);

  const filters = useMemo<CatalogFilters>(
    () => ({ query: appliedQuery, modalities, category }),
    [appliedQuery, modalities, category],
  );
  const pages = useCatalogPages(repository, filters);

  return {
    ...pages,
    query,
    setQuery,
    modalities,
    toggleModality: (modality: Modality) => setModalities((current) => toggle(current, modality)),
    category,
    setCategory,
    categories,
    activeFilterCount: activeFilterCount(filters),
    searching: hasActiveSearch(filters),
    clear: () => {
      setQuery('');
      setAppliedQuery('');
      setModalities([]);
      setCategory(null);
    },
  };
}

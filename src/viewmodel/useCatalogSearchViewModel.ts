import { useCallback, useEffect, useMemo, useState } from 'react';
import type { CatalogFilters, Modality } from '../model/entities/Listing';
import type { CatalogRepository } from '../model/repositories/CatalogRepository';
import {
  activeFilterCount,
  exploreTitle,
  hasActiveSearch,
  normalizeQuery,
  resultSummary,
  toggleModality as toggle,
} from '../model/services/catalogFilters.ts';
import { useCatalogPages } from './useCatalogPages.ts';

export const SEARCH_DEBOUNCE_MS = 300;

/** Explorar: texto com espera após a digitação, modalidades combináveis e paginação. */
export function useCatalogSearchViewModel(
  repository: CatalogRepository,
  options: { initialModality?: Modality | null; debounceMs?: number } = {},
) {
  const { initialModality = null, debounceMs = SEARCH_DEBOUNCE_MS } = options;
  const [query, setQuery] = useState('');
  const [appliedQuery, setAppliedQuery] = useState('');
  const [modalities, setModalities] = useState<Modality[]>(
    initialModality ? [initialModality] : [],
  );

  useEffect(() => {
    const next = normalizeQuery(query);
    if (next === appliedQuery) return;
    const timer = setTimeout(() => setAppliedQuery(next), debounceMs);
    return () => clearTimeout(timer);
  }, [query, appliedQuery, debounceMs]);

  const filters = useMemo<CatalogFilters>(
    () => ({ query: appliedQuery, modalities, category: null }),
    [appliedQuery, modalities],
  );
  const pages = useCatalogPages(repository, filters);
  const empty = pages.status === 'ready' && pages.items.length === 0;

  /** Atalho do Início: mostra só a modalidade escolhida, ou todas com `null`. */
  const showOnly = useCallback((modality: Modality | null) => {
    setModalities((current) => {
      const next = modality ? [modality] : [];
      const same = current.length === next.length && current.every((item, i) => item === next[i]);
      return same ? current : next;
    });
  }, []);

  return {
    ...pages,
    query,
    setQuery,
    modalities,
    toggleModality: (modality: Modality) => setModalities((current) => toggle(current, modality)),
    showOnly,
    activeFilterCount: activeFilterCount(filters),
    searching: hasActiveSearch(filters),
    title: exploreTitle(filters, empty),
    summary: resultSummary(pages.total, filters),
    clear: () => {
      setQuery('');
      setAppliedQuery('');
      setModalities([]);
    },
  };
}

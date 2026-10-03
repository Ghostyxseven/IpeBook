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
  const [category, setCategory] = useState<string | null>(null);
  const [goodCondition, setGoodCondition] = useState(false);

  useEffect(() => {
    const next = normalizeQuery(query);
    if (next === appliedQuery) return;
    const timer = setTimeout(() => setAppliedQuery(next), debounceMs);
    return () => clearTimeout(timer);
  }, [query, appliedQuery, debounceMs]);

  const filters = useMemo<CatalogFilters>(
    () => ({ query: appliedQuery, modalities, category, goodCondition }),
    [appliedQuery, modalities, category, goodCondition],
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
    category,
    goodCondition,
    /** Chip de categoria do Figma 02.02; tocar de novo na mesma volta para "Todos". */
    selectCategory: (next: string | null) =>
      setCategory((current) => (current === next ? null : next)),
    /** "Mostrar livros" da tela Filtrar livros (Figma 02.03). */
    applyFilters: (next: Pick<CatalogFilters, 'modalities' | 'category' | 'goodCondition'>) => {
      setModalities(next.modalities);
      setCategory(next.category);
      setGoodCondition(Boolean(next.goodCondition));
    },
    /** Quantos livros o filtro em edição mostraria, para o botão "Mostrar N livros". */
    countFor: async (draft: Pick<CatalogFilters, 'modalities' | 'category' | 'goodCondition'>) => {
      const page = await repository.list({
        filters: { query: appliedQuery, ...draft },
        cursor: null,
        limit: 1,
      });
      return page.total;
    },
    clear: () => {
      setQuery('');
      setAppliedQuery('');
      setModalities([]);
      setCategory(null);
      setGoodCondition(false);
    },
  };
}

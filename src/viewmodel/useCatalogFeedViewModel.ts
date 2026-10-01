import { useMemo, useState } from 'react';
import type { CatalogFilters, Modality } from '../model/entities/Listing';
import type { CatalogRepository } from '../model/repositories/CatalogRepository';
import { useCatalogPages } from './useCatalogPages.ts';

/** Quantos livros o Início mostra antes do "Ver todos" (Figma 02). */
export const FEED_PREVIEW_SIZE = 4;

/** Início: anúncios mais recentes, filtráveis por modalidade nos chips. */
export function useCatalogFeedViewModel(repository: CatalogRepository) {
  const [modality, setModality] = useState<Modality | null>(null);
  const filters = useMemo<CatalogFilters>(
    () => ({ query: '', modalities: modality ? [modality] : [], category: null }),
    [modality],
  );
  const pages = useCatalogPages(repository, filters);
  return {
    ...pages,
    preview: pages.items.slice(0, FEED_PREVIEW_SIZE),
    hasMoreThanPreview: pages.items.length > FEED_PREVIEW_SIZE || pages.hasMore,
    modality,
    setModality,
  };
}

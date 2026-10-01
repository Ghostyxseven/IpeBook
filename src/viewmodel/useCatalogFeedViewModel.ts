import { emptyFilters } from '../model/entities/Listing.ts';
import type { CatalogRepository } from '../model/repositories/CatalogRepository';
import { categories } from '../model/services/categories.ts';
import { useCatalogPages } from './useCatalogPages.ts';

/** Início: anúncios mais recentes e atalhos de categoria. */
export function useCatalogFeedViewModel(repository: CatalogRepository) {
  const pages = useCatalogPages(repository, emptyFilters);
  return { ...pages, categories };
}

import { useCallback, useEffect, useMemo, useState } from 'react';
import { toCatalogError, type Listing, type ListingFilter } from '../model/entities/Listing.ts';
import type { CatalogRepository } from '../model/repositories/CatalogRepository';
import {
  catalogErrorMessage,
  catalogOrders,
  categoriesOf,
  discoverStatus,
  emptyQuery,
  filterListings,
  modalityFilters,
  sortListings,
  type CatalogOrder,
} from '../model/services/catalog.ts';

/** Descobrir livro: buscar, filtrar e comparar resultados (pattern do design system). */
export function useCatalogViewModel(repository: CatalogRepository) {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [query, setQuery] = useState(emptyQuery.query);
  const [modality, setModality] = useState<ListingFilter>(emptyQuery.modality);
  const [category, setCategory] = useState<string | null>(emptyQuery.category);
  const [order, setOrder] = useState<CatalogOrder>('recentes');
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setErrorMessage(null);
    repository
      .list()
      .then((items) => !cancelled && setListings(items))
      .catch(
        (failure) =>
          !cancelled && setErrorMessage(catalogErrorMessage(toCatalogError(failure).code)),
      )
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [repository, attempt]);

  const results = useMemo(
    () => sortListings(filterListings(listings, { query, modality, category }), order),
    [listings, query, modality, category, order],
  );
  const total = useMemo(() => filterListings(listings, emptyQuery).length, [listings]);
  const filtering = query.trim() !== '' || modality !== 'Todos' || category !== null;

  return {
    status: discoverStatus({
      loading,
      failed: errorMessage !== null,
      total,
      shown: results.length,
    }),
    errorMessage,
    results,
    total,
    categories: useMemo(() => categoriesOf(listings), [listings]),
    modalities: modalityFilters,
    orders: catalogOrders,
    query,
    modality,
    category,
    order,
    filtering,
    setQuery,
    setModality,
    setCategory,
    setOrder,
    clearFilters: () => {
      setQuery(emptyQuery.query);
      setModality(emptyQuery.modality);
      setCategory(emptyQuery.category);
    },
    reload: useCallback(() => setAttempt((count) => count + 1), []),
  };
}

/** Detalhe do livro: carrega um anúncio e distingue "não existe" de "falhou". */
export function useListingDetailViewModel(repository: CatalogRepository, id: string) {
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setErrorMessage(null);
    repository
      .get(id)
      .then((item) => !cancelled && setListing(item))
      .catch(
        (failure) =>
          !cancelled && setErrorMessage(catalogErrorMessage(toCatalogError(failure).code)),
      )
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [repository, id, attempt]);

  return {
    loading,
    listing,
    errorMessage,
    notFound: !loading && errorMessage === null && listing === null,
    reload: () => setAttempt((count) => count + 1),
  };
}

import { useCallback, useEffect, useRef, useState } from 'react';
import { toCatalogError } from '../model/entities/CatalogError.ts';
import type { CatalogFilters, Listing } from '../model/entities/Listing';
import type { CatalogCursor, CatalogRepository } from '../model/repositories/CatalogRepository';
import { catalogErrorMessage } from '../model/services/catalogMessages.ts';

export const PAGE_SIZE = 20;

export type CatalogPagesStatus = 'loading' | 'ready' | 'error';

/**
 * Lista paginada do catálogo. Cada nova consulta invalida as anteriores,
 * para uma resposta atrasada nunca sobrescrever a mais recente.
 */
export function useCatalogPages(repository: CatalogRepository, filters: CatalogFilters) {
  const [items, setItems] = useState<Listing[]>([]);
  const [status, setStatus] = useState<CatalogPagesStatus>('loading');
  const [error, setError] = useState<string>();
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [loadMoreError, setLoadMoreError] = useState<string>();
  const cursor = useRef<CatalogCursor | null>(null);
  const requestId = useRef(0);
  const busyMore = useRef(false);
  const loaded = useRef(false);

  const loadFirst = useCallback(
    async (mode: 'initial' | 'refresh') => {
      const id = ++requestId.current;
      busyMore.current = false;
      setLoadingMore(false);
      setLoadMoreError(undefined);
      if (mode === 'refresh') setRefreshing(true);
      else setStatus('loading');
      try {
        const page = await repository.list({ filters, cursor: null, limit: PAGE_SIZE });
        if (id !== requestId.current) return;
        cursor.current = page.nextCursor;
        setItems(page.items);
        setError(undefined);
        setStatus('ready');
        loaded.current = true;
      } catch (cause) {
        if (id !== requestId.current) return;
        const message = catalogErrorMessage(toCatalogError(cause).code);
        // Ao atualizar uma lista já carregada, mantém os itens e só avisa.
        if (mode === 'refresh' && loaded.current) setError(message);
        else {
          setItems([]);
          setError(message);
          setStatus('error');
          loaded.current = false;
        }
      } finally {
        if (id === requestId.current) setRefreshing(false);
      }
    },
    [repository, filters],
  );

  useEffect(() => {
    void loadFirst('initial');
  }, [loadFirst]);

  const loadMore = useCallback(async () => {
    if (busyMore.current || !cursor.current || status !== 'ready') return;
    busyMore.current = true;
    const id = requestId.current;
    setLoadingMore(true);
    setLoadMoreError(undefined);
    try {
      const page = await repository.list({ filters, cursor: cursor.current, limit: PAGE_SIZE });
      if (id !== requestId.current) return;
      cursor.current = page.nextCursor;
      setItems((current) => [...current, ...page.items]);
    } catch (cause) {
      if (id !== requestId.current) return;
      setLoadMoreError(catalogErrorMessage(toCatalogError(cause).code));
    } finally {
      if (id === requestId.current) {
        busyMore.current = false;
        setLoadingMore(false);
      }
    }
  }, [repository, filters, status]);

  return {
    items,
    status,
    error,
    refreshing,
    loadingMore,
    loadMoreError,
    hasMore: cursor.current !== null,
    loadMore,
    refresh: () => loadFirst('refresh'),
    retry: () => loadFirst('initial'),
  };
}

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { toCatalogError } from '../model/entities/CatalogError.ts';
import type { Listing } from '../model/entities/Listing';
import type { CatalogRepository } from '../model/repositories/CatalogRepository';
import { listingDetails } from '../model/services/catalogFormat.ts';
import { catalogErrorMessage } from '../model/services/catalogMessages.ts';

export type ListingDetailStatus = 'loading' | 'ready' | 'notFound' | 'error';

/** Detalhe do livro: carrega pelo id e distingue anúncio inexistente de falha. */
export function useListingDetailViewModel(repository: CatalogRepository, id: string) {
  const [listing, setListing] = useState<Listing | null>(null);
  const [status, setStatus] = useState<ListingDetailStatus>('loading');
  const [error, setError] = useState<string>();
  const requestId = useRef(0);

  const load = useCallback(async () => {
    const current = ++requestId.current;
    setStatus('loading');
    try {
      const result = await repository.getById(id);
      if (current !== requestId.current) return;
      setListing(result);
      setError(undefined);
      setStatus('ready');
    } catch (cause) {
      if (current !== requestId.current) return;
      const code = toCatalogError(cause).code;
      setListing(null);
      setError(catalogErrorMessage(code));
      setStatus(code === 'not_found' ? 'notFound' : 'error');
    }
  }, [repository, id]);

  useEffect(() => {
    void load();
  }, [load]);

  // A tela só exibe: o que mostrar em cada modalidade é decidido no Model.
  const details = useMemo(() => (listing ? listingDetails(listing) : null), [listing]);

  return { listing, details, status, error, retry: load };
}

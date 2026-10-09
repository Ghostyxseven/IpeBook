import { useCallback, useEffect, useRef, useState } from 'react';
import type { MyListing } from '../model/entities/Listing';
import { toListingError } from '../model/entities/ListingError.ts';
import type { ListingsRepository } from '../model/repositories/ListingsRepository';
import { listingErrorMessage } from '../model/services/listingMessages.ts';
import { useAsyncAction } from './useAsyncAction.ts';

export type ManageStatus = 'loading' | 'ready' | 'error' | 'removed';

/**
 * Gerenciar anúncio (spec 032): quadros 04.08 ativo, 04.10 pausado, 04.20
 * confirmação e 04.21 excluído.
 *
 * `removed` é um estado e não uma navegação: depois de excluir, o anúncio não
 * existe mais, e voltar para uma rota que o carregaria daria "não encontrado".
 */
export function useManageListingViewModel(repository: ListingsRepository, id: string) {
  const [listing, setListing] = useState<MyListing | null>(null);
  const [status, setStatus] = useState<ManageStatus>('loading');
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [busy, run] = useAsyncAction();
  const requestId = useRef(0);

  const load = useCallback(async () => {
    const current = ++requestId.current;
    setStatus('loading');
    try {
      const result = await repository.getMineById(id);
      if (current !== requestId.current) return;
      setListing(result);
      setError(null);
      setStatus('ready');
    } catch (cause) {
      if (current !== requestId.current) return;
      setError(listingErrorMessage(toListingError(cause).code));
      setStatus('error');
    }
  }, [repository, id]);

  useEffect(() => {
    void load();
  }, [load]);

  const act = useCallback(
    (action: () => Promise<MyListing>) =>
      run(async () => {
        setActionError(null);
        try {
          setListing(await action());
        } catch (cause) {
          setActionError(listingErrorMessage(toListingError(cause).code));
        }
      }),
    [run],
  );

  return {
    listing,
    status,
    error,
    actionError,
    busy,
    retry: load,
    /** "Pausar anúncio" (04.08). No banco continua sendo `arquivado`. */
    pause: () => act(() => repository.archive(id)),
    /** "Retomar anúncio" (04.10). */
    resume: () => act(() => repository.republish(id)),
    /** "Excluir anúncio" (04.20). Leva ao estado 04.21. */
    remove: () =>
      run(async () => {
        setActionError(null);
        try {
          await repository.remove(id);
          setStatus('removed');
        } catch (cause) {
          setActionError(listingErrorMessage(toListingError(cause).code));
        }
      }),
  };
}

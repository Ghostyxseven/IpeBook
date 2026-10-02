import { useCallback, useEffect, useState } from 'react';
import type { MyListing } from '../model/entities/Listing';
import { toListingError } from '../model/entities/ListingError.ts';
import { listingErrorMessage } from '../model/services/listingMessages.ts';
import type { ListingsRepository } from '../model/repositories/ListingsRepository';
import { useAsyncAction } from './useAsyncAction.ts';

type Status = 'loading' | 'ready' | 'error';

/**
 * Minha estante: os próprios anúncios e o que dá para fazer com eles.
 *
 * Serve a spec 025 (arquivar, republicar, excluir) e a 026 (Minhas publicações)
 * — é a mesma lista, e duplicá-la faria as duas telas divergirem.
 */
export function useMyListingsViewModel(repository: ListingsRepository) {
  const [listings, setListings] = useState<MyListing[]>([]);
  const [status, setStatus] = useState<Status>('loading');
  /** Falha ao CARREGAR a lista: ocupa a tela inteira. */
  const [loadError, setLoadError] = useState<string | null>(null);
  /**
   * Falha de uma AÇÃO (arquivar, excluir): vira aviso e sobrevive ao
   * recarregamento que a própria falha dispara. Juntas num campo só, a releitura
   * apagava a mensagem antes de alguém ler por que a ação foi recusada.
   */
  const [error, setError] = useState<string | null>(null);
  /** O anúncio que está no meio de uma ação, para desabilitar só o card dele. */
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  const [, run] = useAsyncAction();

  useEffect(() => {
    let active = true;
    setStatus('loading');
    setLoadError(null);
    repository.listMine().then(
      (found) => {
        if (!active) return;
        setListings(found);
        setStatus('ready');
      },
      (failure) => {
        if (!active) return;
        setLoadError(listingErrorMessage(toListingError(failure).code));
        setStatus('error');
      },
    );
    return () => {
      active = false;
    };
  }, [repository, attempt]);

  const act = useCallback(
    (id: string, action: () => Promise<MyListing | void>) =>
      run(async () => {
        setError(null);
        setPendingId(id);
        try {
          const updated = await action();
          setListings((current) =>
            updated
              ? current.map((item) => (item.id === id ? updated : item))
              : current.filter((item) => item.id !== id),
          );
        } catch (failure) {
          setError(listingErrorMessage(toListingError(failure).code));
          // A lista pode estar velha — quem recusou foi o servidor, e o motivo
          // costuma ser uma situação que mudou por fora (a negociação reservou).
          setAttempt((value) => value + 1);
        } finally {
          setPendingId(null);
        }
      }),
    [run],
  );

  return {
    status,
    listings,
    loadError,
    error,
    dismissError: () => setError(null),
    pendingId,
    empty: status === 'ready' && listings.length === 0,
    reload: () => setAttempt((value) => value + 1),
    archive: (id: string) => act(id, () => repository.archive(id)),
    republish: (id: string) => act(id, () => repository.republish(id)),
    remove: (id: string) => act(id, () => repository.remove(id)),
  };
}

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { BookRequest } from '../model/entities/BookRequest';
import type { BookRequestRepository } from '../model/repositories/BookRequestRepository';
import { toBookRequestError } from '../model/entities/BookRequestError.ts';
import { bookRequestErrorMessage } from '../model/services/bookRequestMessages.ts';
import { useAsyncAction } from './useAsyncAction.ts';
import { useSessionContext } from './useSession.ts';
import type { CatalogRepository } from '../model/repositories/CatalogRepository';
import { toCatalogError } from '../model/entities/CatalogError.ts';
import { catalogErrorMessage } from '../model/services/catalogMessages.ts';
import {
  canCancel,
  canComplete,
  ensureTransition,
  isOwner,
} from '../model/services/bookRequestTransitions.ts';
import type { Listing } from '../model/entities/Listing';
import type { ConfirmKind } from '../model/services/bookRequestFormat';

export type DetailStatus = 'loading' | 'ready' | 'notFound' | 'error';

export function useBookRequestDetailViewModel(
  catalogRepository: CatalogRepository,
  bookRequestRepository: BookRequestRepository,
  requestId: string,
) {
  const session = useSessionContext();
  const [busy, run] = useAsyncAction();
  const [request, setRequest] = useState<BookRequest | null>(null);
  const [listing, setListing] = useState<Listing | null>(null);
  /** Na troca, o livro que quem pediu ofereceu (Figma 03.05). */
  const [offeredListing, setOfferedListing] = useState<Listing | null>(null);
  /** Primeiro nome de quem pediu, para quem anunciou ver com quem combina. */
  const [requesterName, setRequesterName] = useState<string | null>(null);
  const [status, setStatus] = useState<DetailStatus>('loading');
  const [error, setError] = useState<string | null>(null);
  const reqId = useRef(0);
  /** Confirmação aberta antes de recusar, cancelar ou concluir (Figma 06.17, 06.11 e 06.07). */
  const [confirming, setConfirming] = useState<ConfirmKind | null>(null);
  /** Última mudança feita nesta tela, para mostrar o retorno do Figma 06.05. */
  const [lastAction, setLastAction] = useState<BookRequest['status'] | null>(null);

  const load = useCallback(async () => {
    const current = ++reqId.current;
    setStatus('loading');
    setError(null);
    try {
      const br = await bookRequestRepository.getRequestById(requestId);
      const list = await catalogRepository.getById(br.listingId);
      // Livro oferecido e nome de quem pediu são extras: sem eles a negociação ainda abre.
      const [offered, name] = await Promise.all([
        br.offeredListingId
          ? catalogRepository.getById(br.offeredListingId).catch(() => null)
          : Promise.resolve(null),
        bookRequestRepository.personFirstName(br.requesterId).catch(() => null),
      ]);
      if (current !== reqId.current) return;
      setRequest(br);
      setListing(list);
      setOfferedListing(offered);
      setRequesterName(name);
      setStatus('ready');
    } catch (failure) {
      if (current !== reqId.current) return;
      const br = toBookRequestError(failure);
      if (br.code === 'not_found') setStatus('notFound');
      else setStatus('error');
      if (br.code === 'unknown') {
        const cs = toCatalogError(failure);
        setError(catalogErrorMessage(cs.code));
      } else {
        setError(bookRequestErrorMessage(br.code));
      }
      setRequest(null);
      setListing(null);
      setOfferedListing(null);
    }
  }, [bookRequestRepository, catalogRepository, requestId]);

  useEffect(() => {
    void load();
  }, [load]);

  const userId = session.user?.id ?? '';

  const capabilities = useMemo(() => {
    if (!request || !listing || !userId) {
      return {
        asOwner: false,
        asRequester: false,
        canAccept: false,
        canReject: false,
        canCancel: false,
        canComplete: false,
      };
    }
    const owner = isOwner(userId, listing);
    const requester = request.requesterId === userId;
    return {
      asOwner: owner,
      asRequester: requester,
      canAccept: owner && request.status === 'pending',
      canReject: owner && request.status === 'pending',
      canCancel: canCancel(request.status, userId, {
        requesterId: request.requesterId,
        ownerId: listing.ownerId,
      }),
      canComplete: canComplete(request.status, userId, { ownerId: listing.ownerId }),
    };
  }, [request, listing, userId]);

  const act = useCallback(
    async (nextStatus: BookRequest['status']) => {
      setError(null);
      await run(async () => {
        if (!request || !listing) {
          setError(bookRequestErrorMessage('not_found'));
          return;
        }
        // Confere antes para dar resposta rápida; o banco confere de novo (ADR 0018).
        try {
          ensureTransition(request.status, nextStatus);
        } catch (failure) {
          setError(bookRequestErrorMessage(toBookRequestError(failure).code));
          return;
        }
        // O repositório muda a solicitação e o anúncio na mesma operação.
        let updated: BookRequest;
        try {
          updated = await bookRequestRepository.transitionRequest(request.id, nextStatus);
        } catch (failure) {
          // A falha aparece na tela em vez de virar uma promessa rejeitada sem tratamento.
          setError(bookRequestErrorMessage(toBookRequestError(failure).code));
          return;
        }
        setRequest(updated);
        setLastAction(nextStatus);
        setConfirming(null);
        try {
          setListing(await catalogRepository.getById(listing.id));
        } catch {
          // O pedido já mudou; o anúncio é recarregado na próxima abertura da tela.
        }
      });
    },
    [request, listing, run, catalogRepository, bookRequestRepository],
  );

  const accept = useCallback(() => act('accepted'), [act]);
  const askConfirm = useCallback((kind: ConfirmKind) => {
    setError(null);
    setConfirming(kind);
  }, []);
  const dismissConfirm = useCallback(() => setConfirming(null), []);
  /** Sai do retorno "Um encontro, um novo capítulo." e mostra o acompanhamento. */
  const clearLastAction = useCallback(() => setLastAction(null), []);
  /** Executa a ação da confirmação aberta. */
  const confirm = useCallback(() => {
    if (confirming === 'reject') return act('rejected');
    if (confirming === 'cancel') return act('canceled');
    if (confirming === 'complete') return act('completed');
    return Promise.resolve();
  }, [act, confirming]);
  const reject = useCallback(() => act('rejected'), [act]);
  const cancel = useCallback(() => act('canceled'), [act]);
  const complete = useCallback(() => act('completed'), [act]);

  const asOwner = capabilities.asOwner;
  /** Quem está do outro lado: usado em "Pedir ajuda" e nos textos (Figma 06.15). */
  const other = {
    id: asOwner ? (request?.requesterId ?? null) : (listing?.ownerId ?? null),
    name: asOwner ? requesterName : (listing?.ownerFirstName ?? null),
  };

  return {
    request,
    listing,
    offeredListing,
    requesterName,
    other,
    status,
    error,
    busy,
    retry: load,
    capabilities,
    confirming,
    lastAction,
    askConfirm,
    dismissConfirm,
    clearLastAction,
    confirm,
    accept,
    reject,
    cancel,
    complete,
  };
}

import { toBookRequestError } from '../model/entities/BookRequestError.ts';
import type { BookRequestRepository } from '../model/repositories/BookRequestRepository';
import { bookRequestErrorMessage } from '../model/services/bookRequestMessages.ts';
import { ensureCanCreate } from '../model/services/bookRequestTransitions.ts';
import { useSessionContext } from './useSession';
import { useAsyncAction } from './useAsyncAction.ts';
import { useCallback, useState } from 'react';
import { toCatalogError } from '../model/entities/CatalogError.ts';
import { catalogErrorMessage } from '../model/services/catalogMessages.ts';
import { catalogRepository } from '../factories/catalog';

/**
 * "Conversar" (Figma 03.01, ADR 0035): abre uma negociação sem local, dia nem horário —
 * só para falar antes de propor o encontro. Mesmas regras de `createRequest` (anúncio
 * disponível, não é o dono, sem outro pedido pendente já aberto), sem o formulário.
 */
export function useStartConversationViewModel(
  bookRequests: BookRequestRepository,
  listingId: string,
) {
  const session = useSessionContext();
  const [error, setError] = useState<string | null>(null);
  const [startedId, setStartedId] = useState<string | null>(null);
  const [starting, run] = useAsyncAction();

  const start = useCallback(
    () =>
      run(async () => {
        setError(null);
        try {
          const userId = session.user?.id;
          const current = await catalogRepository.getById(listingId);
          ensureCanCreate(current, userId);
          const existing = await bookRequests.getRequestsByRequester(userId as string);
          // Já tem conversa/negociação aberta com esse anúncio: abre a que existe,
          // sem criar outra (o banco também recusaria, mesmo índice do `createRequest`).
          const open = existing.find((it) => it.listingId === listingId && it.status === 'pending');
          if (open) {
            setStartedId(open.id);
            return;
          }
          const created = await bookRequests.createRequest({
            listingId,
            publicLocation: null,
            meetingDate: null,
            meetingTime: null,
            offeredListingId: null,
          });
          setStartedId(created.id);
        } catch (failure) {
          const br = toBookRequestError(failure);
          if (br.code === 'unknown') {
            setError(catalogErrorMessage(toCatalogError(failure).code));
          } else {
            setError(bookRequestErrorMessage(br.code));
          }
        }
      }),
    [run, session.user?.id, listingId, bookRequests],
  );

  return { starting, error, startedId, start };
}

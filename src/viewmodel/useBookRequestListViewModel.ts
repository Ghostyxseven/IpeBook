import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { BookRequest } from '../model/entities/BookRequest';
import type { BookRequestRepository } from '../model/repositories/BookRequestRepository';
import { toBookRequestError } from '../model/entities/BookRequestError';
import { bookRequestErrorMessage } from '../model/services/bookRequestMessages';
import { useSessionContext } from './useSession';
import type { CatalogRepository } from '../model/repositories/CatalogRepository';
import { toCatalogError } from '../model/entities/CatalogError';
import { catalogErrorMessage } from '../model/services/catalogMessages';
import { isOwner } from '../model/services/bookRequestTransitions';
import type { MessageRepository } from '../model/repositories/MessageRepository';
import { describeConversations, type Entry } from './describeConversations.ts';

export type ListStatus = 'loading' | 'ready' | 'empty' | 'error';

export function useBookRequestListViewModel(
  bookRequestRepository: BookRequestRepository,
  catalogRepository: CatalogRepository,
  messageRepository?: MessageRepository,
) {
  const session = useSessionContext();
  const userId = session.user?.id ?? '';
  const [items, setItems] = useState<Entry[]>([]);
  const [status, setStatus] = useState<ListStatus>('loading');
  const [error, setError] = useState<string | null>(null);
  const currentId = useRef(0);

  const load = useCallback(async () => {
    const token = ++currentId.current;
    setStatus('loading');
    setError(null);
    try {
      if (!userId) {
        setItems([]);
        setStatus('empty');
        return;
      }
      // Solicitações onde o usuário é requerente OU dono.
      const [requesterList, ownerList] = await Promise.all([
        bookRequestRepository.getRequestsByRequester(userId),
        bookRequestRepository.getRequestsByOwner(userId),
      ]);
      const merged = new Map<string, BookRequest>();
      for (const r of requesterList) merged.set(r.id, r);
      for (const r of ownerList) merged.set(r.id, r);
      const sorted = [...merged.values()].sort((a, b) =>
        a.createdAt < b.createdAt ? 1 : a.createdAt > b.createdAt ? -1 : 0,
      );
      // Carrega anúncios (títulos/capa para listagem) e define asOwner vs asRequester
      const entries: Entry[] = [];
      for (const request of sorted) {
        try {
          const listing = await catalogRepository.getById(request.listingId);
          if (token !== currentId.current) return;
          entries.push({
            request,
            listing,
            asOwner: isOwner(userId, listing),
          });
        } catch {
          entries.push({ request, listing: null, asOwner: false });
        }
      }
      if (messageRepository && entries.length > 0) {
        await describeConversations(messageRepository, entries, userId);
      }
      if (token !== currentId.current) return;
      setItems(entries);
      setStatus(entries.length === 0 ? 'empty' : 'ready');
    } catch (failure) {
      if (token !== currentId.current) return;
      const br = toBookRequestError(failure);
      if (br.code === 'unknown') {
        const cs = toCatalogError(failure);
        setError(catalogErrorMessage(cs.code));
      } else {
        setError(bookRequestErrorMessage(br.code));
      }
      setStatus('error');
    }
  }, [bookRequestRepository, catalogRepository, messageRepository, userId]);

  useEffect(() => {
    void load();
  }, [load]);

  const counts = useMemo(() => {
    let pending = 0;
    let accepted = 0;
    for (const entry of items) {
      if (entry.request.status === 'pending') pending += 1;
      if (entry.request.status === 'accepted') accepted += 1;
    }
    return { pending, accepted, total: items.length };
  }, [items]);

  return { items, status, error, retry: load, counts };
}

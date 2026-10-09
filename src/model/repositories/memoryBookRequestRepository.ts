import type { BookRequest, RequestStatus } from '../entities/BookRequest';
import { BookRequestError } from '../entities/BookRequestError.ts';
import type { BookRequestRepository } from './BookRequestRepository';
import type { Listing, ListingStatus } from '../entities/Listing';
import {
  ensureTransition,
  listingStatusOnAccept,
  listingStatusOnCancel,
  listingStatusOnComplete,
} from '../services/bookRequestTransitions.ts';

const nowIso = () => new Date().toISOString();

const uid = () =>
  'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (char) => {
    const random = (Math.random() * 16) | 0;
    const value = char === 'x' ? random : (random & 0x3) | 0x8;
    return value.toString(16);
  });

export function createMemoryBookRequestRepository(
  seed: BookRequest[] = [],
  options?: {
    /** Mapeia listingId → ownerId (usado para getRequestsByOwner). */
    listingOwner?: Record<string, string | undefined>;
    /** Situação atual de cada anúncio, alterada pelas transições como faz o banco. */
    listingStatus?: Record<string, ListingStatus>;
    /** Quem está usando o app; vira o `requesterId` dos pedidos criados. */
    currentUserId?: string;
    /** Primeiros nomes que `personFirstName` devolve. */
    names?: Record<string, string>;
    /** Anúncios que a estante de quem pediu devolve na contraproposta (Figma 06.19). */
    shelf?: Listing[];
  },
): BookRequestRepository & { snapshot(): BookRequest[] } {
  const items: BookRequest[] = [...seed];
  const listingOwner = options?.listingOwner ?? {};
  const listingStatus = options?.listingStatus ?? {};

  const findIndex = (id: string) => items.findIndex((it) => it.id === id);

  const isOwnerOf = (request: BookRequest, ownerId: string): boolean => {
    // Sem mapeamento para o listing: em modo "teste flexível" considera como dono
    // para não quebrar fluxos de listagem. A verificação real de papel (asOwner)
    // acontece na ViewModel comparando userId com listing.ownerId.
    const mapped = listingOwner[request.listingId];
    return mapped ? mapped === ownerId : true;
  };

  return {
    snapshot() {
      return [...items];
    },

    async createRequest({ listingId, publicLocation, meetingDate, meetingTime, offeredListingId }) {
      const now = nowIso();
      const created: BookRequest = {
        id: uid(),
        listingId,
        requesterId: options?.currentUserId ?? 'requester-user',
        offeredListingId: offeredListingId ?? null,
        publicLocation,
        meetingDate,
        meetingTime,
        status: 'pending',
        createdAt: now,
        updatedAt: now,
      };
      items.unshift(created);
      return created;
    },

    async getRequestById(id) {
      const found = items.find((it) => it.id === id);
      if (!found) throw new BookRequestError('not_found');
      return found;
    },

    async getRequestsByRequester(requesterId) {
      return items
        .filter((it) => it.requesterId === requesterId)
        .sort((a, b) => (a.createdAt < b.createdAt ? 1 : a.createdAt > b.createdAt ? -1 : 0));
    },

    async getRequestsByOwner(ownerId) {
      return items
        .filter((it) => isOwnerOf(it, ownerId))
        .sort((a, b) => (a.createdAt < b.createdAt ? 1 : a.createdAt > b.createdAt ? -1 : 0));
    },

    async transitionRequest(id, status: RequestStatus) {
      const index = findIndex(id);
      if (index < 0) throw new BookRequestError('not_found');
      const current = items[index];
      ensureTransition(current.status, status);
      if (current.counterListingId && current.status === 'pending' && status !== 'canceled') {
        throw new BookRequestError('invalid_transition');
      }
      const now = nowIso();
      items[index] = { ...current, status, updatedAt: now };

      // Mesmas regras da função `transition_book_request` (ADR 0018).
      const listingId = current.listingId;
      const offered = current.offeredListingId ?? null;
      if (status === 'accepted') {
        listingStatus[listingId] = listingStatusOnAccept();
        items.forEach((item, i) => {
          if (item.listingId === listingId && item.status === 'pending' && item.id !== id) {
            items[i] = { ...item, status: 'rejected', updatedAt: now };
          }
        });
        if (offered) listingStatus[offered] = listingStatusOnAccept();
      } else if (status === 'completed') {
        listingStatus[listingId] = listingStatusOnComplete();
        if (offered) listingStatus[offered] = listingStatusOnComplete();
      } else if (status === 'canceled') {
        for (const target of [listingId, offered]) {
          if (!target) continue;
          const next = listingStatusOnCancel(current.status, listingStatus[target] ?? null);
          if (next) listingStatus[target] = next;
        }
      }
      return items[index];
    },

    async reschedule(id, { publicLocation, meetingDate, meetingTime }) {
      const index = findIndex(id);
      if (index < 0) throw new BookRequestError('not_found');
      const current = items[index];
      // Igual à função `reschedule_book_request`: só o encontro já combinado muda.
      if (current.status !== 'accepted') throw new BookRequestError('invalid_transition');
      items[index] = {
        ...current,
        publicLocation: publicLocation.trim(),
        meetingDate,
        meetingTime,
        updatedAt: nowIso(),
      };
      return items[index];
    },

    async proposeMeeting(id, { publicLocation, meetingDate, meetingTime }) {
      const index = findIndex(id);
      if (index < 0) throw new BookRequestError('not_found');
      const current = items[index];
      // Igual à função `propose_meeting`: só antes do primeiro encontro proposto.
      if (current.status !== 'pending' || current.publicLocation !== null) {
        throw new BookRequestError('invalid_transition');
      }
      items[index] = {
        ...current,
        publicLocation: publicLocation.trim(),
        meetingDate,
        meetingTime,
        updatedAt: nowIso(),
      };
      return items[index];
    },

    async shelfOfRequester(requestId) {
      const index = findIndex(requestId);
      if (index < 0) throw new BookRequestError('not_found');
      const request = items[index];
      if (request.status !== 'pending' || request.counterListingId) return [];
      if (options?.currentUserId && listingOwner[request.listingId] !== options.currentUserId)
        return [];
      // O mesmo recorte da função do banco: troca, disponível e nunca o anúncio pedido.
      return (options?.shelf ?? []).filter(
        (listing) =>
          listing.modality === 'trade' &&
          (listingStatus[listing.id] ?? listing.status) === 'disponivel' &&
          listing.ownerId === request.requesterId &&
          listing.id !== request.offeredListingId &&
          listing.id !== request.listingId,
      );
    },

    async counterOffer(requestId, listingId) {
      const index = findIndex(requestId);
      if (index < 0) throw new BookRequestError('not_found');
      const request = items[index];
      if (request.status !== 'pending' || request.counterListingId) {
        throw new BookRequestError('invalid_transition');
      }
      if (options?.currentUserId && listingOwner[request.listingId] !== options.currentUserId) {
        throw new BookRequestError('forbidden');
      }
      // Como a função do banco: o livro é de quem pediu, está disponível e não é o pedido.
      const shelf = options?.shelf ?? [];
      const chosen = shelf.find((listing) => listing.id === listingId);
      if (
        !chosen ||
        (listingStatus[chosen.id] ?? chosen.status) !== 'disponivel' ||
        chosen.modality !== 'trade' ||
        chosen.ownerId !== request.requesterId ||
        chosen.id === request.listingId ||
        chosen.id === request.offeredListingId
      ) {
        throw new BookRequestError('invalid_transition');
      }
      items[index] = { ...request, counterListingId: listingId, updatedAt: nowIso() };
      return items[index];
    },

    async answerCounterOffer(requestId, accept) {
      const index = findIndex(requestId);
      if (index < 0) throw new BookRequestError('not_found');
      const request = items[index];
      if (request.status !== 'pending' || !request.counterListingId) {
        throw new BookRequestError('invalid_transition');
      }
      if (options?.currentUserId && options.currentUserId !== request.requesterId) {
        throw new BookRequestError('forbidden');
      }
      const chosen = options?.shelf?.find((item) => item.id === request.counterListingId);
      if (
        accept &&
        (!chosen ||
          chosen.ownerId !== request.requesterId ||
          chosen.modality !== 'trade' ||
          (listingStatus[chosen.id] ?? chosen.status) !== 'disponivel' ||
          (listingStatus[request.listingId] ?? 'disponivel') !== 'disponivel')
      ) {
        throw new BookRequestError('invalid_transition');
      }
      items[index] = accept
        ? {
            ...request,
            // Aceitar fecha o acordo: o contraproposto vira o livro da troca.
            offeredListingId: request.counterListingId,
            counterListingId: null,
            status: 'accepted',
            updatedAt: nowIso(),
          }
        : { ...request, counterListingId: null, status: 'rejected', updatedAt: nowIso() };
      if (accept) {
        listingStatus[request.listingId] = listingStatusOnAccept();
        listingStatus[request.counterListingId] = listingStatusOnAccept();
        items.forEach((item, i) => {
          if (
            item.listingId === request.listingId &&
            item.status === 'pending' &&
            item.id !== requestId
          ) {
            items[i] = { ...item, status: 'rejected', updatedAt: nowIso() };
          }
        });
      }
      return items[index];
    },

    async personFirstName(userId) {
      return options?.names?.[userId] ?? null;
    },
  };
}

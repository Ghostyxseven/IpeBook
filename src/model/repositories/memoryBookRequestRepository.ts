import type { BookRequest, RequestStatus } from '../entities/BookRequest';
import { BookRequestError } from '../entities/BookRequestError.ts';
import type { BookRequestRepository } from './BookRequestRepository';
import type { ListingStatus } from '../entities/Listing';
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

    async createRequest({ listingId, publicLocation, meetingDate, meetingTime }) {
      const now = nowIso();
      const created: BookRequest = {
        id: uid(),
        listingId,
        requesterId: 'requester-user',
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
      const now = nowIso();
      items[index] = { ...current, status, updatedAt: now };

      // Mesmas regras da função `transition_book_request` (ADR 0018).
      const listingId = current.listingId;
      if (status === 'accepted') {
        listingStatus[listingId] = listingStatusOnAccept();
        items.forEach((item, i) => {
          if (item.listingId === listingId && item.status === 'pending' && item.id !== id) {
            items[i] = { ...item, status: 'rejected', updatedAt: now };
          }
        });
      } else if (status === 'completed') {
        listingStatus[listingId] = listingStatusOnComplete();
      } else if (status === 'canceled') {
        const next = listingStatusOnCancel(current.status, listingStatus[listingId] ?? null);
        if (next) listingStatus[listingId] = next;
      }
      return items[index];
    },
  };
}

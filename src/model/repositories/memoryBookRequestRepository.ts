import type { BookRequest, RequestStatus } from '../entities/BookRequest';
import { BookRequestError } from '../entities/BookRequestError.ts';
import type { BookRequestRepository } from './BookRequestRepository';

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
  },
): BookRequestRepository & { snapshot(): BookRequest[] } {
  const items: BookRequest[] = [...seed];
  const listingOwner = options?.listingOwner ?? {};

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

    async updateRequestStatus(id, status: RequestStatus) {
      const index = findIndex(id);
      if (index < 0) throw new BookRequestError('not_found');
      items[index] = { ...items[index], status, updatedAt: nowIso() };
      return items[index];
    },
  };
}

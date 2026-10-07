import type { BookRequest } from '../model/entities/BookRequest';
import type { Listing } from '../model/entities/Listing';
import type { RequestMessage } from '../model/entities/RequestMessage';
import type { MessageRepository } from '../model/repositories/MessageRepository';

export type Entry = {
  request: BookRequest;
  asOwner: boolean;
  listing: Listing | null;
  /** Primeiro nome de quem está do outro lado, quando a conversa sabe (spec 029). */
  otherName?: string | null;
  /** Última mensagem da conversa, para a linha do Figma 06.01. */
  lastMessage?: RequestMessage | null;
};

/**
 * Completa cada linha com o nome de quem está do outro lado e a última mensagem.
 * Falhar aqui não derruba a lista: a linha só fica sem esses dois textos.
 */
export async function describeConversations(
  repository: MessageRepository,
  entries: Entry[],
  userId: string,
): Promise<void> {
  const latest = await repository
    .latestByRequest(entries.map((entry) => entry.request.id))
    .catch(() => ({}) as Record<string, RequestMessage>);
  const names = new Map<string, Promise<string | null>>();
  const nameOf = (id: string) => {
    if (!names.has(id))
      names.set(
        id,
        repository.firstName(id).catch(() => null),
      );
    return names.get(id)!;
  };
  await Promise.all(
    entries.map(async (entry) => {
      entry.lastMessage = latest[entry.request.id] ?? null;
      const asRequester = entry.request.requesterId === userId;
      if (asRequester && entry.listing?.ownerFirstName) {
        entry.otherName = entry.listing.ownerFirstName;
        return;
      }
      const otherId = asRequester ? entry.listing?.ownerId : entry.request.requesterId;
      entry.otherName = otherId ? await nameOf(otherId) : null;
    }),
  );
}

import { MessageError, type MessageErrorCode } from '../entities/MessageError.ts';
import type { RequestMessage } from '../entities/RequestMessage';
import type { MessageRepository } from './MessageRepository';

/** Conversa em memória para testes e prévias. `closed` simula a RLS de negociação encerrada. */
export function createMemoryMessageRepository(
  currentUserId: string,
  initial: RequestMessage[] = [],
  names: Record<string, string> = {},
) {
  const messages = [...initial];
  const closed = new Set<string>();
  let failure: MessageErrorCode | null = null;
  let clock = Date.UTC(2026, 9, 3, 12, 0);

  const repository: MessageRepository = {
    async listByRequest(requestId) {
      if (failure) throw new MessageError(failure);
      return messages
        .filter((m) => m.requestId === requestId)
        .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    },
    async send(requestId, body) {
      if (failure) throw new MessageError(failure);
      if (closed.has(requestId)) throw new MessageError('closed');
      clock += 60_000;
      const message: RequestMessage = {
        id: `msg-${messages.length + 1}`,
        requestId,
        senderId: currentUserId,
        body,
        createdAt: new Date(clock).toISOString(),
      };
      messages.push(message);
      return message;
    },
    async latestByRequest(requestIds) {
      if (failure) throw new MessageError(failure);
      const latest: Record<string, RequestMessage> = {};
      for (const m of messages) {
        if (!requestIds.includes(m.requestId)) continue;
        const current = latest[m.requestId];
        if (!current || current.createdAt < m.createdAt) latest[m.requestId] = m;
      }
      return latest;
    },
    async firstName(userId) {
      return names[userId] ?? null;
    },
  };

  return {
    repository,
    all: () => [...messages],
    close: (requestId: string) => closed.add(requestId),
    fail: (code: MessageErrorCode | null) => {
      failure = code;
    },
  };
}

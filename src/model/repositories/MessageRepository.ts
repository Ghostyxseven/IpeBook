import type { RequestMessage } from '../entities/RequestMessage';

export interface MessageRepository {
  /** A conversa de uma negociação, da mais antiga para a mais nova. */
  listByRequest(requestId: string): Promise<RequestMessage[]>;
  send(requestId: string, body: string): Promise<RequestMessage>;
  /** A última mensagem de cada negociação, para a lista de Conversas. */
  latestByRequest(requestIds: string[]): Promise<Record<string, RequestMessage>>;
  /** Primeiro nome de quem participa da conversa; `null` quando não há nome. */
  firstName(userId: string): Promise<string | null>;
}

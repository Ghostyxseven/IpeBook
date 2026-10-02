import { BookRequest, RequestStatus } from '../entities/BookRequest';

export interface BookRequestRepository {
  /** Cria uma nova solicitação de negociação (requesterId é definido pelo repositório/RLS). */
  createRequest(
    request: Omit<BookRequest, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'requesterId'>,
  ): Promise<BookRequest>;

  /** Busca uma solicitação pelo ID; lança BookRequestError('not_found') se não existir. */
  getRequestById(id: string): Promise<BookRequest>;

  /** Lista solicitações enviadas pelo usuário atual */
  getRequestsByRequester(requesterId: string): Promise<BookRequest[]>;

  /** Lista solicitações recebidas (onde o usuário atual é dono do anúncio) */
  getRequestsByOwner(ownerId: string): Promise<BookRequest[]>;

  /** Atualiza o status da solicitação (ex: aceitar, recusar, cancelar, concluir) */
  updateRequestStatus(id: string, newStatus: RequestStatus): Promise<BookRequest>;
}

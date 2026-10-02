import { BookRequest, RequestStatus } from '../entities/BookRequest';

export interface BookRequestRepository {
  /** Cria uma nova solicitação de negociação */
  createRequest(request: Omit<BookRequest, 'id' | 'createdAt' | 'updatedAt' | 'status'>): Promise<BookRequest>;
  
  /** Busca uma solicitação pelo ID */
  getRequestById(id: string): Promise<BookRequest | null>;
  
  /** Lista solicitações enviadas pelo usuário atual */
  getRequestsByRequester(requesterId: string): Promise<BookRequest[]>;
  
  /** Lista solicitações recebidas (onde o usuário atual é dono do anúncio) */
  // Note: Requires resolving the owner of the listing, might need joint query or passing ownerId
  getRequestsByOwner(ownerId: string): Promise<BookRequest[]>;

  /** Atualiza o status da solicitação (ex: aceitar, recusar, cancelar, concluir) */
  updateRequestStatus(id: string, newStatus: RequestStatus): Promise<BookRequest>;
}

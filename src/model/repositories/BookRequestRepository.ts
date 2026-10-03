import { BookRequest, RequestStatus } from '../entities/BookRequest';

/** Novo local, dia e horário de um encontro combinado (Figma 06.13). */
export type MeetingChange = Pick<BookRequest, 'publicLocation' | 'meetingDate' | 'meetingTime'>;

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

  /**
   * Muda a situação da solicitação (aceitar, recusar, cancelar, concluir). Quem pode fazer
   * cada mudança e a situação do anúncio são decididos na mesma operação (ADR 0018).
   */
  transitionRequest(id: string, newStatus: RequestStatus): Promise<BookRequest>;

  /** Muda local, dia e horário de um encontro aceito; qualquer um dos dois pode (ADR 0022). */
  reschedule(id: string, meeting: MeetingChange): Promise<BookRequest>;

  /** Primeiro nome de uma pessoa da negociação, ou `null` quando o banco não sabe. */
  personFirstName(userId: string): Promise<string | null>;
}

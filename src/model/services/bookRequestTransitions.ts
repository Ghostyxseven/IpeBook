import type { Listing, ListingStatus } from '../entities/Listing';
import type { RequestStatus } from '../entities/BookRequest';
import { BookRequestError } from '../entities/BookRequestError.ts';

/**
 * Transições permitidas de status da solicitação.
 * pending:
 *   - dono pode aceitar (accepted), recusar (rejected)
 *   - requerente pode cancelar (canceled)
 * accepted:
 *   - dono OU requerente podem cancelar (canceled)
 *   - DONO confirma conclusão (completed) — solução mais simples (decisão registrada no relatório)
 * rejected / canceled / completed:
 *   - estados terminais (nenhuma transição permitida)
 */
const transitions: Record<RequestStatus, RequestStatus[]> = {
  pending: ['accepted', 'rejected', 'canceled'],
  accepted: ['canceled', 'completed'],
  rejected: [],
  canceled: [],
  completed: [],
};

export function canTransition(from: RequestStatus, to: RequestStatus): boolean {
  return transitions[from]?.includes(to) ?? false;
}

export function ensureTransition(from: RequestStatus, to: RequestStatus): void {
  if (!canTransition(from, to)) {
    throw new BookRequestError('invalid_transition');
  }
}

/** Quem pode ACCEPT / REJECT? somente o DONO do anúncio. */
export function isOwner(userId: string, listing: { ownerId?: string | null }): boolean {
  return Boolean(listing?.ownerId && listing.ownerId === userId);
}

/** Quem pode CANCELAR? */
// - Se pending: somente o requerente
// - Se accepted: DONO ou REQUERENTE (qualquer um dos dois)
export function canCancel(
  requestStatus: RequestStatus,
  userId: string,
  { requesterId, ownerId }: { requesterId: string; ownerId?: string | null },
): boolean {
  if (requestStatus === 'pending') return userId === requesterId;
  if (requestStatus === 'accepted') {
    return userId === requesterId || userId === ownerId;
  }
  return false;
}

/** Quem pode CONCLUIR (Confirmar conclusão)?
 *  DECISÃO TÉCNICA (mais simples compatível com RLS existente):
 *  - Somente o DONO do anúncio pode marcar como "completed".
 *  Razão: a policy de listings (migration ADR 0008) só permite que o DONO altere status do anúncio.
 *  Para não enfraquecer RLS nem usar security definer desnecessariamente nesta fase,
 *  a ação "Confirmar conclusão" atualiza o listing para "concluido" — portanto só o dono executa.
 *  Esta decisão é reversível na #54 (negociação completa) se houver evidência do Figma contrária.
 */
export function canComplete(
  requestStatus: RequestStatus,
  userId: string,
  { ownerId }: { ownerId?: string | null },
): boolean {
  if (requestStatus !== 'accepted') return false;
  return Boolean(ownerId && userId === ownerId);
}

/** Solicitação só pode ser criada se anúncio estiver DISPONÍVEL, REQUERENTE != DONO. */
export function ensureCanCreate(
  listing: Listing | null | undefined,
  userId: string | null | undefined,
): void {
  if (!userId) throw new BookRequestError('forbidden');
  if (!listing) throw new BookRequestError('not_found');
  if (listing.status !== 'disponivel') throw new BookRequestError('invalid_transition');
  if (listing.ownerId && listing.ownerId === userId) throw new BookRequestError('forbidden');
}

/** Ao aceitar: listing vira "reservado". */
export function listingStatusOnAccept(): ListingStatus {
  return 'reservado';
}

/** Ao concluir: listing vira "concluido". */
export function listingStatusOnComplete(): ListingStatus {
  return 'concluido';
}

/** Ao recusar/cancelar: status de listing atual é mantido (se reservado, volta a disponível? MVP: só deixa como está. Se cancelamento acontecer e estiver reservado, na prática precisa voltar. Vamos tratar:
 *  Se accepted e foi cancelado e listing está reservado -> volta para disponivel.
 *  Senão -> mantém.
 */
export function listingStatusOnCancel(
  currentRequestStatus: RequestStatus,
  currentListingStatus: ListingStatus | null,
): ListingStatus | null {
  if (currentRequestStatus === 'accepted' && currentListingStatus === 'reservado') {
    return 'disponivel';
  }
  return null;
}

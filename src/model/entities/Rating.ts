import type { Modality } from './Listing';

/** O perfil de outra pessoa (Figma 03.04). Só o que a função `public_profile` devolve. */
export type PublicProfile = {
  userId: string;
  /** `null` quando o cadastro não tem nome — a tela usa "Pessoa da comunidade". */
  firstName: string | null;
  /** Data ISO 8601. */
  memberSince: string;
  /** Negociações concluídas, dos dois lados. */
  completedCount: number;
  /** `null` quando ainda não recebeu nota nenhuma. Nunca `0` (ADR 0027). */
  ratingAverage: number | null;
  ratingCount: number;
};

/** Uma avaliação recebida, como aparece na lista da 07.03. */
export type ReceivedRating = {
  id: string;
  authorFirstName: string | null;
  /** De 1 a 5. */
  score: number;
  comment: string | null;
  /** Data ISO 8601. */
  createdAt: string;
};

/** Uma negociação concluída, na tela de histórico. */
export type HistoryEntry = {
  requestId: string;
  listingId: string;
  title: string;
  author: string;
  modality: Modality;
  otherPersonId: string | null;
  otherFirstName: string | null;
  /** `true` quando o livro era meu — muda o verbo na frase ("vendi" / "comprei"). */
  iWasOwner: boolean;
  /** Se já avaliei esta negociação. Uma avaliação por negociação (ADR 0027). */
  rated: boolean;
  /** Data ISO 8601. */
  completedAt: string;
};

export type ReputationErrorCode =
  'not_found' | 'not_allowed' | 'network' | 'not_configured' | 'unknown';

/** Erro de reputação independente do provedor (Supabase fica só no repositório). */
export class ReputationError extends Error {
  readonly code: ReputationErrorCode;
  constructor(code: ReputationErrorCode, cause?: unknown) {
    super(code);
    this.name = 'ReputationError';
    this.code = code;
    this.cause = cause;
  }
}

export function toReputationError(error: unknown): ReputationError {
  return error instanceof ReputationError ? error : new ReputationError('unknown', error);
}

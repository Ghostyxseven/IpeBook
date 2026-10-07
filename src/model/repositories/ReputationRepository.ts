import type { HistoryEntry, PublicProfile, ReceivedRating } from '../entities/Rating';

/** Reputação da comunidade. Todas as operações rejeitam com `ReputationError`. */
export interface ReputationRepository {
  /** O perfil público de alguém (Figma 03.04). Nunca devolve e-mail nem bairro. */
  getPublicProfile(userId: string): Promise<PublicProfile>;
  /** As avaliações que a pessoa recebeu, mais recente primeiro (Figma 07.03). */
  listRatingsReceived(userId: string): Promise<ReceivedRating[]>;
  /** As negociações concluídas de quem está na conta. Sempre as próprias. */
  listMyHistory(): Promise<HistoryEntry[]>;
  /** Avalia o outro lado de uma negociação concluída. Uma vez por negociação. */
  rate(requestId: string, subjectId: string, score: number, comment: string | null): Promise<void>;
}

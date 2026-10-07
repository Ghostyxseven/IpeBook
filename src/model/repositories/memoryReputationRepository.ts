import {
  ReputationError,
  type HistoryEntry,
  type PublicProfile,
  type ReceivedRating,
} from '../entities/Rating.ts';
import type { ReputationRepository } from './ReputationRepository';

/** O dublê dos testes: mesmas regras de recusa, sem Supabase. */
export function createMemoryReputationRepository(
  seed: {
    profiles?: readonly PublicProfile[];
    ratings?: Readonly<Record<string, readonly ReceivedRating[]>>;
    history?: readonly HistoryEntry[];
    failWith?: ReputationError;
  } = {},
): ReputationRepository & { rated: { requestId: string; subjectId: string; score: number }[] } {
  const rated: { requestId: string; subjectId: string; score: number }[] = [];
  const fail = () => {
    if (seed.failWith) throw seed.failWith;
  };

  return {
    rated,
    async getPublicProfile(userId) {
      fail();
      const found = seed.profiles?.find((profile) => profile.userId === userId);
      if (!found) throw new ReputationError('not_found');
      return found;
    },
    async listRatingsReceived(userId) {
      fail();
      return [...(seed.ratings?.[userId] ?? [])];
    },
    async listMyHistory() {
      fail();
      return [...(seed.history ?? [])];
    },
    async rate(requestId, subjectId, score) {
      fail();
      // Uma por negociação, como a `unique (request_id, author_id)` do banco.
      if (rated.some((entry) => entry.requestId === requestId)) {
        throw new ReputationError('not_allowed');
      }
      rated.push({ requestId, subjectId, score });
    },
  };
}

import type { SupabaseClient } from '@supabase/supabase-js';
import type { Modality } from '../entities/Listing';
import {
  ReputationError,
  type HistoryEntry,
  type PublicProfile,
  type ReceivedRating,
} from '../entities/Rating.ts';
import type { ReputationRepository } from './ReputationRepository';

/** Só `rpc` e `from` são usados; facilita testar com um cliente falso. */
export type SupabaseReputationClient = Pick<SupabaseClient, 'rpc' | 'from'>;

export const RATINGS_TABLE = 'ratings';

export function mapSupabaseReputationError(error: unknown): ReputationError {
  if (error instanceof ReputationError) return error;
  const { code, message } = (error ?? {}) as { code?: string; message?: string };
  // PGRST202/PGRST205/42P01/42883: a migração da spec 031 ainda não foi aplicada.
  if (code === 'PGRST202' || code === 'PGRST205' || code === '42P01' || code === '42883') {
    return new ReputationError('not_configured', error);
  }
  // 42501 e 23505: a RLS recusou, ou já existe avaliação desta pessoa nesta negociação.
  if (code === '42501' || code === '23505') return new ReputationError('not_allowed', error);
  if (/fetch|network/i.test(message ?? '')) return new ReputationError('network', error);
  return new ReputationError('unknown', error);
}

type ProfileRow = {
  user_id: string;
  first_name: string | null;
  member_since: string;
  completed_count: number;
  rating_average: number | string | null;
  rating_count: number;
};

type RatingRow = {
  id: string;
  author_first_name: string | null;
  score: number;
  comment: string | null;
  created_at: string;
};

type HistoryRow = {
  request_id: string;
  listing_id: string;
  title: string;
  author: string;
  modality: Modality;
  other_person_id: string | null;
  other_first_name: string | null;
  i_was_owner: boolean;
  rated: boolean;
  completed_at: string;
};

/** `numeric` do Postgres chega como texto no cliente; `null` continua `null`. */
function toAverage(value: number | string | null): number | null {
  if (value === null || value === undefined) return null;
  const parsed = typeof value === 'number' ? value : Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export function createSupabaseReputationRepository(
  client: SupabaseReputationClient | null,
): ReputationRepository {
  const requireClient = () => {
    if (!client) throw new ReputationError('not_configured');
    return client;
  };

  return {
    async getPublicProfile(userId) {
      // Sessão ainda carregando: id vazio não vira requisição malformada ao `uuid`.
      if (!userId) throw new ReputationError('not_found');
      const { data, error } = await requireClient().rpc('public_profile', { person: userId });
      if (error) throw mapSupabaseReputationError(error);
      const row = (data as ProfileRow[] | null)?.[0];
      // A função devolve zero linhas para quem não existe ou excluiu a conta.
      if (!row) throw new ReputationError('not_found');
      return {
        userId: row.user_id,
        firstName: row.first_name,
        memberSince: row.member_since,
        completedCount: row.completed_count ?? 0,
        ratingAverage: toAverage(row.rating_average),
        ratingCount: row.rating_count ?? 0,
      } satisfies PublicProfile;
    },

    async listRatingsReceived(userId) {
      if (!userId) throw new ReputationError('not_found');
      const { data, error } = await requireClient().rpc('ratings_received', { person: userId });
      if (error) throw mapSupabaseReputationError(error);
      return ((data as RatingRow[] | null) ?? []).map((row) => ({
        id: row.id,
        authorFirstName: row.author_first_name,
        score: row.score,
        comment: row.comment,
        createdAt: row.created_at,
      })) satisfies ReceivedRating[];
    },

    async listMyHistory() {
      const { data, error } = await requireClient().rpc('my_history');
      if (error) throw mapSupabaseReputationError(error);
      return ((data as HistoryRow[] | null) ?? []).map((row) => ({
        requestId: row.request_id,
        listingId: row.listing_id,
        title: row.title,
        author: row.author,
        modality: row.modality,
        otherPersonId: row.other_person_id,
        otherFirstName: row.other_first_name,
        iWasOwner: row.i_was_owner,
        rated: row.rated,
        completedAt: row.completed_at,
      })) satisfies HistoryEntry[];
    },

    async rate(requestId, subjectId, score, comment) {
      // `author_id` vem de `auth.uid()` por padrão; quem decide se pode é a RLS
      // com `can_rate` (ADR 0027), não esta chamada.
      const trimmed = comment?.trim();
      const { error } = await requireClient()
        .from(RATINGS_TABLE)
        .insert({
          request_id: requestId,
          subject_id: subjectId,
          score,
          comment: trimmed ? trimmed : null,
        });
      if (error) throw mapSupabaseReputationError(error);
    },
  };
}

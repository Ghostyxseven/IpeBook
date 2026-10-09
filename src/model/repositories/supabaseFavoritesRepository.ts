import type { SupabaseClient } from '@supabase/supabase-js';
import { FavoriteError } from '../entities/FavoriteError.ts';
import type { FavoritesRepository } from './FavoritesRepository.ts';

export type SupabaseFavoritesClient = Pick<SupabaseClient, 'from'>;

const TABLE = 'favorites';

export function mapSupabaseFavoriteError(error: unknown): FavoriteError {
  if (error instanceof FavoriteError) return error;
  const { code, message } = (error ?? {}) as { code?: string; message?: string };
  // PGRST205/42P01: a tabela do ADR 0032 ainda não foi criada neste projeto.
  if (code === 'PGRST205' || code === '42P01') return new FavoriteError('not_configured', error);
  if (/fetch|network/i.test(message ?? '')) return new FavoriteError('network', error);
  return new FavoriteError('unknown', error);
}

export function createSupabaseFavoritesRepository(
  client: SupabaseFavoritesClient | null,
): FavoritesRepository {
  const requireClient = () => {
    if (!client) throw new FavoriteError('not_configured');
    return client;
  };

  return {
    async listFavoriteIds() {
      const { data, error } = await requireClient().from(TABLE).select('listing_id');
      if (error) throw mapSupabaseFavoriteError(error);
      return ((data ?? []) as { listing_id: string }[]).map((row) => row.listing_id);
    },

    async add(listingId) {
      // `upsert` com a chave primária (user_id, listing_id): favoritar duas vezes
      // seguidas não vira erro de duplicidade, só continua favoritado.
      const { error } = await requireClient()
        .from(TABLE)
        .upsert({ listing_id: listingId }, { onConflict: 'user_id,listing_id' });
      if (error) throw mapSupabaseFavoriteError(error);
    },

    async remove(listingId) {
      const { error } = await requireClient().from(TABLE).delete().eq('listing_id', listingId);
      if (error) throw mapSupabaseFavoriteError(error);
    },
  };
}

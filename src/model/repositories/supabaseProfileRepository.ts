import type { SupabaseClient } from '@supabase/supabase-js';
import { ProfileError } from '../entities/Profile.ts';
import { SERVICE_CITY } from '../services/neighborhood.ts';
import type { ProfileRepository } from './ProfileRepository';

/** Só `from` é usado; facilita testar com um cliente falso. */
export type SupabaseProfileClient = Pick<SupabaseClient, 'from'>;

export const PROFILES_TABLE = 'profiles';

export function mapSupabaseProfileError(error: unknown): ProfileError {
  if (error instanceof ProfileError) return error;
  const { code, message } = (error ?? {}) as { code?: string; message?: string };
  // PGRST205/42P01: a migração do perfil ainda não foi aplicada neste projeto.
  if (code === 'PGRST205' || code === '42P01') return new ProfileError('not_configured', error);
  if (/fetch|network/i.test(message ?? '')) return new ProfileError('network', error);
  return new ProfileError('unknown', error);
}

export function createSupabaseProfileRepository(
  client: SupabaseProfileClient | null,
): ProfileRepository {
  const requireClient = () => {
    if (!client) throw new ProfileError('not_configured');
    return client;
  };
  return {
    async getProfile() {
      const { data, error } = await requireClient()
        .from(PROFILES_TABLE)
        .select('neighborhood,city')
        .maybeSingle();
      if (error) throw mapSupabaseProfileError(error);
      const row = data as { neighborhood: string | null; city: string } | null;
      return { neighborhood: row?.neighborhood ?? null, city: row?.city ?? SERVICE_CITY.name };
    },
    async setNeighborhood(neighborhood) {
      // `user_id` vem de `auth.uid()` por padrão e a RLS impede gravar em nome de outra pessoa.
      const { error } = await requireClient()
        .from(PROFILES_TABLE)
        .upsert({ neighborhood }, { onConflict: 'user_id' });
      if (error) throw mapSupabaseProfileError(error);
    },
  };
}

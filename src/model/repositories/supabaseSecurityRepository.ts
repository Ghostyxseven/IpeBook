import type { SupabaseClient } from '@supabase/supabase-js';
import type { SecurityRepository } from './SecurityRepository';
import type { Report } from '../entities/Report';
import type { BlockedPerson, UserBlock } from '../entities/UserBlock';
import { SecurityError } from '../entities/SecurityError.ts';

export type SupabaseSecurityClient = Pick<SupabaseClient, 'from' | 'rpc'>;

type BlockRow = { id: string; blocker_id: string; blocked_id: string; created_at: string };

export function mapSupabaseSecurityError(error: unknown): SecurityError {
  if (error instanceof SecurityError) return error;
  const { code, message } = (error ?? {}) as { code?: string; message?: string };
  // PGRST205/42P01: as tabelas da migração de segurança ainda não existem neste projeto.
  if (code === 'PGRST205' || code === '42P01') return new SecurityError('not_configured', error);
  // 23514/23502: motivo vazio ou denúncia sem alvo; 23503: pessoa ou anúncio que não existe.
  if (code === '23514' || code === '23502' || code === '23503')
    return new SecurityError('invalid', error);
  if (/fetch|network/i.test(message ?? '')) return new SecurityError('network', error);
  return new SecurityError('unknown', error);
}

const toBlock = (row: BlockRow): UserBlock => ({
  id: row.id,
  blockerId: row.blocker_id,
  blockedId: row.blocked_id,
  createdAt: row.created_at,
});

/**
 * Denúncias e bloqueios (spec 027, ADR 0017). A RLS de `user_blocks` só mostra e
 * apaga os bloqueios da própria pessoa, então nenhuma consulta filtra por dono.
 */
export function createSupabaseSecurityRepository(
  supabase: SupabaseSecurityClient | null,
): SecurityRepository {
  const client = () => {
    if (!supabase) throw new SecurityError('not_configured');
    return supabase;
  };

  return {
    async blockUser(blockedId) {
      const { data, error } = await client()
        .from('user_blocks')
        .insert({ blocked_id: blockedId })
        .select()
        .single();
      if (!error) return toBlock(data as BlockRow);
      // 23505: já estava bloqueada. Para quem tocou em "Bloquear", deu certo.
      if ((error as { code?: string }).code === '23505') {
        const existing = await client()
          .from('user_blocks')
          .select('*')
          .eq('blocked_id', blockedId)
          .single();
        if (!existing.error) return toBlock(existing.data as BlockRow);
      }
      throw mapSupabaseSecurityError(error);
    },

    async unblockUser(blockedId) {
      const { error } = await client().from('user_blocks').delete().eq('blocked_id', blockedId);
      if (error) throw mapSupabaseSecurityError(error);
    },

    async listBlocked() {
      const { data, error } = await client()
        .from('user_blocks')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw mapSupabaseSecurityError(error);
      const rows = (data ?? []) as BlockRow[];
      // Só o primeiro nome, pela mesma função do catálogo; sem ela, a linha fica sem nome.
      return Promise.all(
        rows.map(async (row): Promise<BlockedPerson> => {
          const named = await client().rpc('listing_owner_first_name', { owner: row.blocked_id });
          return {
            blockedId: row.blocked_id,
            firstName: !named.error && typeof named.data === 'string' ? named.data : null,
            createdAt: row.created_at,
          };
        }),
      );
    },

    async createReport(target, reason, details = null): Promise<Report> {
      const { data, error } = await client()
        .from('reports')
        .insert({
          reported_user_id: target.userId,
          reported_listing_id: target.listingId,
          reason,
          details,
        })
        .select()
        .single();
      if (error) throw mapSupabaseSecurityError(error);
      return {
        id: data.id,
        reporterId: data.reporter_id,
        reportedUserId: data.reported_user_id,
        reportedListingId: data.reported_listing_id,
        reason: data.reason,
        details: data.details,
        status: data.status,
        createdAt: data.created_at,
      };
    },
  };
}

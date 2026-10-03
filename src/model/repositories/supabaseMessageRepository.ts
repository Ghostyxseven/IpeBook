import type { SupabaseClient } from '@supabase/supabase-js';
import { MessageError } from '../entities/MessageError.ts';
import type { RequestMessage } from '../entities/RequestMessage';
import type { MessageRepository } from './MessageRepository';

export type SupabaseMessageClient = Pick<SupabaseClient, 'from' | 'rpc'>;

type Row = { id: string; request_id: string; sender_id: string; body: string; created_at: string };

export function mapSupabaseMessageError(error: unknown): MessageError {
  if (error instanceof MessageError) return error;
  const { code, message } = (error ?? {}) as { code?: string; message?: string };
  // PGRST205/42P01: a tabela da migração da conversa ainda não existe neste projeto.
  if (code === 'PGRST205' || code === '42P01') return new MessageError('not_configured', error);
  // 42501: a RLS recusou o envio (negociação encerrada ou de outra pessoa).
  if (code === '42501') return new MessageError('closed', error);
  if (code === '23514' || code === '23502') return new MessageError('invalid', error);
  if (/fetch|network/i.test(message ?? '')) return new MessageError('network', error);
  return new MessageError('unknown', error);
}

const toMessage = (row: Row): RequestMessage => ({
  id: row.id,
  requestId: row.request_id,
  senderId: row.sender_id,
  body: row.body,
  createdAt: row.created_at,
});

/** Conversa da negociação em `request_messages` (ADR 0021). A RLS limita aos dois lados. */
export function createSupabaseMessageRepository(
  supabase: SupabaseMessageClient | null,
): MessageRepository {
  const client = () => {
    if (!supabase) throw new MessageError('not_configured');
    return supabase;
  };

  return {
    async listByRequest(requestId) {
      const { data, error } = await client()
        .from('request_messages')
        .select('*')
        .eq('request_id', requestId)
        .order('created_at', { ascending: true })
        .limit(500);
      if (error) throw mapSupabaseMessageError(error);
      return ((data ?? []) as Row[]).map(toMessage);
    },

    async send(requestId, body) {
      const { data, error } = await client()
        .from('request_messages')
        .insert({ request_id: requestId, body })
        .select()
        .single();
      if (error) throw mapSupabaseMessageError(error);
      return toMessage(data as Row);
    },

    async latestByRequest(requestIds) {
      if (requestIds.length === 0) return {};
      const { data, error } = await client()
        .from('request_messages')
        .select('*')
        .in('request_id', requestIds)
        .order('created_at', { ascending: false })
        .limit(500);
      if (error) throw mapSupabaseMessageError(error);
      const latest: Record<string, RequestMessage> = {};
      for (const row of (data ?? []) as Row[]) {
        if (!latest[row.request_id]) latest[row.request_id] = toMessage(row);
      }
      return latest;
    },

    async firstName(userId) {
      const { data, error } = await client().rpc('listing_owner_first_name', { owner: userId });
      return !error && typeof data === 'string' ? data : null;
    },
  };
}

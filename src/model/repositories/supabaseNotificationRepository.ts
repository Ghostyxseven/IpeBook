import type { SupabaseClient } from '@supabase/supabase-js';
import type { AppNotification, NotificationKind } from '../entities/Notification.ts';
import { NotificationError } from '../entities/NotificationError.ts';
import {
  defaultNotificationPreferences,
  type NotificationPreferences,
} from '../entities/NotificationPreferences.ts';
import { NOTIFICATION_KINDS } from '../entities/Notification.ts';
import type { NotificationRepository } from './NotificationRepository';

/** Só `from` é usado; facilita testar com um cliente falso. */
export type SupabaseNotificationClient = Pick<SupabaseClient, 'from'>;

export const NOTIFICATIONS_TABLE = 'notifications';
export const PREFERENCES_TABLE = 'notification_preferences';

const columns = 'id,kind,title,body,target_listing_id,read_at,created_at';

type Row = {
  id: string;
  kind: NotificationKind;
  title: string;
  body: string | null;
  target_listing_id: string | null;
  read_at: string | null;
  created_at: string;
};

export function mapSupabaseNotificationError(error: unknown): NotificationError {
  if (error instanceof NotificationError) return error;
  const { code, message } = (error ?? {}) as { code?: string; message?: string };
  // PGRST205/42P01: a migração do ADR 0011 ainda não foi aplicada neste projeto.
  if (code === 'PGRST205' || code === '42P01')
    return new NotificationError('not_configured', error);
  if (/fetch|network/i.test(message ?? '')) return new NotificationError('network', error);
  return new NotificationError('unknown', error);
}

/** Valor entre aspas para o filtro `or` do PostgREST aceitar vírgulas e parênteses. */
const quoted = (value: string) => `"${value.replace(/["\\]/g, (char) => `\\${char}`)}"`;

const toNotification = (row: Row): AppNotification => ({
  id: row.id,
  kind: row.kind,
  title: row.title,
  body: row.body ?? '',
  targetListingId: row.target_listing_id,
  readAt: row.read_at,
  createdAt: row.created_at,
});

export function createSupabaseNotificationRepository(
  client: SupabaseNotificationClient | null,
): NotificationRepository {
  const requireClient = () => {
    if (!client) throw new NotificationError('not_configured');
    return client;
  };

  return {
    async list({ cursor, limit }) {
      let request = requireClient().from(NOTIFICATIONS_TABLE).select(columns);
      if (cursor) {
        const at = quoted(cursor.createdAt);
        request = request.or(
          `created_at.lt.${at},and(created_at.eq.${at},id.lt.${quoted(cursor.id)})`,
        );
      }
      // Pede um a mais para saber se existe próxima página. A RLS limita às linhas da pessoa.
      const { data, error } = await request
        .order('created_at', { ascending: false })
        .order('id', { ascending: false })
        .limit(limit + 1);
      if (error) throw mapSupabaseNotificationError(error);
      const rows = (data ?? []) as unknown as Row[];
      const items = rows.slice(0, limit).map(toNotification);
      const last = items[items.length - 1];
      return {
        items,
        nextCursor: rows.length > limit && last ? { createdAt: last.createdAt, id: last.id } : null,
      };
    },
    async unreadCount() {
      const { count, error } = await requireClient()
        .from(NOTIFICATIONS_TABLE)
        .select('id', { count: 'exact', head: true })
        .is('read_at', null);
      if (error) throw mapSupabaseNotificationError(error);
      return count ?? 0;
    },
    async markRead(id) {
      const { error } = await requireClient()
        .from(NOTIFICATIONS_TABLE)
        .update({ read_at: new Date().toISOString() })
        .eq('id', id)
        .is('read_at', null);
      if (error) throw mapSupabaseNotificationError(error);
    },
    async markAllRead() {
      const { error } = await requireClient()
        .from(NOTIFICATIONS_TABLE)
        .update({ read_at: new Date().toISOString() })
        .is('read_at', null);
      if (error) throw mapSupabaseNotificationError(error);
    },
    async getPreferences() {
      const { data, error } = await requireClient()
        .from(PREFERENCES_TABLE)
        .select(NOTIFICATION_KINDS.join(','))
        .maybeSingle();
      if (error) throw mapSupabaseNotificationError(error);
      // Sem linha, tudo fica ligado.
      const stored = (data ?? {}) as unknown as Partial<NotificationPreferences>;
      const preferences = defaultNotificationPreferences();
      for (const kind of NOTIFICATION_KINDS) {
        if (typeof stored[kind] === 'boolean') preferences[kind] = stored[kind];
      }
      return preferences;
    },
    async setPreference(kind, enabled) {
      // `user_id` vem de `auth.uid()` por padrão e a RLS impede gravar em nome de outra pessoa.
      const { error } = await requireClient()
        .from(PREFERENCES_TABLE)
        .upsert({ [kind]: enabled } as Partial<NotificationPreferences>, { onConflict: 'user_id' });
      if (error) throw mapSupabaseNotificationError(error);
    },
  };
}

import type { AppNotification, NotificationKind } from '../entities/Notification';
import { NotificationError, type NotificationErrorCode } from '../entities/NotificationError.ts';
import {
  defaultNotificationPreferences,
  type NotificationPreferences,
} from '../entities/NotificationPreferences.ts';
import type { NotificationCursor, NotificationRepository } from './NotificationRepository';

const newestFirst = (a: AppNotification, b: AppNotification) =>
  b.createdAt.localeCompare(a.createdAt) || b.id.localeCompare(a.id);

const isAfter = (item: AppNotification, cursor: NotificationCursor) =>
  item.createdAt < cursor.createdAt || (item.createdAt === cursor.createdAt && item.id < cursor.id);

/** Avisos em memória para testes; `fail` simula o próximo erro do servidor. */
export function createMemoryNotificationRepository(
  initial: AppNotification[] = [],
  now: () => string = () => new Date().toISOString(),
) {
  const notifications = [...initial];
  let preferences: NotificationPreferences = defaultNotificationPreferences();
  const calls: string[] = [];
  let nextError: NotificationError | null = null;
  let delay: Promise<void> | null = null;

  const enter = async (call: string) => {
    calls.push(call);
    if (delay) await delay;
    const error = nextError;
    nextError = null;
    if (error) throw error;
  };

  const repository: NotificationRepository = {
    async list({ cursor, limit }) {
      await enter(`list:${JSON.stringify({ cursor, limit })}`);
      const remaining = [...notifications]
        .sort(newestFirst)
        .filter((item) => !cursor || isAfter(item, cursor));
      const items = remaining.slice(0, limit).map((item) => ({ ...item }));
      const last = items[items.length - 1];
      return {
        items,
        nextCursor:
          remaining.length > limit && last ? { createdAt: last.createdAt, id: last.id } : null,
      };
    },
    async unreadCount() {
      await enter('unreadCount');
      return notifications.filter((item) => item.readAt === null).length;
    },
    async markRead(id) {
      await enter(`markRead:${id}`);
      const item = notifications.find((candidate) => candidate.id === id);
      if (item && item.readAt === null) item.readAt = now();
    },
    async markAllRead() {
      await enter('markAllRead');
      for (const item of notifications) if (item.readAt === null) item.readAt = now();
    },
    async getPreferences() {
      await enter('getPreferences');
      return { ...preferences };
    },
    async setPreference(kind, enabled) {
      await enter(`setPreference:${kind}:${enabled}`);
      preferences = { ...preferences, [kind]: enabled };
    },
  };

  return {
    repository,
    calls,
    add: (...items: AppNotification[]) => notifications.push(...items),
    preferences: () => ({ ...preferences }) as Record<NotificationKind, boolean>,
    fail: (code: NotificationErrorCode) => {
      nextError = new NotificationError(code);
    },
    /** Segura as próximas respostas até a promessa resolver. */
    hold: (until: Promise<void> | null) => {
      delay = until;
    },
  };
}

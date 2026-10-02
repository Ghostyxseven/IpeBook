import type { AppNotification, NotificationKind } from '../entities/Notification';
import type { NotificationPreferences } from '../entities/NotificationPreferences';

/** Posição do último aviso carregado; a próxima página começa logo depois dele. */
export type NotificationCursor = { createdAt: string; id: string };

export type NotificationPage = {
  items: AppNotification[];
  nextCursor: NotificationCursor | null;
};

/**
 * Contrato dos avisos da pessoa autenticada (ADR 0011).
 * Lista só os próprios avisos, dos mais recentes aos mais antigos.
 * Todas as operações rejeitam com `NotificationError` (ver entities/NotificationError.ts).
 */
export interface NotificationRepository {
  list(params: { cursor: NotificationCursor | null; limit: number }): Promise<NotificationPage>;
  unreadCount(): Promise<number>;
  markRead(id: string): Promise<void>;
  markAllRead(): Promise<void>;
  getPreferences(): Promise<NotificationPreferences>;
  setPreference(kind: NotificationKind, enabled: boolean): Promise<void>;
}

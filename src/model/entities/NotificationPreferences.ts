import { NOTIFICATION_KINDS, type NotificationKind } from './Notification.ts';

/** Um booleano por tipo de aviso: `false` impede a criação de novos avisos desse tipo. */
export type NotificationPreferences = Record<NotificationKind, boolean>;

export const defaultNotificationPreferences = (): NotificationPreferences =>
  Object.fromEntries(NOTIFICATION_KINDS.map((kind) => [kind, true])) as NotificationPreferences;

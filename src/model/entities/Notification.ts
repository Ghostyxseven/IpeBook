export const NOTIFICATION_KINDS = [
  'request_received',
  'request_accepted',
  'request_declined',
  'listing_reserved',
  'deal_completed',
] as const;

export type NotificationKind = (typeof NOTIFICATION_KINDS)[number];

/** Aviso dentro do aplicativo (ADR 0011). `readAt` é `null` enquanto não foi lido. */
export type AppNotification = {
  id: string;
  kind: NotificationKind;
  title: string;
  body: string;
  targetListingId: string | null;
  readAt: string | null;
  createdAt: string;
};

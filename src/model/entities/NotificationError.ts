export type NotificationErrorCode = 'network' | 'not_configured' | 'unknown';

/** Erro das notificações independente do provedor (Supabase fica só no repositório). */
export class NotificationError extends Error {
  readonly code: NotificationErrorCode;
  constructor(code: NotificationErrorCode, cause?: unknown) {
    super(code);
    this.name = 'NotificationError';
    this.code = code;
    this.cause = cause;
  }
}

export function toNotificationError(error: unknown): NotificationError {
  return error instanceof NotificationError ? error : new NotificationError('unknown', error);
}

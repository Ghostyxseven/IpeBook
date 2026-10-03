export type MessageErrorCode =
  | 'invalid'
  /** A negociação foi encerrada ou a pessoa não participa dela (RLS). */
  | 'closed'
  | 'network'
  | 'not_configured'
  | 'unknown';

/** Erro da conversa independente do provedor (Supabase fica só no repositório). */
export class MessageError extends Error {
  readonly code: MessageErrorCode;
  constructor(code: MessageErrorCode, cause?: unknown) {
    super(code);
    this.name = 'MessageError';
    this.code = code;
    this.cause = cause;
  }
}

export function toMessageError(error: unknown): MessageError {
  return error instanceof MessageError ? error : new MessageError('unknown', error);
}

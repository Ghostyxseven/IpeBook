export type BookRequestErrorCode =
  | 'not_found'
  | 'invalid_transition'
  | 'forbidden'
  | 'already_exists'
  | 'network'
  | 'not_configured'
  | 'unknown';

/** Erro de negociação independente do provedor (Supabase fica só no repositório). */
export class BookRequestError extends Error {
  readonly code: BookRequestErrorCode;
  constructor(code: BookRequestErrorCode, cause?: unknown) {
    super(code);
    this.name = 'BookRequestError';
    this.code = code;
    this.cause = cause;
  }
}

export function toBookRequestError(error: unknown): BookRequestError {
  return error instanceof BookRequestError ? error : new BookRequestError('unknown', error);
}

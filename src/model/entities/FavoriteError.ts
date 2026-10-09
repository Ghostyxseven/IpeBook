export type FavoriteErrorCode = 'network' | 'not_configured' | 'unknown';

/** Erro de favoritos independente do provedor (Supabase fica só no repositório). */
export class FavoriteError extends Error {
  readonly code: FavoriteErrorCode;
  constructor(code: FavoriteErrorCode, cause?: unknown) {
    super(code);
    this.name = 'FavoriteError';
    this.code = code;
    this.cause = cause;
  }
}

export function toFavoriteError(error: unknown): FavoriteError {
  return error instanceof FavoriteError ? error : new FavoriteError('unknown', error);
}

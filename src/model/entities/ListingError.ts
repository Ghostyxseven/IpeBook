export type ListingErrorCode =
  | 'invalid'
  | 'not_found'
  /** Anúncio reservado ou concluído: a negociação mandou nele (spec 025). */
  | 'not_allowed'
  | 'network'
  | 'not_configured'
  | 'unknown';

/** Erro dos anúncios independente do provedor (Supabase fica só no repositório). */
export class ListingError extends Error {
  readonly code: ListingErrorCode;
  constructor(code: ListingErrorCode, cause?: unknown) {
    super(code);
    this.name = 'ListingError';
    this.code = code;
    this.cause = cause;
  }
}

export function toListingError(error: unknown): ListingError {
  return error instanceof ListingError ? error : new ListingError('unknown', error);
}

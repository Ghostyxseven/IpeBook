export type CatalogErrorCode = 'not_found' | 'network' | 'not_configured' | 'unknown';

/** Erro do catálogo independente do provedor (Supabase fica só no repositório). */
export class CatalogError extends Error {
  readonly code: CatalogErrorCode;
  constructor(code: CatalogErrorCode, cause?: unknown) {
    super(code);
    this.name = 'CatalogError';
    this.code = code;
    this.cause = cause;
  }
}

export function toCatalogError(error: unknown): CatalogError {
  return error instanceof CatalogError ? error : new CatalogError('unknown', error);
}

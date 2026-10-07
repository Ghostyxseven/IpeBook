import type { ListingDraft } from './Listing';

/**
 * Um anúncio pela metade, guardado no aparelho (ADR 0028).
 *
 * Guarda o texto e não a foto: a foto escolhida são alguns megabytes de bytes
 * crus, e `localStorage` é o lugar errado para isso. Quem retoma escolhe a foto
 * de novo, e a tela avisa.
 */
export type DraftRecord = {
  id: string;
  draft: ListingDraft;
  /** Data ISO 8601. Ordena a lista, mais recente primeiro. */
  savedAt: string;
};

export type DraftErrorCode = 'storage' | 'not_found' | 'unknown';

export class DraftError extends Error {
  readonly code: DraftErrorCode;
  constructor(code: DraftErrorCode, cause?: unknown) {
    super(code);
    this.name = 'DraftError';
    this.code = code;
    this.cause = cause;
  }
}

export function toDraftError(error: unknown): DraftError {
  return error instanceof DraftError ? error : new DraftError('unknown', error);
}

/** O livro que a base pública conhece pelo ISBN (ADR 0026). */
export type BookLookup = {
  /** Sempre o ISBN-13 normalizado, mesmo quando a pessoa digitou um ISBN-10. */
  isbn: string;
  title: string;
  /** Vazio quando a base não traz autoria — acontece, e não é erro. */
  author: string;
};

export type BookLookupErrorCode =
  /** O código não passa no dígito verificador. Morre antes da rede. */
  | 'invalid_isbn'
  /** O código é válido, mas a base não conhece esta edição. */
  | 'not_found'
  | 'network'
  | 'unknown';

/** Erro da consulta por ISBN, independente de qual base responde. */
export class BookLookupError extends Error {
  readonly code: BookLookupErrorCode;
  constructor(code: BookLookupErrorCode, cause?: unknown) {
    super(code);
    this.name = 'BookLookupError';
    this.code = code;
    this.cause = cause;
  }
}

export function toBookLookupError(error: unknown): BookLookupError {
  return error instanceof BookLookupError ? error : new BookLookupError('unknown', error);
}

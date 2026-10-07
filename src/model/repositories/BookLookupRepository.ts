import type { BookLookup } from '../entities/BookLookup';

/** Consulta de livro por ISBN. Rejeita com `BookLookupError` (ADR 0026). */
export interface BookLookupRepository {
  /**
   * O livro daquele ISBN. Rejeita com `invalid_isbn` sem tocar a rede quando o
   * dígito verificador não fecha, e com `not_found` quando a base não conhece.
   */
  findByIsbn(isbn: string): Promise<BookLookup>;
}

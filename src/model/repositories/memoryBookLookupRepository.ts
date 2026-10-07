import { BookLookupError, type BookLookup } from '../entities/BookLookup.ts';
import { isValidIsbn, toIsbn13 } from '../services/isbn.ts';
import type { BookLookupRepository } from './BookLookupRepository';

/** O dublê dos testes: mesma regra de validação, sem rede. */
export function createMemoryBookLookupRepository(
  books: readonly BookLookup[] = [],
  options: { failWith?: BookLookupError } = {},
): BookLookupRepository & { calls: string[] } {
  const calls: string[] = [];
  return {
    calls,
    async findByIsbn(isbn) {
      if (!isValidIsbn(isbn)) throw new BookLookupError('invalid_isbn');
      const isbn13 = toIsbn13(isbn);
      if (!isbn13) throw new BookLookupError('invalid_isbn');
      // Registrado depois da validação: é assim que o teste prova que código
      // torto não chega a consultar nada.
      calls.push(isbn13);
      if (options.failWith) throw options.failWith;
      const found = books.find((book) => book.isbn === isbn13);
      if (!found) throw new BookLookupError('not_found');
      return found;
    },
  };
}

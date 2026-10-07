import { BookLookupError, type BookLookup } from '../entities/BookLookup.ts';
import { isValidIsbn, toIsbn13 } from '../services/isbn.ts';
import type { BookLookupRepository } from './BookLookupRepository';

/**
 * Open Library (ADR 0026): sem chave, com CORS e de domínio público.
 *
 * `jscmd=data` devolve um objeto com uma chave por bibkey pedido. Edição
 * desconhecida não é erro HTTP — a resposta é `{}`, e é por isso que o código
 * abaixo checa a chave em vez de checar o status.
 */
const ENDPOINT = 'https://openlibrary.org/api/books';

/** Oito segundos: além disso a pessoa já desistiu e está digitando à mão. */
const TIMEOUT_MS = 8000;

type OpenLibraryBook = {
  title?: unknown;
  authors?: unknown;
};

/** "Antoine de Saint-Exupéry, Outro Autor" — a base devolve uma lista. */
function authorsOf(book: OpenLibraryBook): string {
  if (!Array.isArray(book.authors)) return '';
  return book.authors
    .map((author) => (author as { name?: unknown } | null)?.name)
    .filter((name): name is string => typeof name === 'string' && name.trim().length > 0)
    .join(', ');
}

export function createOpenLibraryBookLookupRepository(
  fetchImpl: typeof fetch = globalThis.fetch,
): BookLookupRepository {
  return {
    async findByIsbn(isbn) {
      // Validação local primeiro: um código torto não vira requisição (ADR 0026).
      if (!isValidIsbn(isbn)) throw new BookLookupError('invalid_isbn');
      const isbn13 = toIsbn13(isbn);
      if (!isbn13) throw new BookLookupError('invalid_isbn');

      const key = `ISBN:${isbn13}`;
      const url = `${ENDPOINT}?bibkeys=${encodeURIComponent(key)}&format=json&jscmd=data`;

      let payload: Record<string, OpenLibraryBook>;
      try {
        const response = await fetchImpl(url, {
          headers: { accept: 'application/json' },
          signal: AbortSignal.timeout(TIMEOUT_MS),
        });
        if (!response.ok) throw new BookLookupError('network');
        payload = (await response.json()) as Record<string, OpenLibraryBook>;
      } catch (cause) {
        if (cause instanceof BookLookupError) throw cause;
        // Timeout, DNS, offline e JSON quebrado caem todos aqui: do ponto de
        // vista de quem está anunciando, é tudo "não deu para consultar".
        throw new BookLookupError('network', cause);
      }

      const book = payload?.[key];
      const title = typeof book?.title === 'string' ? book.title.trim() : '';
      if (!title) throw new BookLookupError('not_found');

      return { isbn: isbn13, title, author: authorsOf(book) } satisfies BookLookup;
    },
  };
}

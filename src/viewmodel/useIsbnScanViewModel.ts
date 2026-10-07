import { useCallback, useRef, useState } from 'react';
import type { BookLookup } from '../model/entities/BookLookup';
import { toBookLookupError } from '../model/entities/BookLookup.ts';
import type { BookLookupRepository } from '../model/repositories/BookLookupRepository';
import { bookLookupErrorMessage } from '../model/services/bookLookupMessages.ts';
import { isBooklandEan, normalizeIsbn } from '../model/services/isbn.ts';

/**
 * Os quatro quadros do Figma são estados desta máquina, não rotas:
 *
 * - `scanning`  → 04.02 Ler ISBN (visor da câmera)
 * - `typing`    → 04.02 com o campo ISBN, para quem não tem câmera
 * - `looking-up`→ 04.02 com o visor travado enquanto a consulta acontece
 * - `found`     → 04.03 Livro identificado
 * - `not-found` → 04.18 ISBN não encontrado
 * - `denied`    → 04.17 Câmera não permitida
 */
export type IsbnScanStatus =
  'scanning' | 'typing' | 'looking-up' | 'found' | 'not-found' | 'denied';

export function useIsbnScanViewModel(repository: BookLookupRepository) {
  const [status, setStatus] = useState<IsbnScanStatus>('scanning');
  const [book, setBook] = useState<BookLookup | null>(null);
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const requestId = useRef(0);

  const lookup = useCallback(
    async (raw: string) => {
      const value = normalizeIsbn(raw);
      const current = ++requestId.current;
      setCode(value);
      setError(null);
      setStatus('looking-up');
      try {
        const found = await repository.findByIsbn(value);
        // Resposta velha: a pessoa já leu outro código enquanto esta vinha.
        if (current !== requestId.current) return;
        setBook(found);
        setStatus('found');
      } catch (cause) {
        if (current !== requestId.current) return;
        setBook(null);
        setError(bookLookupErrorMessage(toBookLookupError(cause).code));
        setStatus('not-found');
      }
    },
    [repository],
  );

  /**
   * O que a câmera entrega, quadro a quadro.
   *
   * Dois filtros, nesta ordem: só reage quando está lendo (senão a consulta em
   * andamento seria atropelada por uma leitura do mesmo código no quadro
   * seguinte), e só aceita EAN-13 de livro — o leitor devolve qualquer código
   * de barras que entre no visor, inclusive o da embalagem ao lado.
   */
  const onBarcode = useCallback(
    (raw: string) => {
      if (status !== 'scanning') return;
      if (!isBooklandEan(raw)) return;
      void lookup(raw);
    },
    [status, lookup],
  );

  /** "Digitar o ISBN" da 04.02 e "Preencher manualmente" que volta ao campo. */
  const typeManually = useCallback(() => {
    requestId.current += 1;
    setError(null);
    setStatus('typing');
  }, []);

  /** "Ler novamente" da 04.18 e "Tentar novamente" da 04.17. */
  const scanAgain = useCallback(() => {
    requestId.current += 1;
    setBook(null);
    setError(null);
    setStatus('scanning');
  }, []);

  /** O envio do campo ISBN. Vazio não vira consulta. */
  const submitTyped = useCallback(() => {
    if (normalizeIsbn(code).length === 0) return;
    void lookup(code);
  }, [code, lookup]);

  /** A permissão de câmera foi negada: 04.17. */
  const cameraDenied = useCallback(() => {
    setStatus((previous) => (previous === 'scanning' ? 'denied' : previous));
  }, []);

  return {
    status,
    book,
    code,
    error,
    setCode,
    onBarcode,
    submitTyped,
    typeManually,
    scanAgain,
    cameraDenied,
  };
}

import { useState } from 'react';
import type { ReadingMode } from '../model/entities/BookExperience';
import {
  defaultReadingMode,
  parseReadingMode,
  readingModes,
  readingModeStorageKey,
} from '../model/services/bookExperience.ts';

function storedMode(): ReadingMode | null {
  try {
    return parseReadingMode(window.localStorage.getItem(readingModeStorageKey));
  } catch {
    return null; // armazenamento bloqueado ou indisponível
  }
}

/**
 * A preferência só é gravada quando o visitante escolhe um modo (nunca ao abrir a página).
 * Sem escolha anterior, o modo vem da preferência de movimento reduzido do sistema.
 */
export function useReadingMode() {
  const [mode, setModeState] = useState<ReadingMode>(
    () =>
      (typeof window !== 'undefined' ? storedMode() : null) ??
      defaultReadingMode(
        typeof window !== 'undefined' &&
          typeof window.matchMedia === 'function' &&
          window.matchMedia('(prefers-reduced-motion: reduce)').matches,
      ),
  );
  const setMode = (next: ReadingMode) => {
    setModeState(next);
    try {
      window.localStorage.setItem(readingModeStorageKey, next);
    } catch {
      // sem armazenamento, a escolha vale só nesta visita
    }
  };
  return { mode, setMode, readingModes, isBook: mode === 'livro' };
}

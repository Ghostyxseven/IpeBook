import { useState } from 'react';
import type { ReadingMode } from '../model/entities/BookExperience';
import { defaultReadingMode, readingModes } from '../model/services/bookExperience.ts';

/** A escolha vale só enquanto a página está aberta; nada é salvo no navegador. */
export function useReadingMode() {
  const [mode, setMode] = useState<ReadingMode>(() =>
    defaultReadingMode(
      typeof window !== 'undefined' &&
        typeof window.matchMedia === 'function' &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    ),
  );
  return { mode, setMode, readingModes, isBook: mode === 'livro' };
}

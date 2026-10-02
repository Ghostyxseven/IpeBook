import { useState } from 'react';
import type { ReadingMode } from '../model/entities/BookExperience';
import type { ReadingModeRepository } from '../model/repositories/readingModeRepository';
import { defaultReadingMode, readingModes } from '../model/services/bookExperience.ts';

/**
 * A preferência só é gravada quando o visitante escolhe um modo (nunca ao abrir a página).
 * Sem escolha anterior, o modo vem da preferência de movimento reduzido do sistema.
 */
export function useReadingMode(
  repository: ReadingModeRepository,
  options: { prefersReducedMotion: boolean },
) {
  const [mode, setModeState] = useState<ReadingMode>(
    () => repository.load() ?? defaultReadingMode(options.prefersReducedMotion),
  );
  const setMode = (next: ReadingMode) => {
    setModeState(next);
    repository.save(next);
  };
  return { mode, setMode, readingModes, isBook: mode === 'livro' };
}

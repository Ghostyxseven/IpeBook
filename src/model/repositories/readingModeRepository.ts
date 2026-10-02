import type { ReadingMode } from '../entities/BookExperience';
import { parseReadingMode, readingModeStorageKey } from '../services/bookExperience.ts';

export type ReadingModeRepository = {
  /** Modo escolhido numa visita anterior, ou `null` se não houver (ou se o valor for inválido). */
  load(): ReadingMode | null;
  save(mode: ReadingMode): void;
};

/** Preferência local do aparelho. Falhas de armazenamento não impedem o uso da página. */
export function createReadingModeRepository(storage: Storage | null): ReadingModeRepository {
  return {
    load() {
      try {
        return parseReadingMode(storage?.getItem(readingModeStorageKey));
      } catch {
        return null; // armazenamento bloqueado ou indisponível
      }
    },
    save(mode) {
      try {
        storage?.setItem(readingModeStorageKey, mode);
      } catch {
        // sem armazenamento, a escolha vale só nesta visita
      }
    },
  };
}

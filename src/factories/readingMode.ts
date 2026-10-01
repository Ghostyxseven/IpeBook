/**
 * Monta as dependências reais do modo de leitura da página Web (padrão Factory da disciplina).
 * A tela usa este hook e não conhece o armazenamento do navegador.
 */
import { localStore } from '../infra/localStore';
import { createReadingModeRepository } from '../model/repositories/readingModeRepository';
import { useReadingMode } from '../viewmodel/useReadingMode';

export const readingModeRepository = createReadingModeRepository(localStore);

function prefersReducedMotion(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

export const useReadingModePreference = () =>
  useReadingMode(readingModeRepository, { prefersReducedMotion: prefersReducedMotion() });

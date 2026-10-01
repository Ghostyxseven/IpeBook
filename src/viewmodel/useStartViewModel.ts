import type { AuthRepository } from '../model/repositories/AuthRepository';
import type { PreferencesRepository } from '../model/repositories/preferencesRepository';
import { startRoute, useSession } from './useSession.ts';

/**
 * Abertura do app (rota `/` no Android e no iOS): decide entre onboarding, Entrar e Início
 * a partir da sessão e de o onboarding já ter sido visto. A tela só exibe o resultado.
 */
export function useStartViewModel(repository: AuthRepository, preferences: PreferencesRepository) {
  const session = useSession(repository);
  return {
    session,
    destination: startRoute(session.status, preferences.hasSeenOnboarding()),
  };
}

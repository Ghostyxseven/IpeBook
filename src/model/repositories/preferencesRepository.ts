const ONBOARDING_KEY = 'ipebook:onboarding-visto';

export type PreferencesRepository = {
  hasSeenOnboarding(): boolean;
  markOnboardingSeen(): void;
};

/** Preferências locais do aparelho. Falhas de armazenamento não impedem o uso do app. */
export function createPreferencesRepository(storage: Storage | null): PreferencesRepository {
  return {
    hasSeenOnboarding() {
      try {
        return storage?.getItem(ONBOARDING_KEY) === '1';
      } catch {
        return false;
      }
    },
    markOnboardingSeen() {
      try {
        storage?.setItem(ONBOARDING_KEY, '1');
      } catch {
        // Sem armazenamento, o onboarding aparece de novo na próxima abertura.
      }
    },
  };
}

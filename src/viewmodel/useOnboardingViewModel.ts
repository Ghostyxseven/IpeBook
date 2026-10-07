import type { PreferencesRepository } from '../model/repositories/preferencesRepository';
import { welcome } from '../model/services/onboarding.ts';

/** Boas-vindas numa tela só (Figma 01.01): qualquer saída marca a apresentação como vista. */
export function useOnboardingViewModel(
  preferences: PreferencesRepository,
  { onStart, onSignIn }: { onStart: () => void; onSignIn: () => void },
) {
  const leave = (go: () => void) => () => {
    preferences.markOnboardingSeen();
    go();
  };
  return { content: welcome, start: leave(onStart), signIn: leave(onSignIn) };
}

import { useState } from 'react';
import type { PreferencesRepository } from '../model/repositories/preferencesRepository';
import { onboardingPages } from '../model/services/onboarding.ts';

export function useOnboardingViewModel(
  preferences: PreferencesRepository,
  { onFinish }: { onFinish: () => void },
) {
  const [index, setIndex] = useState(0);
  const isLast = index === onboardingPages.length - 1;
  const finish = () => {
    preferences.markOnboardingSeen();
    onFinish();
  };
  return {
    index,
    page: onboardingPages[index],
    total: onboardingPages.length,
    isFirst: index === 0,
    isLast,
    next: () => (isLast ? finish() : setIndex(index + 1)),
    back: () => setIndex(Math.max(0, index - 1)),
    skip: finish,
  };
}

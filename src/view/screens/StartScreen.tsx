import { Redirect } from 'expo-router';
import { preferencesRepository, useAppSession } from '../../factories/auth';
import { startRoute } from '../../viewmodel/useSession';
import { SplashScreen } from './SplashScreen';

/** Rota `/` no Android e no iOS: decide entre onboarding, Entrar e Início. */
export function StartScreen() {
  const { status } = useAppSession();
  const destination = startRoute(status, preferencesRepository.hasSeenOnboarding());
  return destination ? <Redirect href={destination} /> : <SplashScreen />;
}

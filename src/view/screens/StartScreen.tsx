import { Redirect } from 'expo-router';
import { preferencesRepository, useAppSession } from '../../factories/auth';
import { startRoute } from '../../viewmodel/useSession';
import { SessionPendingScreen } from './SessionPendingScreen';

/** Rota `/` no Android e no iOS: decide entre onboarding, Entrar e Início. */
export function StartScreen() {
  const session = useAppSession();
  const destination = startRoute(session.status, preferencesRepository.hasSeenOnboarding());
  return destination ? <Redirect href={destination} /> : <SessionPendingScreen session={session} />;
}

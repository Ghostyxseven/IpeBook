import { Redirect } from 'expo-router';
import { useStart } from '../../factories/auth';
import { SessionPendingScreen } from './SessionPendingScreen';

/** Rota `/` no Android e no iOS: exibe o destino decidido pela ViewModel da abertura. */
export function StartScreen() {
  const vm = useStart();
  return vm.destination ? (
    <Redirect href={vm.destination} />
  ) : (
    <SessionPendingScreen session={vm.session} />
  );
}

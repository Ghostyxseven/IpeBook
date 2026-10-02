import { AppState } from 'react-native';

/** Avisa quando o aplicativo volta ao primeiro plano; devolve a função que cancela o aviso. */
export function onAppForeground(callback: () => void) {
  const subscription = AppState.addEventListener('change', (state) => {
    if (state === 'active') callback();
  });
  return () => subscription.remove();
}

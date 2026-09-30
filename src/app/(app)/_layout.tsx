import { Redirect, Stack } from 'expo-router';
import { OfflineBanner } from '../../view/components/feedback/OfflineBanner';
import { SplashScreen } from '../../view/screens/SplashScreen';
import { colors } from '../../view/theme/nativeTheme';
import { useAppSession } from '../../factories/auth';
import { SessionContext } from '../../viewmodel/useSession';

/** Área autenticada: as outras features acrescentam suas rotas nesta pasta. */
export default function AppLayout() {
  const session = useAppSession();
  if (session.status === 'loading') return <SplashScreen />;
  if (session.status === 'signedOut') return <Redirect href="/entrar" />;
  return (
    <SessionContext.Provider value={session}>
      <OfflineBanner />
      <Stack
        screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }}
      />
    </SessionContext.Provider>
  );
}

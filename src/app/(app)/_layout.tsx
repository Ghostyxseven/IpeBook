import { Redirect, Stack } from 'expo-router';
import { OfflineBanner } from '../../view/components/feedback/OfflineBanner';
import { SessionPendingScreen } from '../../view/screens/SessionPendingScreen';
import { colors, typography } from '../../view/theme/nativeTheme';
import { useAppSession } from '../../factories/auth';
import { SessionContext } from '../../viewmodel/useSession';

/** Figma 04: voltar e a marca no topo, sobre a superfície. */
const headerOptions = {
  headerShown: true,
  title: 'IpêBook',
  headerStyle: { backgroundColor: colors.surface },
  headerTintColor: colors.text,
  headerTitleStyle: { ...typography.bodyLarge, fontWeight: '500' as const, color: colors.text },
  contentStyle: { backgroundColor: colors.surface },
  headerShadowVisible: false,
  headerBackTitle: 'Voltar',
};

/** Área autenticada: as outras features acrescentam suas rotas nesta pasta. */
export default function AppLayout() {
  const session = useAppSession();
  if (session.status === 'loading') return <SessionPendingScreen session={session} />;
  if (session.status === 'signedOut') return <Redirect href="/entrar" />;
  return (
    <SessionContext.Provider value={session}>
      <OfflineBanner />
      <Stack
        screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }}
      >
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="livro/[id]" options={headerOptions} />
        <Stack.Screen name="notificacoes" options={headerOptions} />
        <Stack.Screen name="configuracoes" options={headerOptions} />
      </Stack>
    </SessionContext.Provider>
  );
}

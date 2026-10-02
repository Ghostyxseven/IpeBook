import { Redirect, Stack } from 'expo-router';
import { OfflineBanner } from '../../view/components/feedback/OfflineBanner';
import { SessionPendingScreen } from '../../view/screens/SessionPendingScreen';
import { colors, typography } from '../../view/theme/nativeTheme';
import { useAppSession } from '../../factories/auth';
import { SessionContext } from '../../viewmodel/useSession';

/** Figma 04: voltar e o título no topo, sobre a superfície. O detalhe do livro mostra a marca. */
const headerFor = (title: string, align: 'left' | 'center' = 'center') => ({
  headerShown: true,
  title,
  headerTitleAlign: align,
  headerStyle: { backgroundColor: colors.surface },
  headerTintColor: colors.text,
  headerTitleStyle:
    align === 'left'
      ? { ...typography.titleLarge, color: colors.text }
      : { ...typography.bodyLarge, fontWeight: '500' as const, color: colors.text },
  contentStyle: { backgroundColor: colors.surface },
  headerShadowVisible: false,
  headerBackTitle: 'Voltar',
});

const headerOptions = headerFor('IpêBook');

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
        {/* Figma 35: seta e título "Notificações" alinhado à esquerda. */}
        <Stack.Screen name="notificacoes" options={headerFor('Notificações', 'left')} />
        <Stack.Screen name="configuracoes" options={headerFor('Configurações', 'left')} />
      </Stack>
    </SessionContext.Provider>
  );
}

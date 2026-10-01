import { Redirect, Stack } from 'expo-router';
import { OfflineBanner } from '../../view/components/feedback/OfflineBanner';
import { colors, typography } from '../../view/theme/nativeTheme';
import { useAppSession } from '../../factories/auth';
import { SessionContext } from '../../viewmodel/useSession';

/** Telas de entrada: quem já tem sessão vai direto para a Início. */
export default function AuthLayout() {
  const session = useAppSession();
  if (session.status === 'signedIn') return <Redirect href="/inicio" />;
  return (
    <SessionContext.Provider value={session}>
      <OfflineBanner />
      <Stack
        screenOptions={{
          // A tela já tem o título como cabeçalho; a barra só oferece o voltar nativo.
          headerTitle: '',
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.actionDeep,
          headerTitleStyle: { ...typography.action, color: colors.text },
          headerShadowVisible: false,
          headerBackTitle: 'Voltar',
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen
          name="onboarding"
          options={{ headerShown: false, title: 'Conheça o IpêBook' }}
        />
        <Stack.Screen name="entrar" options={{ headerShown: false, title: 'Entrar' }} />
        <Stack.Screen name="criar-conta" options={{ title: 'Criar conta' }} />
        <Stack.Screen name="verificar-email" options={{ title: 'Confirmar e-mail' }} />
        <Stack.Screen name="recuperar-senha" options={{ title: 'Recuperar senha' }} />
      </Stack>
    </SessionContext.Provider>
  );
}

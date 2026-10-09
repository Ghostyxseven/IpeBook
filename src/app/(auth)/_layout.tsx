import { Redirect, Stack } from 'expo-router';
import { Platform } from 'react-native';
import { OfflineBanner } from '../../view/components/feedback/OfflineBanner';
import { colors, typography } from '../../view/theme/nativeTheme';
import { useAppSession } from '../../factories/auth';
import { afterSignIn, type AfterSignIn } from '../../viewmodel/afterSignIn';
import { SessionContext } from '../../viewmodel/useSession';

/**
 * Destino logo depois de confirmar o código. No Android e na Web (Figma 01.09 e 01.13),
 * telas dedicadas com cartão de sucesso. No iPhone, a própria tela seguinte com um aviso por
 * cima (`(app)/_layout` mostra o aviso), como o quadro iOS do Figma.
 */
const material = Platform.OS !== 'ios';
const successRoutes: Record<AfterSignIn, string> = material
  ? { emailConfirmed: '/email-confirmado', passwordUpdated: '/senha-atualizada' }
  : { emailConfirmed: '/seu-bairro', passwordUpdated: '/inicio' };

/** Telas de entrada: quem já tem sessão vai direto para a Início. */
export default function AuthLayout() {
  const session = useAppSession();
  if (session.status === 'signedIn') {
    if (session.user?.needsRegistration) return <Redirect href="/completar-cadastro" />;
    const outcome = afterSignIn.peek();
    return <Redirect href={outcome ? successRoutes[outcome] : '/inicio'} />;
  }
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
        {/* Figma 07.17: a própria tela tem a barra com voltar. */}
        <Stack.Screen
          name="conta-excluida"
          options={{ headerShown: false, title: 'Conta excluída' }}
        />
      </Stack>
    </SessionContext.Provider>
  );
}

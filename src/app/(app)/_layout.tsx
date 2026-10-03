import { Redirect, Stack } from 'expo-router';
import { OfflineBanner } from '../../view/components/feedback/OfflineBanner';
import { SessionPendingScreen } from '../../view/screens/SessionPendingScreen';
import { colors, typography } from '../../view/theme/nativeTheme';
import { useAppSession } from '../../factories/auth';
import { SessionContext } from '../../viewmodel/useSession';

/** Cabeçalho das telas de pilha: voltar e o título, sobre a superfície (Figma 04). */
const stackHeader = (title: string) => ({
  headerShown: true,
  title,
  headerStyle: { backgroundColor: colors.surface },
  headerTintColor: colors.text,
  headerTitleStyle: { ...typography.bodyLarge, fontWeight: '500' as const, color: colors.text },
  contentStyle: { backgroundColor: colors.background },
  headerShadowVisible: false,
  headerBackTitle: 'Voltar',
});

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
        {/* Sucesso do acesso (Figma 01.09 e 01.13): a própria tela tem a barra com voltar. */}
        <Stack.Screen name="senha-atualizada" options={{ title: 'Senha atualizada' }} />
        <Stack.Screen name="email-confirmado" options={{ title: 'E-mail confirmado' }} />
        <Stack.Screen name="anunciar/index" options={stackHeader('Anunciar um livro')} />
        <Stack.Screen name="anunciar/[id]" options={stackHeader('Editar anúncio')} />
        <Stack.Screen
          name="negociacoes/index"
          options={{
            ...stackHeader('Conversas'),
            contentStyle: { backgroundColor: colors.surface },
          }}
        />
        <Stack.Screen
          name="negociacoes/[id]"
          options={{
            ...stackHeader('Negociação'),
            contentStyle: { backgroundColor: colors.surface },
          }}
        />
        <Stack.Screen
          name="livro/[id]/combinar"
          options={{
            ...stackHeader('Combinar encontro'),
            contentStyle: { backgroundColor: colors.surface },
          }}
        />
        <Stack.Screen
          name="notificacoes"
          options={{
            ...stackHeader('Notificações'),
            contentStyle: { backgroundColor: colors.surface },
          }}
        />
        <Stack.Screen
          name="configuracoes"
          options={{
            ...stackHeader('Configurações'),
            contentStyle: { backgroundColor: colors.surface },
          }}
        />
        <Stack.Screen
          name="livro/[id]"
          options={{
            headerShown: true,
            // Figma 03.01: voltar e "Detalhes" no topo, sobre a superfície.
            title: 'Detalhes',
            headerStyle: { backgroundColor: colors.surface },
            headerTintColor: colors.text,
            headerTitleStyle: { ...typography.bodyLarge, fontWeight: '500', color: colors.text },
            contentStyle: { backgroundColor: colors.surface },
            headerShadowVisible: false,
            headerBackTitle: 'Voltar',
          }}
        />
      </Stack>
    </SessionContext.Provider>
  );
}

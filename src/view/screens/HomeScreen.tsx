import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSessionContext } from '../../viewmodel/useSession';
import { EmptyState } from '../components/feedback/EmptyState';
import { Button } from '../components/ui/Button';
import { FormMessage } from '../components/ui/FormMessage';
import { colors, metrics, spacing, typography } from '../theme/nativeTheme';

/** Início provisória: o feed é da feature de Exploração (ver docs/DIVISAO_FEATURES.md). */
export function HomeScreen() {
  const session = useSessionContext();
  const firstName = session.user?.name.split(' ')[0];
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title} accessibilityRole="header">
          {firstName ? `Olá, ${firstName}!` : 'Olá!'}
        </Text>
        <Text style={styles.text}>Você entrou como {session.user?.email}.</Text>
        <EmptyState
          title="A estante ainda está vazia"
          message="O catálogo de livros está em construção. Em breve você vai poder descobrir, anunciar e combinar livros por aqui."
        />
        <View style={styles.actions}>
          <FormMessage tone="error" message={session.error} />
          <Button
            label="Sair"
            variant="secondary"
            onPress={session.signOut}
            loading={session.signingOut}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: {
    padding: metrics.pagePadding,
    gap: spacing.lg,
    width: '100%',
    maxWidth: metrics.formMaxWidth,
    alignSelf: 'center',
  },
  title: { ...typography.title, color: colors.text },
  text: { ...typography.body, color: colors.secondaryText },
  actions: { gap: spacing.sm },
});

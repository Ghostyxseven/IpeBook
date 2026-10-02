import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMyListings } from '../../../factories/listings';
import { summarize, summaryLine } from '../../../model/services/profileSummary';
import { firstName } from '../../../model/services/userFormat';
import { useSessionContext } from '../../../viewmodel/useSession';
import { Button } from '../../components/ui/Button';
import { FormMessage } from '../../components/ui/FormMessage';
import { colors, metrics, radius, spacing, typography } from '../../theme/nativeTheme';

/** Meu perfil (spec 026, Figma 10): quem você é, seus anúncios e sair. */
export function ProfileScreen() {
  const router = useRouter();
  const session = useSessionContext();
  const vm = useMyListings();
  const user = session.user;
  // Enquanto a lista não chegou, o resumo não inventa número: fica em branco.
  const summary = vm.status === 'ready' ? summaryLine(summarize(vm.listings)) : null;

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text accessibilityRole="header" style={styles.title}>
          Meu perfil
        </Text>

        <View style={styles.card}>
          <Text style={styles.name}>{user ? firstName(user.name) : 'Você'}</Text>
          {user ? <Text style={styles.detail}>{user.name}</Text> : null}
          {user ? <Text style={styles.detail}>{user.email}</Text> : null}
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Meus anúncios</Text>
          <Text style={styles.detail}>{summary ?? 'Carregando…'}</Text>
          <Button
            label="Ver minha estante"
            variant="secondary"
            onPress={() => router.push('/estante')}
          />
        </View>

        <FormMessage tone="error" message={session.error} />

        <Button
          label="Sair da conta"
          variant="danger"
          loading={session.signingOut}
          onPress={session.signOut}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: {
    padding: metrics.pagePadding,
    gap: spacing.md,
    maxWidth: metrics.formMaxWidth,
    width: '100%',
    alignSelf: 'center',
  },
  title: { ...typography.titleLarge, color: colors.text },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.medium,
    padding: spacing.md,
    gap: spacing.xs,
  },
  sectionTitle: { ...typography.labelMedium, color: colors.secondaryText },
  name: { ...typography.titleMedium, color: colors.text },
  detail: { ...typography.bodyMedium, color: colors.secondaryText },
});

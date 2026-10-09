import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useBlockedPeople } from '../../../factories/security';
import { personName, unblockLabel } from '../../../model/services/securityFormat';
import { ErrorState } from '../../components/feedback/ErrorState';
import { LoadingState } from '../../components/feedback/LoadingState';
import { Button } from '../../components/ui/Button';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { FormMessage } from '../../components/ui/FormMessage';
import { TopAppBar } from '../../components/ui/TopAppBar';
import { colors, metrics, spacing, typography } from '../../theme/nativeTheme';

/** Pessoas bloqueadas (Figma 07.10), o diálogo de desbloqueio (07.11) e a lista vazia (07.12). */
export default function BlockedPeopleScreen() {
  const router = useRouter();
  const vm = useBlockedPeople();
  const leave = () => (router.canGoBack() ? router.back() : router.replace('/configuracoes'));

  let body;
  if (vm.status === 'loading') body = <LoadingState message="Carregando pessoas bloqueadas…" />;
  else if (vm.status === 'error')
    body = <ErrorState message={vm.loadError ?? ''} onRetry={vm.retry} />;
  else if (vm.empty)
    body = (
      <View style={styles.content}>
        {/* Figma 07.12: sem botão aqui — a volta já é a seta do topo. */}
        <Text accessibilityRole="header" style={styles.brand}>
          Ninguém bloqueado.
        </Text>
        <Text style={styles.body}>Se alguém incomodar, use Bloquear no perfil ou na conversa.</Text>
      </View>
    );
  else
    body = (
      <ScrollView contentContainerStyle={styles.content}>
        <Text accessibilityRole="header" style={styles.brand}>
          Você decide com quem negociar.
        </Text>
        <Text style={styles.body}>
          Pessoas bloqueadas não aparecem no seu catálogo, e você não vê os anúncios delas.
        </Text>
        <FormMessage tone="error" message={vm.error} />
        {vm.people.map((person) => (
          <View key={person.blockedId} style={styles.person}>
            <View
              style={styles.row}
              accessible
              accessibilityLabel={`${personName(person.firstName)}, bloqueada`}
            >
              <Text style={styles.name}>{person.firstName ?? 'Pessoa sem nome'}</Text>
              <Text style={styles.supporting}>Bloqueada · anúncios ocultos para você</Text>
            </View>
            <Button
              label={unblockLabel(person.firstName)}
              variant="secondary"
              onPress={() => vm.askUnblock(person)}
            />
          </View>
        ))}
        <Text style={styles.caption}>
          Desbloquear faz os anúncios da pessoa voltarem ao seu catálogo.
        </Text>
      </ScrollView>
    );

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <TopAppBar title="Pessoas bloqueadas" onBack={leave} />
      {body}
      <ConfirmDialog
        visible={vm.confirming !== null}
        title={`Desbloquear ${personName(vm.confirming?.firstName)}?`}
        message="Os anúncios dessa pessoa voltam a aparecer no seu catálogo."
        confirmLabel="Desbloquear"
        onConfirm={vm.confirmUnblock}
        onCancel={vm.cancelUnblock}
        busy={vm.unblocking}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: {
    paddingHorizontal: metrics.pagePadding,
    paddingTop: spacing.lg,
    paddingBottom: spacing.lg,
    gap: spacing.md,
    maxWidth: metrics.formMaxWidth,
    width: '100%',
    alignSelf: 'center',
  },
  brand: { ...typography.brandHeadline, color: colors.onSurface },
  body: { ...typography.bodyLarge, color: colors.onSurfaceVariant },
  person: { gap: spacing.sm },
  row: { paddingHorizontal: spacing.md, paddingVertical: spacing.xs, gap: spacing.xxs },
  name: { ...typography.bodyLarge, color: colors.onSurface },
  supporting: { ...typography.bodyMedium, color: colors.onSurfaceVariant },
  caption: { ...typography.caption, color: colors.onSurfaceVariant },
});

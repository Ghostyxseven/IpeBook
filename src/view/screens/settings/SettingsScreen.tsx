import {
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  notificationKindDescriptions,
  notificationKindLabels,
} from '../../../model/services/notificationFormat';
import { useSettings } from '../../../factories/notifications';
import { AppIcon } from '../../components/AppIcon';
import { ErrorState } from '../../components/feedback/ErrorState';
import { FormMessage } from '../../components/ui/FormMessage';
import { colors, metrics, radius, spacing, typography } from '../../theme/nativeTheme';

const focusRing = Platform.select({
  web: {
    outlineColor: colors.focus,
    outlineStyle: 'solid' as const,
    outlineWidth: metrics.focusWidth,
    outlineOffset: metrics.focusOffset,
  },
  default: {},
});

/**
 * Configurações (Figma 07.05): avisos por tipo em itens com chave, depois a conta, os documentos
 * legais e Sair. Excluir conta é da issue #47.
 */
export function SettingsScreen() {
  const router = useRouter();
  const vm = useSettings();

  return (
    <SafeAreaView style={styles.safe} edges={['left', 'right', 'bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.section} accessibilityRole="header">
          Notificações
        </Text>
        <FormMessage tone="error" message={vm.saveError} />
        {vm.status === 'error' ? (
          <ErrorState message={vm.error ?? ''} onRetry={vm.retry} />
        ) : (
          vm.kinds.map((kind) => {
            const on = vm.preferences[kind];
            return (
              <View key={kind} style={styles.switchRow}>
                <View style={styles.rowCopy}>
                  <Text style={styles.rowTitle}>{notificationKindLabels[kind]}</Text>
                  <Text style={styles.rowBody}>{notificationKindDescriptions[kind]}</Text>
                </View>
                <Switch
                  value={on}
                  disabled={vm.status === 'loading' || vm.saving[kind] === true}
                  onValueChange={(enabled) => void vm.setPreference(kind, enabled)}
                  accessibilityLabel={notificationKindLabels[kind]}
                  accessibilityHint={notificationKindDescriptions[kind]}
                  trackColor={{ false: colors.containerHigh, true: colors.action }}
                  thumbColor={
                    Platform.OS !== 'ios'
                      ? on
                        ? colors.containerLowest
                        : colors.onSurfaceVariant
                      : undefined
                  }
                  ios_backgroundColor={colors.containerHigh}
                />
              </View>
            );
          })
        )}
        <Text style={styles.footnote}>
          Desligar um tipo impede novos avisos dele. Os avisos que você já recebeu continuam na
          lista.
        </Text>

        <View style={styles.divider} />

        <Text style={styles.section} accessibilityRole="header">
          Conta
        </Text>
        {vm.accountEmail && (
          <View style={styles.listItem} accessible accessibilityLabel={`Conta: ${vm.accountEmail}`}>
            <AppIcon name="person" size={20} color={colors.onSurfaceVariant} />
            <View style={styles.rowCopy}>
              <Text style={styles.rowTitle}>{vm.accountName ?? 'Sua conta'}</Text>
              <Text style={styles.rowBody}>{vm.accountEmail}</Text>
            </View>
          </View>
        )}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Alterar senha"
          onPress={() => router.push('/alterar-senha')}
          style={({ pressed, focused }: { pressed: boolean; focused?: boolean }) => [
            styles.listItem,
            pressed && styles.pressed,
            focused && focusRing,
          ]}
        >
          <AppIcon name="lock" size={20} color={colors.onSurfaceVariant} />
          <View style={styles.rowCopy}>
            <Text style={styles.rowTitle}>Alterar senha</Text>
            <Text style={styles.rowBody}>Confirme a senha atual e escolha outra.</Text>
          </View>
          <AppIcon name="chevronRight" color={colors.onSurfaceVariant} />
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Pessoas bloqueadas"
          onPress={() => router.push('/(app)/seguranca')}
          style={({ pressed, focused }: { pressed: boolean; focused?: boolean }) => [
            styles.listItem,
            pressed && styles.pressed,
            focused && focusRing,
          ]}
        >
          <AppIcon name="close" size={20} color={colors.onSurfaceVariant} />
          <View style={styles.rowCopy}>
            <Text style={styles.rowTitle}>Pessoas bloqueadas</Text>
            <Text style={styles.rowBody}>Veja quem você bloqueou e desbloqueie.</Text>
          </View>
          <AppIcon name="chevronRight" color={colors.onSurfaceVariant} />
        </Pressable>
        {vm.legalLinks.map((link) => (
          <Pressable
            key={link.url}
            accessibilityRole="link"
            accessibilityLabel={link.label}
            accessibilityHint="Abre no navegador"
            onPress={() => void Linking.openURL(link.url)}
            style={({ pressed, focused }: { pressed: boolean; focused?: boolean }) => [
              styles.listItem,
              pressed && styles.pressed,
              focused && focusRing,
            ]}
          >
            <AppIcon name="document" size={20} color={colors.onSurfaceVariant} />
            <Text style={[styles.rowTitle, styles.rowCopy]}>{link.label}</Text>
            <AppIcon name="chevronRight" color={colors.onSurfaceVariant} />
          </Pressable>
        ))}
        <FormMessage tone="error" message={vm.signOutError} />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Sair"
          accessibilityState={{ busy: vm.signingOut, disabled: vm.signingOut }}
          disabled={vm.signingOut}
          onPress={vm.signOut}
          style={({ pressed, focused }: { pressed: boolean; focused?: boolean }) => [
            styles.listItem,
            pressed && styles.pressed,
            focused && focusRing,
          ]}
        >
          <AppIcon name="logout" size={20} color={colors.error} />
          <Text style={[styles.rowTitle, styles.rowCopy, styles.danger]}>
            {vm.signingOut ? 'Saindo…' : 'Sair'}
          </Text>
        </Pressable>

        <Text style={styles.version}>Versão {vm.appVersion}</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface },
  content: {
    paddingHorizontal: metrics.pagePadding,
    paddingBottom: metrics.pagePadding,
    width: '100%',
    maxWidth: metrics.formMaxWidth,
    alignSelf: 'center',
  },
  // Rótulo de seção em verde (Figma 07.05).
  section: {
    ...typography.labelLarge,
    color: colors.action,
    paddingTop: spacing.md,
    paddingBottom: spacing.xs,
  },
  switchRow: {
    minHeight: 72,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.xs,
  },
  rowCopy: { flex: 1 },
  rowTitle: { ...typography.bodyLarge, color: colors.onSurface },
  rowBody: { ...typography.bodyMedium, color: colors.onSurfaceVariant },
  footnote: { ...typography.bodyMedium, color: colors.onSurfaceVariant, paddingTop: spacing.xs },
  divider: {
    height: metrics.borderThin,
    backgroundColor: colors.outlineVariant,
    marginTop: spacing.md,
  },
  listItem: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.md,
    marginHorizontal: -spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.small,
  },
  pressed: { backgroundColor: colors.pressed },
  danger: { color: colors.error },
  version: {
    ...typography.labelMedium,
    color: colors.onSurfaceVariant,
    textAlign: 'center',
    paddingTop: spacing.lg,
  },
});

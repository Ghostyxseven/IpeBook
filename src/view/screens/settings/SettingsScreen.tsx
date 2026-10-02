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
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  notificationKindDescriptions,
  notificationKindLabels,
} from '../../../model/services/notificationFormat';
import { useSettings } from '../../../factories/notifications';
import { AppIcon } from '../../components/AppIcon';
import { ErrorState } from '../../components/feedback/ErrorState';
import { Button } from '../../components/ui/Button';
import { FormMessage } from '../../components/ui/FormMessage';
import { colors, metrics, spacing, typography } from '../../theme/nativeTheme';

const focusRing = Platform.select({
  web: {
    outlineColor: colors.focus,
    outlineStyle: 'solid' as const,
    outlineWidth: metrics.focusWidth,
    outlineOffset: metrics.focusOffset,
  },
  default: {},
});

/** Configurações: avisos por tipo, documentos legais, versão e Sair. Excluir conta é da issue #47. */
export function SettingsScreen() {
  const vm = useSettings();

  return (
    <SafeAreaView style={styles.safe} edges={['left', 'right', 'bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        {vm.accountEmail && (
          <View style={styles.group} accessibilityLabel="Conta">
            <Text style={styles.account}>{vm.accountName ?? 'Sua conta'}</Text>
            <Text style={styles.secondary}>{vm.accountEmail}</Text>
          </View>
        )}

        <Text style={styles.section} accessibilityRole="header">
          Avisos
        </Text>
        <FormMessage tone="error" message={vm.saveError} />
        {vm.status === 'error' ? (
          <ErrorState message={vm.error ?? ''} onRetry={vm.retry} />
        ) : (
          <View style={styles.group}>
            {vm.kinds.map((kind, index) => (
              <View key={kind} style={[styles.row, index > 0 && styles.rowDivider]}>
                <View style={styles.rowCopy}>
                  <Text style={styles.rowTitle}>{notificationKindLabels[kind]}</Text>
                  <Text style={styles.secondary}>{notificationKindDescriptions[kind]}</Text>
                </View>
                <Switch
                  value={vm.preferences[kind]}
                  disabled={vm.status === 'loading' || vm.saving[kind] === true}
                  onValueChange={(enabled) => void vm.setPreference(kind, enabled)}
                  accessibilityLabel={notificationKindLabels[kind]}
                  accessibilityHint={notificationKindDescriptions[kind]}
                  trackColor={{ false: colors.border, true: colors.action }}
                  thumbColor={colors.background}
                />
              </View>
            ))}
          </View>
        )}
        <Text style={styles.secondary}>
          Desligar um tipo impede novos avisos dele. Os avisos que você já recebeu continuam na
          lista.
        </Text>

        {vm.legalLinks.length > 0 && (
          <>
            <Text style={styles.section} accessibilityRole="header">
              Sobre o IpêBook
            </Text>
            <View style={styles.group}>
              {vm.legalLinks.map((link, index) => (
                <Pressable
                  key={link.url}
                  accessibilityRole="link"
                  accessibilityLabel={link.label}
                  accessibilityHint="Abre no navegador"
                  onPress={() => void Linking.openURL(link.url)}
                  style={({ pressed, focused }: { pressed: boolean; focused?: boolean }) => [
                    styles.row,
                    index > 0 && styles.rowDivider,
                    pressed && styles.pressed,
                    focused && focusRing,
                  ]}
                >
                  <Text style={styles.rowTitle}>{link.label}</Text>
                  <AppIcon name="chevronRight" color={colors.secondaryText} />
                </Pressable>
              ))}
            </View>
          </>
        )}

        <Text style={styles.version}>Versão {vm.appVersion}</Text>

        <FormMessage tone="error" message={vm.signOutError} />
        <Button label="Sair" variant="danger" loading={vm.signingOut} onPress={vm.signOut} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface },
  content: {
    padding: metrics.pagePadding,
    gap: spacing.md,
    width: '100%',
    maxWidth: metrics.formMaxWidth,
    alignSelf: 'center',
  },
  section: { ...typography.titleMedium, color: colors.text, marginTop: spacing.sm },
  group: {
    borderRadius: metrics.cardRadius,
    borderWidth: metrics.borderThin,
    borderColor: colors.border,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  account: { ...typography.bodyLarge, fontWeight: '500', color: colors.text },
  row: {
    minHeight: metrics.touchTarget,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },
  rowDivider: { borderTopWidth: metrics.borderThin, borderTopColor: colors.border },
  rowCopy: { flex: 1, gap: spacing.xxs },
  rowTitle: { ...typography.bodyMedium, fontWeight: '500', color: colors.text, flexShrink: 1 },
  secondary: { ...typography.labelMedium, color: colors.secondaryText },
  pressed: { backgroundColor: colors.pressed },
  version: { ...typography.labelMedium, color: colors.secondaryText, textAlign: 'center' },
});

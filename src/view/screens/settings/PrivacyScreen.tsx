import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDeleteAccount } from '../../../factories/account';
import { AppIcon, type AppIconName } from '../../components/AppIcon';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
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
 * Privacidade e dados (Figma 07.09): o que fica visível, editar o bairro e excluir a conta.
 * Os textos descrevem só o que o app guarda hoje (sem telefone nem avaliações).
 */
export function PrivacyScreen() {
  const router = useRouter();
  const { confirmar } = useLocalSearchParams<{ confirmar?: string }>();
  const vm = useDeleteAccount({ confirmOnOpen: confirmar === '1' });
  return (
    <SafeAreaView style={styles.safe} edges={['left', 'right', 'bottom']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.content}>
          <Text style={styles.title} accessibilityRole="header">
            Você no controle.
          </Text>
          <Text style={styles.description}>Entenda quais informações ficam visíveis.</Text>
          <Card
            title="Seu perfil público"
            text="Seu primeiro nome, seu bairro e seus anúncios ajudam a comunidade a conhecer você."
          />
          <Card
            title="Dados de acesso privados"
            text="Seu e-mail e sua senha não aparecem no perfil público nem nos anúncios."
          />
          <Row
            icon="edit"
            title="Editar informações"
            body="Atualize seu bairro."
            onPress={() => router.push('/escolher-bairro')}
            chevron
          />
          <Row
            icon="error"
            title="Excluir conta"
            body="Remova seus anúncios do catálogo."
            onPress={vm.askToDelete}
          />
        </View>
      </ScrollView>
      <ConfirmDialog
        visible={vm.confirming}
        title="Excluir sua conta?"
        message="Seus anúncios sairão do catálogo e seu perfil ficará indisponível. Esta ação não pode ser desfeita."
        confirmLabel="Excluir"
        destructive
        onConfirm={vm.confirm}
        onCancel={vm.cancel}
        busy={vm.deleting}
        error={vm.error}
      />
    </SafeAreaView>
  );
}

function Card({ title, text }: { title: string; text: string }) {
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{title}</Text>
      <Text style={styles.cardText}>{text}</Text>
    </View>
  );
}

function Row({
  icon,
  title,
  body,
  onPress,
  chevron = false,
}: {
  icon: AppIconName;
  title: string;
  body: string;
  onPress: () => void;
  chevron?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityHint={body}
      onPress={onPress}
      style={({ pressed, focused }: { pressed: boolean; focused?: boolean }) => [
        styles.row,
        pressed && styles.pressed,
        focused && focusRing,
      ]}
    >
      <AppIcon name={icon} size={20} color={colors.onSurface} />
      <View style={styles.rowCopy}>
        <Text style={styles.rowTitle}>{title}</Text>
        <Text style={styles.rowBody}>{body}</Text>
      </View>
      {chevron && <AppIcon name="chevronRight" color={colors.onSurfaceVariant} />}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface },
  scroll: { flexGrow: 1, padding: metrics.pagePadding },
  content: { width: '100%', maxWidth: metrics.formMaxWidth, alignSelf: 'center', gap: spacing.md },
  title: { ...typography.brandTitle, color: colors.onSurface },
  description: { ...typography.bodyMedium, color: colors.onSurfaceVariant },
  // Cartão preenchido do Material 3 (Figma 07.09).
  card: {
    gap: spacing.xxs,
    padding: spacing.md,
    borderRadius: metrics.cardRadius,
    backgroundColor: colors.containerHigh,
  },
  cardTitle: { ...typography.titleMedium, color: colors.onSurface },
  cardText: { ...typography.bodyMedium, color: colors.onSurface },
  row: {
    minHeight: metrics.touchTarget + spacing.xs,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    marginHorizontal: -spacing.md,
    borderRadius: radius.small,
  },
  pressed: { backgroundColor: colors.pressed },
  rowCopy: { flex: 1 },
  rowTitle: { ...typography.bodyLarge, color: colors.onSurface },
  rowBody: { ...typography.bodyMedium, color: colors.onSurfaceVariant },
});

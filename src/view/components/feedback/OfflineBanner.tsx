import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useConnectivity } from '../../../viewmodel/useConnectivity';
import { colors, metrics, spacing, typography } from '../../theme/nativeTheme';

/** Aviso global exibido quando o aparelho perde a conexão. */
export function OfflineBanner() {
  const { offline, checking, retry } = useConnectivity();
  const insets = useSafeAreaInsets();
  if (!offline) return null;
  return (
    <View
      accessibilityRole="alert"
      accessibilityLiveRegion="polite"
      style={[styles.banner, { paddingTop: insets.top + spacing.xs }]}
    >
      <View style={styles.copy}>
        <Text style={styles.title}>Você está sem conexão</Text>
        <Text style={styles.text}>
          O que você digitou continua aqui. Confira a internet e tente de novo.
        </Text>
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Verificar conexão novamente"
        accessibilityState={{ busy: checking }}
        onPress={retry}
        style={styles.action}
      >
        <Text style={styles.actionText}>{checking ? 'Verificando…' : 'Tentar novamente'}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: metrics.pagePadding,
    paddingBottom: spacing.xs,
    backgroundColor: colors.text,
  },
  copy: { flex: 1, gap: spacing.xxs },
  title: { ...typography.action, color: colors.surface },
  text: { ...typography.caption, color: colors.surface },
  action: {
    minHeight: metrics.touchTarget,
    minWidth: metrics.touchTarget,
    justifyContent: 'center',
    paddingHorizontal: spacing.xs,
  },
  actionText: { ...typography.action, color: colors.highlight },
});

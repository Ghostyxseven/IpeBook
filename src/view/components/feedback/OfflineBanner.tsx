import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useConnectivity } from '../../../viewmodel/useConnectivity';
import { AppIcon } from '../AppIcon';
import { colors, metrics, radius, spacing, typography } from '../../theme/nativeTheme';

/**
 * Aviso global de falta de conexão, conforme o Figma IpêBook (10.02 · Sem conexão):
 * - Android e Web: cartão escuro (`inverseSurface`) com ícone de erro;
 * - iOS: faixa amarela (`highlight`) com ícone de informação.
 * Mantém "Tentar novamente" no próprio aviso, porque ele aparece também sobre formulários.
 */
const ios = Platform.OS === 'ios';

export function OfflineBanner() {
  const { offline, checking, retry } = useConnectivity();
  const insets = useSafeAreaInsets();
  if (!offline) return null;
  const foreground = ios ? colors.onSurface : colors.inverseOnSurface;
  return (
    <View style={[styles.wrapper, { paddingTop: insets.top + spacing.xs }]}>
      <View
        accessibilityRole="alert"
        accessibilityLiveRegion="polite"
        style={[styles.banner, ios ? styles.bannerIos : styles.bannerMaterial]}
      >
        <AppIcon
          name={ios ? 'info' : 'error'}
          size={spacing.lg}
          color={ios ? colors.onSurface : colors.error}
        />
        <Text style={[styles.text, { color: foreground }]}>
          Você está sem conexão. O que você digitou continua aqui.
        </Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Verificar conexão novamente"
          accessibilityState={{ busy: checking }}
          onPress={retry}
          style={styles.action}
        >
          <Text style={[styles.actionText, { color: ios ? colors.actionDeep : colors.highlight }]}>
            {checking ? 'Verificando…' : 'Tentar novamente'}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { paddingHorizontal: metrics.pagePadding, backgroundColor: colors.background },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingLeft: spacing.md,
    paddingRight: spacing.xs,
    minHeight: metrics.touchTarget,
    borderRadius: radius.medium,
  },
  bannerMaterial: { backgroundColor: colors.inverseSurface },
  bannerIos: { backgroundColor: colors.highlight },
  text: { ...typography.bodyMedium, flex: 1, paddingVertical: spacing.sm },
  action: {
    minHeight: metrics.touchTarget,
    minWidth: metrics.touchTarget,
    justifyContent: 'center',
    paddingHorizontal: spacing.xs,
  },
  actionText: { ...typography.labelLarge },
});

import { useEffect } from 'react';
import { AccessibilityInfo, Platform, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { GlassSurface } from '../ui/GlassSurface';
import { AppIcon } from '../AppIcon';
import { colors, metrics, radius, spacing, typography } from '../../theme/nativeTheme';

const ios = Platform.OS === 'ios';
// No Android e na Web, o aviso usa o Snackbar do Material 3 (`inverse-surface`). No iPhone,
// `GlassSurface` é a "barra de mensagem" da referência do Liquid Glass (ADR 0029): vidro de
// verdade, com a célula sólida como ela mesma já resolve fora do iPhone e com "Reduzir
// Transparência" ligado.
const Banner = ios ? GlassSurface : View;

/**
 * Aviso temporário sobre a tela seguinte, em vez de uma tela de sucesso própria (Figma 01.09
 * "Senha atualizada" e 01.13 "E-mail confirmado"). Some sozinho depois de `duration` e também
 * lê o aviso para quem usa leitor de tela.
 */
export function Snackbar({
  title,
  message,
  onDismiss,
  duration = 4000,
}: {
  title: string;
  message?: string;
  onDismiss: () => void;
  duration?: number;
}) {
  const insets = useSafeAreaInsets();

  useEffect(() => {
    AccessibilityInfo.announceForAccessibility(message ? `${title}. ${message}` : title);
    const timer = setTimeout(onDismiss, duration);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <View style={[styles.wrapper, { paddingTop: insets.top + spacing.xs }]}>
      <Banner
        accessibilityRole="alert"
        accessibilityLiveRegion="polite"
        style={[styles.banner, !ios && styles.bannerMaterial]}
      >
        <AppIcon
          name="checkCircle"
          size={spacing.lg}
          color={ios ? colors.action : colors.inverseOnSurface}
        />
        <View style={styles.text}>
          <Text style={[styles.title, { color: ios ? colors.onSurface : colors.inverseOnSurface }]}>
            {title}
          </Text>
          {message && (
            <Text
              style={[
                styles.message,
                { color: ios ? colors.iosSecondaryLabel : colors.inverseOnSurface },
              ]}
            >
              {message}
            </Text>
          )}
        </View>
      </Banner>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { paddingHorizontal: metrics.pagePadding, backgroundColor: 'transparent' },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    minHeight: metrics.touchTarget,
    borderRadius: radius.medium,
    overflow: 'hidden',
  },
  bannerMaterial: { backgroundColor: colors.inverseSurface },
  text: { flex: 1, gap: 2 },
  title: { ...typography.labelLarge },
  message: { ...typography.bodyMedium },
});

import { useEffect } from 'react';
import { AccessibilityInfo, Platform, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { GlassView } from 'expo-glass-effect';
import { AppIcon } from '../AppIcon';
import { colors, metrics, radius, spacing, typography } from '../../theme/nativeTheme';

const ios = Platform.OS === 'ios';
// No Android e na Web, GlassView já cai para uma View comum, sem pintura própria: usa o
// `Banner = View` com o fundo `inverse-surface` do Material 3. No iPhone, `Banner = GlassView`
// pinta o próprio vidro: não leva `backgroundColor`.
const Banner = ios ? GlassView : View;
const glassProps = ios ? ({ glassEffectStyle: 'regular' } as const) : {};

/**
 * Aviso temporário sobre a tela seguinte, em vez de uma tela de sucesso própria (Figma 01.09
 * "Senha atualizada" e 01.13 "E-mail confirmado"): Android e Web usam o Snackbar do Material 3
 * (`inverse-surface`); o iPhone usa vidro de verdade (`expo-glass-effect`, precisa de iOS 26
 * para o blur — cai sozinho para uma célula comum em versões mais antigas), como a "Liquid
 * Glass" do quadro. Some sozinho depois de `duration` e também lê o aviso para quem usa leitor
 * de tela.
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
        {...glassProps}
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

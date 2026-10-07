import { Image } from 'expo-image';
import { ActivityIndicator, Platform, Pressable, StyleSheet, Text } from 'react-native';
import { colors, metrics, radius, spacing, typography } from '../../theme/nativeTheme';

const googleLogo = require('../../../../assets/images/google-logo.png');

/**
 * Botão "Continuar com o Google" (Figma 01.02 e 01.03): logotipo oficial e rótulo, sem
 * variar por plataforma. É identidade de marca de terceiros, fora do Material 3 e do iOS.
 */
export function SocialButton({
  label,
  onPress,
  loading = false,
  disabled = false,
}: {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
}) {
  const inactive = disabled || loading;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: inactive, busy: loading }}
      disabled={inactive}
      onPress={onPress}
      style={({ pressed, focused }: { pressed: boolean; focused?: boolean }) => [
        styles.base,
        pressed && !inactive && styles.pressed,
        inactive && styles.disabled,
        focused && styles.focused,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={colors.onSurfaceVariant} accessibilityElementsHidden />
      ) : (
        <Image
          source={googleLogo}
          style={styles.logo}
          contentFit="contain"
          accessibilityIgnoresInvertColors
        />
      )}
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: Math.max(metrics.controlHeight, metrics.touchTarget),
    borderRadius: radius.full,
    borderWidth: metrics.borderThin,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  logo: { width: 20, height: 20 },
  pressed: { backgroundColor: colors.pressed },
  disabled: { opacity: 0.6 },
  focused: Platform.select({
    web: {
      outlineColor: colors.focus,
      outlineStyle: 'solid',
      outlineWidth: metrics.focusWidth,
      outlineOffset: metrics.focusOffset,
    },
    default: {},
  }),
  label: { ...typography.labelLarge, color: colors.onSurface },
});

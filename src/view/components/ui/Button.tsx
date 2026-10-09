import { ActivityIndicator, Platform, Pressable, StyleSheet, Text } from 'react-native';
import { colors, metrics, radius, spacing, typography } from '../../theme/nativeTheme';

type Variant = 'primary' | 'secondary' | 'text' | 'danger';

/**
 * Android e Web seguem o componente "Botão" do Figma (Material 3, ADR 0013): pílula,
 * rótulo `m3-label-lg` e variantes Preenchido, Contornado, Texto e Perigo.
 * No iOS segue "Button - Content Area" do Figma (issue #10): cápsula de 50 px, rótulo
 * `ios-body` sem negrito; Contornado vira o botão sem borda do sistema.
 */
const material = Platform.OS !== 'ios';

export function Button({
  label,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  accessibilityHint,
}: {
  label: string;
  onPress: () => void;
  variant?: Variant;
  loading?: boolean;
  disabled?: boolean;
  accessibilityHint?: string;
}) {
  const inactive = disabled || loading;
  // Inativo (desabilitado ou carregando) usa o texto de desabilitado em todas as variantes:
  // texto claro sobre o fundo de desabilitado ficava ilegível no botão principal.
  const foreground = inactive
    ? colors.disabledText
    : variant === 'primary'
      ? colors.surface
      : variant === 'danger'
        ? colors.error
        : colors.actionDeep;
  const textual = variant === 'text' || variant === 'danger';
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: inactive, busy: loading }}
      disabled={inactive}
      onPress={onPress}
      style={({ pressed, focused }: { pressed: boolean; focused?: boolean }) => [
        styles.base,
        textual ? styles.textual : styles[variant as 'primary' | 'secondary'],
        pressed && !inactive && (variant === 'primary' ? styles.primaryPressed : styles.pressed),
        inactive && !textual && styles.disabled,
        focused && styles.focused,
      ]}
    >
      {loading && <ActivityIndicator color={foreground} accessibilityElementsHidden />}
      <Text style={[styles.label, { color: foreground }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    // Figma: 52 px (texto: 48 px). Vale o token de altura da plataforma; a diferença
    // está registrada em docs/design-system/divergencias.md.
    minHeight: Math.max(metrics.controlHeight, metrics.touchTarget),
    minWidth: metrics.touchTarget,
    borderRadius: radius.full,
    paddingHorizontal: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  primary: { backgroundColor: colors.action },
  primaryPressed: { backgroundColor: colors.actionDeep },
  secondary: material
    ? {
        borderWidth: metrics.borderThin,
        borderColor: colors.border,
        backgroundColor: 'transparent',
      }
    : { backgroundColor: 'transparent' },
  textual: {
    backgroundColor: 'transparent',
    paddingHorizontal: spacing.sm,
    ...(material && { minHeight: metrics.touchTarget }),
  },
  pressed: { backgroundColor: colors.pressed },
  disabled: { backgroundColor: colors.disabledBackground, borderColor: colors.disabledBackground },
  focused: Platform.select({
    web: {
      outlineColor: colors.focus,
      outlineStyle: 'solid',
      outlineWidth: metrics.focusWidth,
      outlineOffset: metrics.focusOffset,
    },
    default: {},
  }),
  label: { ...(material ? typography.labelLarge : typography.iosBody), textAlign: 'center' },
});

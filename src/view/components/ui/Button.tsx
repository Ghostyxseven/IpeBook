import { ActivityIndicator, Platform, Pressable, StyleSheet, Text } from 'react-native';
import { colors, metrics, spacing, typography } from '../../theme/nativeTheme';

type Variant = 'primary' | 'secondary' | 'text';

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
  const foreground =
    variant === 'primary' ? colors.surface : inactive ? colors.disabledText : colors.actionDeep;
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
        styles[variant],
        pressed && !inactive && (variant === 'primary' ? styles.primaryPressed : styles.pressed),
        inactive && variant !== 'text' && styles.disabled,
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
    minHeight: Math.max(metrics.controlHeight, metrics.touchTarget),
    minWidth: metrics.touchTarget,
    borderRadius: metrics.fieldRadius,
    paddingHorizontal: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  primary: { backgroundColor: colors.action },
  primaryPressed: { backgroundColor: colors.actionDeep },
  secondary: {
    borderWidth: metrics.borderThin,
    borderColor: colors.action,
    backgroundColor: colors.surface,
  },
  text: { backgroundColor: 'transparent', paddingHorizontal: spacing.sm },
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
  label: { ...typography.action, textAlign: 'center' },
});

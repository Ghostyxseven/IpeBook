import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, metrics, spacing, typography } from '../../theme/nativeTheme';
import { AppIcon } from '../AppIcon';

/**
 * Item de lista com caixa de seleção do Material 3 (Figma 01.03, "Aceite dos termos").
 * A linha inteira é o alvo de toque (mínimo de 48 px) e o estado é anunciado ao leitor de tela.
 */
export function Checkbox({
  label,
  supportingText,
  checked,
  onToggle,
  error,
}: {
  label: string;
  supportingText?: string;
  checked: boolean;
  onToggle: () => void;
  error?: string;
}) {
  return (
    <View style={styles.wrapper}>
      <Pressable
        accessibilityRole="checkbox"
        accessibilityState={{ checked }}
        accessibilityLabel={supportingText ? `${label} ${supportingText}` : label}
        accessibilityHint={error}
        onPress={onToggle}
        style={({ focused }: { pressed: boolean; focused?: boolean }) => [
          styles.row,
          focused && styles.focused,
        ]}
      >
        <View style={styles.box}>
          <AppIcon
            name={checked ? 'checkboxOn' : 'checkboxOff'}
            color={error ? colors.error : checked ? colors.action : colors.onSurfaceVariant}
          />
        </View>
        <View style={styles.copy}>
          <Text style={styles.label}>{label}</Text>
          {supportingText && <Text style={styles.supporting}>{supportingText}</Text>}
        </View>
      </Pressable>
      {error && (
        <Text style={styles.error} accessibilityLiveRegion="polite">
          {error}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: spacing.xxs },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    minHeight: metrics.touchTarget,
    paddingHorizontal: spacing.xs,
  },
  focused: {
    borderRadius: metrics.fieldRadius,
    outlineWidth: metrics.focusWidth,
    outlineColor: colors.focus,
    outlineStyle: 'solid',
  },
  box: {
    width: metrics.touchTarget,
    height: metrics.touchTarget,
    alignItems: 'center',
    justifyContent: 'center',
  },
  copy: { flex: 1 },
  label: { ...typography.bodyLarge, color: colors.onSurface },
  supporting: { ...typography.bodyMedium, color: colors.onSurfaceVariant },
  error: { ...typography.bodyMedium, color: colors.error, paddingHorizontal: spacing.md },
});

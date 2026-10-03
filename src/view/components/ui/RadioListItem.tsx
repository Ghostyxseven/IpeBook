import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, metrics, radius, spacing, typography } from '../../theme/nativeTheme';
import { AppIcon } from '../AppIcon';

/**
 * Item de lista do Material 3 com rádio no fim (Figma 01.17). Use dentro de uma View com
 * `accessibilityRole="radiogroup"`; a linha inteira é tocável e anuncia se está marcada.
 */
export function RadioListItem({
  label,
  supportingText,
  selected,
  onPress,
}: {
  label: string;
  supportingText?: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityLabel={supportingText ? `${label}. ${supportingText}` : label}
      accessibilityState={{ checked: selected, selected }}
      onPress={onPress}
      style={({ pressed, focused }: { pressed: boolean; focused?: boolean }) => [
        styles.row,
        pressed && styles.pressed,
        focused && styles.focused,
      ]}
    >
      <View style={styles.copy}>
        <Text style={styles.label}>{label}</Text>
        {supportingText && <Text style={styles.supporting}>{supportingText}</Text>}
      </View>
      <AppIcon
        name={selected ? 'radioOn' : 'radioOff'}
        color={selected ? colors.action : colors.onSurfaceVariant}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: metrics.touchTarget + spacing.xs,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.small,
  },
  pressed: { backgroundColor: colors.pressed },
  focused: {
    outlineColor: colors.focus,
    outlineStyle: 'solid',
    outlineWidth: metrics.focusWidth,
  },
  copy: { flex: 1 },
  label: { ...typography.bodyLarge, color: colors.onSurface },
  supporting: { ...typography.bodyMedium, color: colors.onSurfaceVariant },
});

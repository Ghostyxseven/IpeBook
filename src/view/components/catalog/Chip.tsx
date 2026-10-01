import { Platform, Pressable, StyleSheet, Text } from 'react-native';
import { colors, metrics, radius, spacing, typography } from '../../theme/nativeTheme';

/** Chip de filtro: estado selecionado indicado por texto acessível e marca, não só por cor. */
export function Chip({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityLabel={label}
      accessibilityState={{ checked: selected }}
      onPress={onPress}
      hitSlop={spacing.xxs}
      style={({ pressed, focused }: { pressed: boolean; focused?: boolean }) => [
        styles.chip,
        selected && styles.selected,
        pressed && styles.pressed,
        focused && styles.focused,
      ]}
    >
      <Text style={[styles.label, selected && styles.selectedLabel]}>
        {selected ? `✓ ${label}` : label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    minHeight: metrics.touchTarget,
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
    borderRadius: radius.full,
    borderWidth: metrics.borderThin,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  selected: { backgroundColor: colors.soft, borderColor: colors.actionDeep },
  pressed: { backgroundColor: colors.pressed },
  focused: Platform.select({
    web: {
      outlineColor: colors.focus,
      outlineStyle: 'solid',
      outlineWidth: metrics.focusWidth,
      outlineOffset: metrics.focusOffset,
    },
    default: {},
  }),
  label: { ...typography.caption, color: colors.text },
  selectedLabel: { color: colors.actionDeep, fontWeight: '600' },
});

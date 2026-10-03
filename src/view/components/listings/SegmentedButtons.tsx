import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, metrics, opacity, radius, spacing, typography } from '../../theme/nativeTheme';
import { AppIcon } from '../AppIcon';
import type { Choice } from './ChoiceChips';

/**
 * Botões segmentados do Material 3 (Figma 04.01, Venda · Troca · Doação): uma escolha
 * só, com a marca de seleção no segmento ativo para não depender apenas da cor.
 */
export function SegmentedButtons<T extends string>({
  label,
  options,
  value,
  onChange,
  disabled = false,
}: {
  label: string;
  options: readonly Choice<T>[];
  value: T;
  onChange: (value: T) => void;
  disabled?: boolean;
}) {
  return (
    <View style={styles.group} accessibilityRole="radiogroup" accessibilityLabel={label}>
      {options.map((option, index) => {
        const selected = option.value === value;
        return (
          <Pressable
            key={option.value}
            accessibilityRole="radio"
            accessibilityLabel={option.label}
            accessibilityState={{ selected, checked: selected, disabled }}
            disabled={disabled}
            onPress={() => onChange(option.value)}
            style={({ pressed, focused }: { pressed: boolean; focused?: boolean }) => [
              styles.segment,
              index === 0 && styles.first,
              index === options.length - 1 && styles.last,
              index > 0 && styles.joined,
              selected && styles.selected,
              pressed && styles.pressed,
              focused && styles.focused,
            ]}
          >
            {selected ? <AppIcon name="check" size={18} color={colors.onSelected} /> : null}
            <Text style={[styles.label, selected && styles.selectedLabel]}>{option.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  group: { flexDirection: 'row' },
  segment: {
    flex: 1,
    minHeight: metrics.touchTarget,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderWidth: metrics.borderThin,
    borderColor: colors.border,
  },
  first: {
    borderTopLeftRadius: radius.full,
    borderBottomLeftRadius: radius.full,
  },
  last: {
    borderTopRightRadius: radius.full,
    borderBottomRightRadius: radius.full,
  },
  joined: { marginLeft: -metrics.borderThin },
  selected: { backgroundColor: colors.selected },
  pressed: { opacity: opacity.high },
  label: { ...typography.labelLarge, color: colors.onSurface },
  selectedLabel: { color: colors.onSelected },
  focused: Platform.select({
    web: {
      outlineColor: colors.focus,
      outlineStyle: 'solid',
      outlineWidth: metrics.focusWidth,
      outlineOffset: metrics.focusOffset,
    },
    default: {},
  }),
});

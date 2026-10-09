import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, metrics, opacity, radius, spacing, typography } from '../../theme/nativeTheme';
import { AppIcon } from '../AppIcon';
import type { Choice } from './ChoiceChips';

const ios = Platform.OS === 'ios';

/**
 * Botões segmentados. Android e Web seguem o Material 3 (Figma 04.01, Venda · Troca ·
 * Doação): marca de seleção (`check`) no segmento ativo, para não depender só da cor.
 * No iPhone é o controle segmentado nativo (referência `IOSSegmentedControl`): trilho
 * `ios-cell`, segmento ativo numa pílula branca elevada — a forma e a sombra, não só a
 * cor, marcam a seleção, por isso não repete o ícone de marca aqui.
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
    <View
      style={[styles.group, ios && styles.iosGroup]}
      accessibilityRole="radiogroup"
      accessibilityLabel={label}
    >
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
              !ios && index === 0 && styles.first,
              !ios && index === options.length - 1 && styles.last,
              !ios && index > 0 && styles.joined,
              ios && styles.iosSegment,
              selected && (ios ? styles.iosSelected : styles.selected),
              pressed && styles.pressed,
              focused && styles.focused,
            ]}
          >
            {selected && !ios ? <AppIcon name="check" size={18} color={colors.onSelected} /> : null}
            <Text
              style={[
                ios ? styles.iosLabel : styles.label,
                selected && (ios ? styles.iosSelectedLabel : styles.selectedLabel),
              ]}
            >
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  group: { flexDirection: 'row' },
  // Trilho do controle nativo: fundo neutro, pílula ativa recuada 2 px (Figma 05.01).
  iosGroup: {
    backgroundColor: colors.iosCell,
    borderRadius: radius.small,
    padding: 2,
  },
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
  iosSegment: {
    borderWidth: 0,
    borderRadius: radius.small - 2,
    minHeight: metrics.touchTarget - 4,
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
  // Pílula branca elevada, sem depender da cor: a sombra e a forma já diferenciam.
  iosSelected: {
    backgroundColor: colors.surface,
    shadowColor: '#000000',
    shadowOpacity: 0.12,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  pressed: { opacity: opacity.high },
  label: { ...typography.labelLarge, color: colors.onSurface },
  selectedLabel: { color: colors.onSelected },
  iosLabel: { ...typography.iosFootnote, color: colors.iosSecondaryLabel },
  iosSelectedLabel: { color: colors.onSurface, fontWeight: '600' },
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

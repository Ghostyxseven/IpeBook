import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors, metrics, opacity, radius, spacing, typography } from '../../theme/nativeTheme';
import { AppIcon } from '../AppIcon';

export type Choice<T extends string> = { value: T; label: string };

/**
 * Uma escolha entre poucas opções: o filter chip do Material 3 no Figma (04.05),
 * contornado e, quando escolhido, com fundo tonal e a marca de seleção.
 *
 * `radiogroup` em vez de uma lista de botões: o leitor de tela anuncia "2 de 4"
 * e a pessoa entende que escolher uma desmarca a outra — o que um botão comum
 * não comunica.
 */
export function ChoiceChips<T extends string>({
  label,
  options,
  value,
  onChange,
  error,
  scroll = false,
}: {
  label: string;
  options: readonly Choice<T>[];
  value: T | null;
  onChange: (value: T) => void;
  error?: string;
  scroll?: boolean;
}) {
  const chips = options.map((option) => {
    const selected = option.value === value;
    return (
      <Pressable
        key={option.value}
        accessibilityRole="radio"
        accessibilityState={{ selected, checked: selected }}
        accessibilityLabel={option.label}
        onPress={() => onChange(option.value)}
        style={({ focused }: { pressed: boolean; focused?: boolean }) => [
          styles.target,
          focused && styles.focused,
        ]}
      >
        {({ pressed }) => (
          <View style={[styles.chip, selected && styles.selected, pressed && styles.pressed]}>
            {selected ? <AppIcon name="check" size={18} color={colors.onSelected} /> : null}
            <Text style={[styles.label, selected && styles.selectedLabel]}>{option.label}</Text>
          </View>
        )}
      </Pressable>
    );
  });

  return (
    <View style={styles.group} accessibilityRole="radiogroup" accessibilityLabel={label}>
      <Text style={styles.title}>{label}</Text>
      {scroll ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.row}
        >
          {chips}
        </ScrollView>
      ) : (
        <View style={styles.row}>{chips}</View>
      )}
      {error ? (
        <Text
          style={styles.error}
          accessibilityLiveRegion="polite"
          accessibilityLabel={`Erro: ${error}`}
        >
          {error}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  group: { gap: spacing.xxs },
  title: { ...typography.bodyLarge, color: colors.onSurface },
  row: { flexDirection: 'row', flexWrap: 'wrap', columnGap: spacing.xs },
  target: { minHeight: metrics.touchTarget, justifyContent: 'center' },
  chip: {
    minHeight: spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: radius.small,
    borderWidth: metrics.borderThin,
    borderColor: colors.border,
  },
  selected: {
    paddingLeft: spacing.xs,
    borderColor: colors.selected,
    backgroundColor: colors.selected,
  },
  pressed: { opacity: opacity.high },
  label: { ...typography.labelLarge, color: colors.onSurfaceVariant },
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
  error: { ...typography.caption, color: colors.error },
});

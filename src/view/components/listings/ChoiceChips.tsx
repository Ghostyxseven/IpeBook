import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors, metrics, radius, spacing, typography } from '../../theme/nativeTheme';

export type Choice<T extends string> = { value: T; label: string };

/**
 * Uma escolha entre poucas opções, como o Chip do design system.
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
        style={({ pressed }) => [
          styles.chip,
          selected && styles.selected,
          pressed && styles.pressed,
        ]}
      >
        <Text style={[styles.label, selected && styles.selectedLabel]}>{option.label}</Text>
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
  group: { gap: spacing.xs },
  title: { ...typography.labelMedium, color: colors.secondaryText },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  chip: {
    minHeight: metrics.touchTarget,
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
    borderRadius: radius.full,
    borderWidth: metrics.borderThin,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  selected: { backgroundColor: colors.soft, borderColor: colors.action },
  pressed: { backgroundColor: colors.pressed },
  label: { ...typography.labelLarge, color: colors.text },
  selectedLabel: { color: colors.actionDeep },
  error: { ...typography.caption, color: colors.error },
});

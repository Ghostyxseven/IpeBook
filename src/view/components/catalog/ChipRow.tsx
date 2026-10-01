import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors, spacing, typography } from '../../theme/nativeTheme';
import { Chip } from './Chip';

/** Linha rolável de chips com título de grupo para leitores de tela. */
export function ChipRow<T extends string>({
  title,
  options,
  isSelected,
  onToggle,
  labelOf = (value) => value,
}: {
  title: string;
  options: readonly T[];
  isSelected: (value: T) => boolean;
  onToggle: (value: T) => void;
  labelOf?: (value: T) => string;
}) {
  return (
    <View style={styles.group} accessibilityLabel={title}>
      <Text style={styles.title} accessibilityRole="header">
        {title}
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.row}
      >
        {options.map((value) => (
          <Chip
            key={value}
            label={labelOf(value)}
            selected={isSelected(value)}
            onPress={() => onToggle(value)}
          />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  group: { gap: spacing.xs },
  title: { ...typography.caption, color: colors.secondaryText, fontWeight: '600' },
  row: { gap: spacing.xs, paddingRight: spacing.md },
});

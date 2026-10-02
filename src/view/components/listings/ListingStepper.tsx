import { StyleSheet, Text, View } from 'react-native';
import { colors, metrics, radius, spacing, typography } from '../../theme/nativeTheme';

/**
 * Onde a pessoa está no fluxo de publicar.
 *
 * O número em palavras ("Passo 2 de 4") é o que o leitor de tela anuncia; as
 * barras são reforço visual e ficam escondidas da acessibilidade, senão
 * viram quatro elementos sem significado.
 */
export function ListingStepper({
  current,
  total,
  title,
}: {
  current: number;
  total: number;
  title: string;
}) {
  return (
    <View style={styles.wrapper}>
      <Text style={styles.counter}>{`Passo ${current} de ${total}`}</Text>
      <Text accessibilityRole="header" style={styles.title}>
        {title}
      </Text>
      <View
        style={styles.bars}
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
      >
        {Array.from({ length: total }, (_, index) => (
          <View key={index} style={[styles.bar, index < current && styles.done]} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: spacing.xs },
  counter: { ...typography.labelMedium, color: colors.secondaryText },
  title: { ...typography.titleLarge, color: colors.text },
  bars: { flexDirection: 'row', gap: spacing.xxs },
  bar: {
    flex: 1,
    height: metrics.borderStrong,
    borderRadius: radius.full,
    backgroundColor: colors.disabledBackground,
  },
  done: { backgroundColor: colors.action },
});

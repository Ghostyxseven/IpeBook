import { StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing, typography } from '../../theme/nativeTheme';

/** Logotipo tipográfico "IpêBook" com o traço âmbar embaixo (Figma, componente "Logotipo IpêBook"). */
/** `underline` desliga o traço, como na tela de boas-vindas (Figma 01.01). */
export function Wordmark({ underline = true }: { underline?: boolean }) {
  return (
    <View style={styles.container} accessibilityRole="image" accessibilityLabel="IpêBook">
      <Text style={styles.text}>IpêBook</Text>
      {underline && <View style={styles.underline} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignSelf: 'flex-start', gap: spacing.xxs },
  text: { ...typography.brandWordmark, color: colors.brandBrown },
  // Traço decorativo de 36 × 4 px do Figma.
  underline: {
    width: spacing.xl + spacing.xxs,
    height: spacing.xxs,
    borderRadius: radius.full,
    backgroundColor: colors.brandAmber,
  },
});

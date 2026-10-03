import { StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing, typography } from '../../theme/nativeTheme';

/** Logotipo tipográfico "IpêBook" com o traço âmbar embaixo (Figma, componente "Logotipo IpêBook"). */
export function Wordmark() {
  return (
    <View style={styles.container} accessibilityRole="image" accessibilityLabel="IpêBook">
      <Text style={styles.text}>IpêBook</Text>
      <View style={styles.underline} />
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

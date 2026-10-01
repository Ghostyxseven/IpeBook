import { ActivityIndicator, Image, StyleSheet, Text, View } from 'react-native';
import { colors, spacing, typography } from '../theme/nativeTheme';

/** Abertura exibida enquanto a sessão salva no aparelho é lida. */
export function SplashScreen() {
  return (
    <View
      style={styles.container}
      accessibilityRole="progressbar"
      accessibilityLabel="Abrindo o IpêBook"
    >
      <Image
        source={require('../../../assets/logo-web-224.webp')}
        style={styles.logo}
        accessibilityIgnoresInvertColors
      />
      <Text style={styles.brand}>IpêBook</Text>
      <Text style={styles.tagline}>Boas histórias merecem novos leitores.</Text>
      <ActivityIndicator color={colors.action} style={styles.indicator} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    padding: spacing.lg,
    backgroundColor: colors.background,
  },
  logo: { width: 112, height: 112, borderRadius: 56 },
  brand: { ...typography.title, color: colors.text, marginTop: spacing.md },
  tagline: { ...typography.body, color: colors.secondaryText, textAlign: 'center' },
  indicator: { marginTop: spacing.lg },
});

import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { colors, spacing, typography } from '../../theme/nativeTheme';

export function LoadingState({ message = 'Carregando…' }: { message?: string }) {
  return (
    <View style={styles.container} accessibilityRole="progressbar" accessibilityLabel={message}>
      <ActivityIndicator size="large" color={colors.action} />
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    padding: spacing.lg,
  },
  text: { ...typography.body, color: colors.secondaryText, textAlign: 'center' },
});

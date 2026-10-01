import { StyleSheet, Text, View } from 'react-native';
import { colors, metrics, spacing, typography } from '../../theme/nativeTheme';
import { Button } from '../ui/Button';

export function ErrorState({
  title = 'Algo deu errado',
  message,
  onRetry,
  retrying = false,
}: {
  title?: string;
  message: string;
  onRetry?: () => void;
  retrying?: boolean;
}) {
  return (
    <View style={styles.container} accessibilityRole="alert">
      <Text style={styles.title} accessibilityRole="header">
        {title}
      </Text>
      <Text style={styles.text}>{message}</Text>
      {onRetry && <Button label="Tentar novamente" onPress={onRetry} loading={retrying} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
    padding: spacing.lg,
    borderRadius: metrics.cardRadius,
    borderLeftWidth: spacing.xxs,
    borderLeftColor: colors.error,
    backgroundColor: colors.surface,
  },
  title: { ...typography.section, color: colors.text },
  text: { ...typography.body, color: colors.secondaryText },
});

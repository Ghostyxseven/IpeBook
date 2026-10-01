import { StyleSheet, Text, View } from 'react-native';
import { colors, metrics, spacing, typography } from '../../theme/nativeTheme';
import { Button } from '../ui/Button';

export function EmptyState({
  title,
  message,
  actionLabel,
  onAction,
}: {
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <View style={styles.container}>
      <Text style={styles.title} accessibilityRole="header">
        {title}
      </Text>
      <Text style={styles.text}>{message}</Text>
      {actionLabel && onAction && (
        <Button label={actionLabel} variant="secondary" onPress={onAction} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'stretch',
    gap: spacing.sm,
    padding: spacing.lg,
    borderRadius: metrics.cardRadius,
    backgroundColor: colors.surface,
  },
  title: { ...typography.section, color: colors.text },
  text: { ...typography.body, color: colors.secondaryText },
});

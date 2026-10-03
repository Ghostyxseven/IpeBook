import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing, typography } from '../../theme/nativeTheme';
import { Button } from '../ui/Button';

/**
 * Estado vazio conforme o Figma IpêBook (ex.: 02.14 · Favoritos · vazio): título de marca,
 * explicação do que fazer e a ação principal que leva a pessoa adiante, sem cartão.
 */
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
      {actionLabel && onAction && <Button label={actionLabel} onPress={onAction} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'stretch', gap: spacing.md, paddingVertical: spacing.lg },
  title: { ...typography.brandTitle, color: colors.onSurface },
  text: { ...typography.bodyLarge, color: colors.onSurfaceVariant },
});

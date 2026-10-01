import { StyleSheet, Text, View } from 'react-native';
import { colors, metrics, spacing, typography } from '../../theme/nativeTheme';

/** Mensagem do formulário inteiro (erro do servidor ou confirmação). */
export function FormMessage({
  tone,
  message,
}: {
  tone: 'error' | 'success';
  message?: string | null;
}) {
  if (!message) return null;
  return (
    <View
      accessibilityRole="alert"
      accessibilityLiveRegion="assertive"
      style={[styles.box, tone === 'error' ? styles.error : styles.success]}
    >
      <Text style={[styles.title, { color: tone === 'error' ? colors.error : colors.success }]}>
        {tone === 'error' ? 'Não foi possível continuar' : 'Tudo certo'}
      </Text>
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    borderRadius: metrics.cardRadius,
    borderLeftWidth: spacing.xxs,
    padding: spacing.md,
    gap: spacing.xxs,
    backgroundColor: colors.surface,
  },
  error: { borderLeftColor: colors.error },
  success: { borderLeftColor: colors.success },
  title: { ...typography.action },
  text: { ...typography.body, color: colors.text },
});

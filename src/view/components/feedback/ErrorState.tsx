import { StyleSheet, Text, View } from 'react-native';
import { AppIcon } from '../AppIcon';
import { colors, spacing, typography } from '../../theme/nativeTheme';
import { Button } from '../ui/Button';

/** Lado do círculo do ícone nos estados do sistema (Figma 10.02 e 10.03: 96 px). */
const ICON_CIRCLE = spacing.xxl * 2;

/**
 * Estado de erro centralizado, conforme o Figma IpêBook (seção "10 · Estados do sistema"):
 * círculo com ícone, título, explicação e "Tentar novamente".
 * - `tone="error"` (10.03 · Erro ao carregar): círculo em `errorContainer`, título 24/32.
 * - `tone="offline"` (10.02 · Sem conexão): círculo neutro e título de marca.
 */
export function ErrorState({
  title,
  message,
  onRetry,
  retrying = false,
  tone = 'error',
  secondaryAction,
}: {
  title?: string;
  message: string;
  onRetry?: () => void;
  retrying?: boolean;
  tone?: 'error' | 'offline';
  /** Ação de apoio em botão de texto, como "Ver favoritos" no quadro 10.02. */
  secondaryAction?: { label: string; onPress: () => void };
}) {
  const offline = tone === 'offline';
  const heading = title ?? (offline ? 'Você está sem internet.' : 'Algo deu errado');
  return (
    <View style={styles.container} accessibilityRole="alert">
      <View
        style={[styles.circle, offline ? styles.circleOffline : styles.circleError]}
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
      >
        <AppIcon name="error" size={spacing.xl} color={colors.error} />
      </View>
      <Text style={offline ? styles.titleOffline : styles.title} accessibilityRole="header">
        {heading}
      </Text>
      <Text style={styles.text}>{message}</Text>
      {(onRetry || secondaryAction) && (
        <View style={styles.actions}>
          {onRetry && <Button label="Tentar novamente" onPress={onRetry} loading={retrying} />}
          {secondaryAction && (
            <Button
              label={secondaryAction.label}
              variant="text"
              onPress={secondaryAction.onPress}
            />
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', gap: spacing.md, paddingVertical: spacing.lg },
  circle: {
    width: ICON_CIRCLE,
    height: ICON_CIRCLE,
    borderRadius: ICON_CIRCLE / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleError: { backgroundColor: colors.errorContainer },
  circleOffline: { backgroundColor: colors.containerHigh },
  title: { ...typography.titleLarge, color: colors.onSurface, textAlign: 'center' },
  titleOffline: { ...typography.brandHeadline, color: colors.onSurface, textAlign: 'center' },
  text: { ...typography.bodyLarge, color: colors.onSurfaceVariant, textAlign: 'center' },
  actions: { alignSelf: 'stretch', gap: spacing.xs },
});

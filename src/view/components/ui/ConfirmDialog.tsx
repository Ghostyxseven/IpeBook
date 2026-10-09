import { useEffect, useState } from 'react';
import { AccessibilityInfo, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, metrics, radius, spacing, typography } from '../../theme/nativeTheme';
import { Button } from './Button';

/**
 * Diálogo de confirmação do Material 3 (Figma 09.02 e 07.11): título, texto e as
 * ações em botões de texto, à direita. Tocar fora cancela, como no Android.
 */
export function ConfirmDialog({
  visible,
  title,
  message,
  confirmLabel,
  onConfirm,
  onCancel,
  busy = false,
  error,
  destructive = false,
}: {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
  busy?: boolean;
  error?: string | null;
  /** Ação que apaga algo (Figma 07.09, "Excluir"): o botão de confirmar fica vermelho. */
  destructive?: boolean;
}) {
  const reducedMotion = useReducedMotion();
  return (
    <Modal
      visible={visible}
      transparent
      animationType={reducedMotion ? 'none' : 'fade'}
      onRequestClose={onCancel}
    >
      <View style={styles.center}>
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={busy ? undefined : onCancel}
          accessibilityRole="button"
          accessibilityLabel="Cancelar"
        >
          {/* O véu usa preto a 32% (o valor do M3), porque não há token de véu. */}
          <View style={styles.scrim} />
        </Pressable>
        <View style={styles.dialog} accessibilityViewIsModal accessibilityRole="alert">
          <Text style={styles.title} accessibilityRole="header">
            {title}
          </Text>
          <Text style={styles.message}>{message}</Text>
          {error ? (
            <Text style={styles.error} accessibilityLiveRegion="polite">
              {error}
            </Text>
          ) : null}
          <View style={styles.actions}>
            <Button label="Cancelar" variant="text" onPress={onCancel} disabled={busy} />
            <Button
              label={confirmLabel}
              variant={destructive ? 'danger' : 'text'}
              onPress={onConfirm}
              loading={busy}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    let active = true;
    AccessibilityInfo.isReduceMotionEnabled().then((value) => active && setReduced(value));
    const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduced);
    return () => {
      active = false;
      subscription.remove();
    };
  }, []);
  return reduced;
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  scrim: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.32)' },
  dialog: {
    width: '100%',
    maxWidth: 360,
    padding: spacing.lg,
    gap: spacing.md,
    borderRadius: radius.extraLarge,
    backgroundColor: colors.containerHigh,
  },
  title: {
    ...typography.titleLarge,
    fontSize: 24,
    lineHeight: 32,
    fontWeight: '400',
    color: colors.onSurface,
  },
  message: { ...typography.bodyMedium, color: colors.onSurfaceVariant },
  error: { ...typography.caption, color: colors.error },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.xs,
    marginTop: spacing.xs,
    minHeight: metrics.touchTarget,
  },
});

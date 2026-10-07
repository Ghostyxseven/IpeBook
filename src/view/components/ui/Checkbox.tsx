import { Platform, Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import { colors, metrics, radius, spacing, typography } from '../../theme/nativeTheme';
import { AppIcon } from '../AppIcon';

const ios = Platform.OS === 'ios';

/**
 * Aceite com caixa de seleção (Figma 01.03). No Android e na Web é o item de lista com
 * checkbox do Material 3; no iPhone é a linha agrupada com ícone e chave (Toggle), como no
 * quadro do iOS. A linha inteira é tocável (mínimo de 48 px) e o estado é anunciado.
 */
export function Checkbox({
  label,
  supportingText,
  checked,
  onToggle,
  error,
}: {
  label: string;
  supportingText?: string;
  checked: boolean;
  onToggle: () => void;
  error?: string;
}) {
  const accessibilityLabel = supportingText ? `${label} ${supportingText}` : label;
  return (
    <View style={styles.wrapper}>
      {ios ? (
        <Pressable
          accessibilityRole="switch"
          accessibilityState={{ checked }}
          accessibilityLabel={accessibilityLabel}
          accessibilityHint={error}
          onPress={onToggle}
          style={[styles.iosRow, error ? styles.iosRowError : null]}
        >
          <View style={styles.iosIcon}>
            <AppIcon name="document" size={18} color={colors.onSelected} />
          </View>
          <Text style={styles.iosLabel}>{accessibilityLabel}</Text>
          {/* A linha já é o controle acessível; a chave só mostra o estado. */}
          <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
            <Switch
              value={checked}
              onValueChange={onToggle}
              trackColor={{ false: colors.containerHigh, true: colors.action }}
              ios_backgroundColor={colors.containerHigh}
            />
          </View>
        </Pressable>
      ) : (
        <Pressable
          accessibilityRole="checkbox"
          accessibilityState={{ checked }}
          accessibilityLabel={accessibilityLabel}
          accessibilityHint={error}
          onPress={onToggle}
          style={({ focused }: { pressed: boolean; focused?: boolean }) => [
            styles.row,
            focused && styles.focused,
          ]}
        >
          <View style={styles.box}>
            <AppIcon
              name={checked ? 'checkboxOn' : 'checkboxOff'}
              color={error ? colors.error : checked ? colors.action : colors.onSurfaceVariant}
            />
          </View>
          <View style={styles.copy}>
            <Text style={styles.label}>{label}</Text>
            {supportingText && <Text style={styles.supporting}>{supportingText}</Text>}
          </View>
        </Pressable>
      )}
      {error && (
        <Text style={styles.error} accessibilityLiveRegion="polite">
          {error}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: spacing.xxs },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    minHeight: metrics.touchTarget,
    paddingHorizontal: spacing.xs,
  },
  focused: {
    borderRadius: metrics.fieldRadius,
    outlineWidth: metrics.focusWidth,
    outlineColor: colors.focus,
    outlineStyle: 'solid',
  },
  box: {
    width: metrics.touchTarget,
    height: metrics.touchTarget,
    alignItems: 'center',
    justifyContent: 'center',
  },
  copy: { flex: 1 },
  label: { ...typography.bodyLarge, color: colors.onSurface },
  supporting: { ...typography.bodyMedium, color: colors.onSurfaceVariant },
  error: { ...typography.bodyMedium, color: colors.error, paddingHorizontal: spacing.md },
  // iPhone (Figma 01.03): célula agrupada com ícone em quadro verde e chave à direita.
  iosRow: {
    minHeight: metrics.touchTarget + spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: metrics.fieldRadius,
    borderWidth: metrics.borderThin,
    borderColor: 'transparent',
    backgroundColor: colors.iosCell,
  },
  iosRowError: { borderColor: colors.error },
  iosIcon: {
    width: spacing.xl,
    height: spacing.xl,
    borderRadius: radius.small,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.selected,
  },
  iosLabel: { ...typography.iosBody, color: colors.onSurface, flex: 1 },
});

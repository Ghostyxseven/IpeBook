import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, metrics, radius, spacing, typography } from '../../theme/nativeTheme';
import { AppIcon } from '../AppIcon';

const focusRing = Platform.select({
  web: {
    outlineColor: colors.focus,
    outlineStyle: 'solid' as const,
    outlineWidth: metrics.focusWidth,
    outlineOffset: metrics.focusOffset,
  },
  default: {},
});

/** Ícone de acesso aos avisos, com o número de não lidos (também dito pelo rótulo acessível). */
export function NotificationBell({
  badgeText,
  accessibilityLabel,
  onPress,
}: {
  badgeText: string;
  accessibilityLabel: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      style={({ pressed, focused }: { pressed: boolean; focused?: boolean }) => [
        styles.button,
        pressed && styles.pressed,
        focused && focusRing,
      ]}
    >
      <AppIcon name="bell" />
      {badgeText !== '' && (
        <View style={styles.badge} importantForAccessibility="no-hide-descendants">
          <Text style={styles.badgeText}>{badgeText}</Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: metrics.touchTarget,
    height: metrics.touchTarget,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: { backgroundColor: colors.pressed },
  badge: {
    position: 'absolute',
    top: spacing.xxs,
    right: spacing.xxs,
    minWidth: spacing.md,
    height: spacing.md,
    paddingHorizontal: spacing.xxs,
    borderRadius: radius.full,
    backgroundColor: colors.error,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: { ...typography.labelMedium, color: colors.surface },
});

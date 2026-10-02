import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import type { AppNotification, NotificationKind } from '../../../model/entities/Notification';
import {
  isUnread,
  notificationAccessibilityLabel,
  notificationSubtitle,
} from '../../../model/services/notificationFormat';
import { colors, metrics, spacing, typography } from '../../theme/nativeTheme';
import { AppIcon, type AppIconName } from '../AppIcon';

const focusRing = Platform.select({
  web: {
    outlineColor: colors.focus,
    outlineStyle: 'solid' as const,
    outlineWidth: metrics.focusWidth,
    outlineOffset: metrics.focusOffset,
  },
  default: {},
});

/** Ícone de cada tipo de aviso à esquerda da linha (Figma 35). */
const kindIcons: Record<NotificationKind, AppIconName> = {
  request_received: 'swap',
  request_accepted: 'check',
  request_declined: 'close',
  listing_reserved: 'bookmark',
  deal_completed: 'checkCircle',
};

/**
 * Linha de aviso do Figma 35: ícone do tipo, título, "detalhe · hora" e seta à direita.
 * Aviso não lido tem título em negrito e é anunciado como "Não lida"; a cor nunca é o único sinal.
 */
export function NotificationItem({
  notification,
  onPress,
}: {
  notification: AppNotification;
  onPress: () => void;
}) {
  const unread = isUnread(notification);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={notificationAccessibilityLabel(notification)}
      accessibilityHint={notification.targetListingId ? 'Abre o anúncio' : undefined}
      onPress={onPress}
      style={({ pressed, focused }: { pressed: boolean; focused?: boolean }) => [
        styles.item,
        pressed && styles.pressed,
        focused && focusRing,
      ]}
    >
      <View style={styles.icon}>
        <AppIcon name={kindIcons[notification.kind]} color={colors.secondaryText} />
      </View>
      <View style={styles.copy}>
        <Text style={[styles.title, unread && styles.titleUnread]}>{notification.title}</Text>
        <Text style={styles.subtitle}>{notificationSubtitle(notification)}</Text>
      </View>
      <AppIcon name="chevronRight" color={colors.secondaryText} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  item: {
    minHeight: metrics.touchTarget + spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.xs,
    borderRadius: metrics.fieldRadius,
  },
  pressed: { backgroundColor: colors.pressed },
  icon: { width: spacing.xl, alignItems: 'center' },
  copy: { flex: 1, gap: spacing.xxs },
  title: { ...typography.bodyLarge, color: colors.text },
  titleUnread: { fontWeight: '700' },
  subtitle: { ...typography.bodyMedium, color: colors.secondaryText },
});

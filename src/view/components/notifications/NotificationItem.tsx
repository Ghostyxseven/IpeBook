import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import type { AppNotification, NotificationKind } from '../../../model/entities/Notification';
import {
  isUnread,
  notificationAccessibilityLabel,
  notificationSubtitle,
} from '../../../model/services/notificationFormat';
import { colors, metrics, radius, spacing, typography } from '../../theme/nativeTheme';
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

/** Ícone de cada tipo de aviso à esquerda da linha (Figma 07.04). */
const kindIcons: Record<NotificationKind, AppIconName> = {
  request_received: 'swap',
  request_accepted: 'check',
  request_declined: 'close',
  listing_reserved: 'bookmark',
  deal_completed: 'checkCircle',
};

/**
 * Linha de aviso do Figma 07.04: ícone do tipo, título, "detalhe · hora" e seta à direita.
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
        <AppIcon name={kindIcons[notification.kind]} color={colors.onSurfaceVariant} />
      </View>
      <View style={styles.copy}>
        <Text style={[styles.title, unread && styles.titleUnread]}>{notification.title}</Text>
        <Text style={styles.subtitle} numberOfLines={2}>
          {notificationSubtitle(notification)}
        </Text>
      </View>
      <AppIcon name="chevronRight" color={colors.onSurfaceVariant} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  // Item de lista do Material 3 com duas linhas (Figma 07.04): 70 de altura e recuo de 16.
  item: {
    minHeight: 70,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: radius.small,
  },
  pressed: { backgroundColor: colors.pressed },
  icon: { width: 24, alignItems: 'center' },
  copy: { flex: 1 },
  title: { ...typography.bodyLarge, color: colors.onSurface },
  titleUnread: { fontWeight: '700' },
  subtitle: { ...typography.bodyMedium, color: colors.onSurfaceVariant },
});

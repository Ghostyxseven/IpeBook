import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import type { AppNotification } from '../../../model/entities/Notification';
import {
  isUnread,
  notificationAccessibilityLabel,
  relativeTime,
} from '../../../model/services/notificationFormat';
import { colors, metrics, radius, spacing, typography } from '../../theme/nativeTheme';

const focusRing = Platform.select({
  web: {
    outlineColor: colors.focus,
    outlineStyle: 'solid' as const,
    outlineWidth: metrics.focusWidth,
    outlineOffset: metrics.focusOffset,
  },
  default: {},
});

/** Um aviso: título, texto curto, data relativa e marca de "não lida" (ponto e texto, nunca só cor). */
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
        unread && styles.unread,
        pressed && styles.pressed,
        focused && focusRing,
      ]}
    >
      <View style={[styles.dot, unread ? styles.dotUnread : styles.dotRead]} />
      <View style={styles.copy}>
        <Text style={[styles.title, unread && styles.titleUnread]}>{notification.title}</Text>
        {notification.body.trim() !== '' && <Text style={styles.body}>{notification.body}</Text>}
        <View style={styles.meta}>
          <Text style={styles.time}>{relativeTime(notification.createdAt)}</Text>
          {unread && <Text style={styles.tag}>Não lida</Text>}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  item: {
    minHeight: metrics.touchTarget,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: metrics.cardRadius,
    borderWidth: metrics.borderThin,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  unread: { backgroundColor: colors.surface, borderColor: colors.action },
  pressed: { backgroundColor: colors.pressed },
  dot: { width: 10, height: 10, borderRadius: radius.full, marginTop: spacing.xs },
  dotUnread: { backgroundColor: colors.action },
  dotRead: { borderWidth: metrics.borderThin, borderColor: colors.border },
  copy: { flex: 1, gap: spacing.xxs },
  title: { ...typography.bodyMedium, color: colors.text },
  titleUnread: { fontWeight: '700' },
  body: { ...typography.bodyMedium, color: colors.secondaryText },
  meta: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  time: { ...typography.labelMedium, color: colors.secondaryText },
  tag: { ...typography.labelMedium, fontWeight: '700', color: colors.actionDeep },
});

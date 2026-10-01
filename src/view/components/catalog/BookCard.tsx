import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import type { Listing, Modality } from '../../../model/entities/Listing';
import {
  conditionLabels,
  listingAccessibilityLabel,
  locationLabel,
  modalitySummary,
} from '../../../model/services/catalogFormat';
import { badgeColors, colors, metrics, radius, spacing, typography } from '../../theme/nativeTheme';
import { ListingCover } from './ListingCover';
import { StatusBadge } from './StatusBadge';

const badgePalette: Record<Modality, { background: string; text: string }> = {
  sale: badgeColors.sale,
  trade: badgeColors.trade,
  donation: badgeColors.donation,
};

/** IpêBook / Book Card na lista do Explorar (Figma 03), lido como um único item. */
export function BookCard({ listing, onPress }: { listing: Listing; onPress: () => void }) {
  const badge = badgePalette[listing.modality];
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={listingAccessibilityLabel(listing)}
      accessibilityHint="Abre os detalhes do livro"
      onPress={onPress}
      style={({ pressed, focused }: { pressed: boolean; focused?: boolean }) => [
        styles.card,
        pressed && styles.pressed,
        focused && styles.focused,
      ]}
    >
      <ListingCover listing={listing} variant="row" />
      <View style={styles.body}>
        <Text style={styles.title} numberOfLines={2}>
          {listing.title}
        </Text>
        <Text style={styles.author} numberOfLines={1}>
          {listing.author}
        </Text>
        <View style={[styles.badge, { backgroundColor: badge.background }]}>
          <Text style={[styles.badgeText, { color: badge.text }]}>{modalitySummary(listing)}</Text>
        </View>
        {listing.status === 'reservado' && <StatusBadge variant="reserved" />}
        <Text style={styles.meta} numberOfLines={1}>
          {[conditionLabels[listing.condition], locationLabel(listing)].filter(Boolean).join(' · ')}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: metrics.fieldRadius,
    borderWidth: metrics.borderThin,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  pressed: { backgroundColor: colors.pressed },
  focused: Platform.select({
    web: {
      outlineColor: colors.focus,
      outlineStyle: 'solid',
      outlineWidth: metrics.focusWidth,
      outlineOffset: metrics.focusOffset,
    },
    default: {},
  }),
  body: { flex: 1, gap: spacing.xs, alignItems: 'flex-start' },
  title: { ...typography.bodyLarge, fontWeight: '500', color: colors.text },
  author: { ...typography.labelMedium, color: colors.text },
  badge: { borderRadius: radius.small, paddingHorizontal: spacing.xxs },
  badgeText: { ...typography.bodyLarge, fontWeight: '500' },
  meta: { ...typography.labelMedium, color: colors.secondaryText },
});

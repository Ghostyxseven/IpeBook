import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import type { Listing } from '../../../model/entities/Listing';
import {
  conditionLabels,
  listingAccessibilityLabel,
  locationLabel,
  priceLabel,
} from '../../../model/services/catalogFormat.ts';
import { colors, metrics, spacing, typography } from '../../theme/nativeTheme';
import { ListingCover } from './ListingCover';
import { StatusBadge } from './StatusBadge';

/** IpêBook / Book Card: conteúdo mínimo do design system, lido como um único item. */
export function BookCard({ listing, onPress }: { listing: Listing; onPress: () => void }) {
  const price = priceLabel(listing);
  const location = locationLabel(listing);
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
      <ListingCover uri={listing.coverUrl} title={listing.title} width={72} />
      <View style={styles.body}>
        <View style={styles.badges}>
          <StatusBadge variant={listing.modality} />
          {listing.status === 'reservado' && <StatusBadge variant="reserved" />}
        </View>
        <Text style={styles.title} numberOfLines={2}>
          {listing.title}
        </Text>
        <Text style={styles.secondary} numberOfLines={1}>
          {listing.author}
        </Text>
        {price && <Text style={styles.price}>{price}</Text>}
        <Text style={styles.secondary} numberOfLines={1}>
          {[conditionLabels[listing.condition], location].filter(Boolean).join(' · ')}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.sm,
    minHeight: metrics.touchTarget,
    borderRadius: metrics.cardRadius,
    backgroundColor: colors.surface,
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
  body: { flex: 1, gap: spacing.xxs },
  badges: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xxs },
  title: { ...typography.section, color: colors.text },
  secondary: { ...typography.caption, color: colors.secondaryText },
  price: { ...typography.action, color: colors.text },
});

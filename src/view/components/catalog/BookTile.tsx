import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import type { Listing } from '../../../model/entities/Listing';
import {
  listingAccessibilityLabel,
  listingMeta,
  tileValue,
} from '../../../model/services/catalogFormat';
import { colors, metrics, spacing, typography } from '../../theme/nativeTheme';
import { ListingCover } from './ListingCover';
import { StatusBadge } from './StatusBadge';

/** Card compacto da grade do Início (Figma 02, "Seleção de livros"). */
export function BookTile({ listing, onPress }: { listing: Listing; onPress: () => void }) {
  const value = tileValue(listing);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={listingAccessibilityLabel(listing)}
      accessibilityHint="Abre os detalhes do livro"
      onPress={onPress}
      style={({ pressed, focused }: { pressed: boolean; focused?: boolean }) => [
        styles.tile,
        pressed && styles.pressed,
        focused && styles.focused,
      ]}
    >
      <ListingCover listing={listing} variant="tile" />
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={1}>
          {listing.title}
        </Text>
        {value && <Text style={styles.value}>{value}</Text>}
        {listing.status === 'reservado' && <StatusBadge variant="reserved" />}
        <Text style={styles.meta} numberOfLines={1}>
          {listingMeta(listing)}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tile: {
    flex: 1,
    minHeight: 190,
    overflow: 'hidden',
    gap: spacing.xxs,
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
  info: { paddingHorizontal: spacing.sm, paddingBottom: spacing.xs, gap: spacing.xxs },
  title: { ...typography.bodyMedium, fontWeight: '700', color: colors.text },
  value: { ...typography.bodyMedium, fontWeight: '500', color: colors.text },
  meta: { ...typography.labelMedium, color: colors.secondaryText },
});

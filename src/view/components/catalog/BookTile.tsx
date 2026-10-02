import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import type { Listing } from '../../../model/entities/Listing';
import { cardOverline, listingAccessibilityLabel } from '../../../model/services/catalogFormat';
import { colors, metrics, radius, spacing, typography } from '../../theme/nativeTheme';
import { ListingCover } from './ListingCover';
import { StatusBadge } from './StatusBadge';

/** Largura do card no carrossel do Início (Figma 02.01, "Card de livro"). */
export const BOOK_TILE_WIDTH = 166;

/** Card de livro do carrossel do Início (Figma 02.01): capa sobre o fundo e três linhas de texto. */
export function BookTile({ listing, onPress }: { listing: Listing; onPress: () => void }) {
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
      <View style={styles.coverArea}>
        <ListingCover listing={listing} variant="tile" />
      </View>
      <View style={styles.info}>
        <Text style={styles.overline} numberOfLines={1}>
          {cardOverline(listing)}
        </Text>
        <Text style={styles.title} numberOfLines={2}>
          {listing.title}
        </Text>
        <Text style={styles.author} numberOfLines={1}>
          {listing.author}
        </Text>
        {listing.status === 'reservado' && <StatusBadge variant="reserved" />}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: BOOK_TILE_WIDTH,
    borderRadius: radius.medium,
    backgroundColor: colors.containerLow,
    overflow: 'hidden',
    // Elevação 1 do Material 3.
    shadowColor: '#000000',
    shadowOpacity: 0.15,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  pressed: { backgroundColor: colors.containerHigh },
  focused: Platform.select({
    web: {
      outlineColor: colors.focus,
      outlineStyle: 'solid',
      outlineWidth: metrics.focusWidth,
      outlineOffset: metrics.focusOffset,
    },
    default: {},
  }),
  coverArea: {
    height: 144,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.container,
  },
  info: { paddingHorizontal: spacing.md, paddingVertical: 10, gap: 0, alignItems: 'flex-start' },
  overline: { ...typography.labelMedium, letterSpacing: 0.5, color: colors.onSurfaceVariant },
  title: { ...typography.bodyLarge, letterSpacing: 0.5, color: colors.onSurface },
  author: { ...typography.bodyMedium, letterSpacing: 0.25, color: colors.onSurfaceVariant },
});

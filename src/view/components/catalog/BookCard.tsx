import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import type { Listing } from '../../../model/entities/Listing';
import { cardValue, listingAccessibilityLabel } from '../../../model/services/catalogFormat';
import { BRAND_FONT, colors, metrics, spacing, typography } from '../../theme/nativeTheme';
import { AppIcon } from '../AppIcon';
import { FavoriteButton } from './FavoriteButton';
import { ListingCover } from './ListingCover';
import { StatusBadge } from './StatusBadge';

/**
 * IpêBook / Book Card na lista do Explorar (Figma 02.02, "Livro"): capa, título em serifa,
 * autor, etiqueta da modalidade com o valor e a seta de abrir. Lido como um único item.
 */
export function BookCard({
  listing,
  onPress,
  favorite,
  onToggleFavorite,
}: {
  listing: Listing;
  onPress: () => void;
  /** Sem isso, o card não mostra o coração (ex.: listas sem favoritos). */
  favorite?: boolean;
  onToggleFavorite?: () => void;
}) {
  const value = cardValue(listing);
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
        <View style={styles.tags}>
          <StatusBadge variant={listing.modality} />
          {value && (
            <Text style={styles.value} numberOfLines={1}>
              {value}
            </Text>
          )}
        </View>
        {listing.status === 'reservado' && <StatusBadge variant="reserved" />}
      </View>
      {onToggleFavorite && (
        <FavoriteButton
          favorite={Boolean(favorite)}
          onToggle={onToggleFavorite}
          title={listing.title}
        />
      )}
      <AppIcon name="chevronRight" color={colors.onSurfaceVariant} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: spacing.sm,
    // Figma: card de 16 de raio, fundo branco e elevação 1 do Material 3.
    borderRadius: spacing.md,
    backgroundColor: colors.containerLowest,
    shadowColor: '#000000',
    shadowOpacity: 0.15,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  pressed: { backgroundColor: colors.containerLow },
  focused: Platform.select({
    web: {
      outlineColor: colors.focus,
      outlineStyle: 'solid',
      outlineWidth: metrics.focusWidth,
      outlineOffset: metrics.focusOffset,
    },
    default: {},
  }),
  body: { flex: 1, gap: spacing.xxs, alignItems: 'flex-start' },
  title: { fontFamily: BRAND_FONT, fontSize: 19, lineHeight: 24, color: colors.onSurface },
  author: { ...typography.bodyMedium, color: colors.onSurfaceVariant },
  tags: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginTop: spacing.xxs },
  value: { ...typography.bodyMedium, fontWeight: '500', color: colors.onSurface, flexShrink: 1 },
});

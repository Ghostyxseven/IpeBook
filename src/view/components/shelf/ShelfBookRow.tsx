import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { Listing } from '../../../model/entities/Listing';
import { colors, radius, spacing, typography } from '../../theme/nativeTheme';
import { AppIcon } from '../AppIcon';
import { ListingCover } from '../catalog/ListingCover';

/** Linha da estante (Figma 05.01, "Livro · capa e lista Material 3"): capa, título, apoio e seta. */
export function ShelfBookRow({
  listing,
  supporting,
  hint,
  onPress,
  disabled = false,
}: {
  listing: Pick<Listing, 'id' | 'title' | 'author' | 'coverUrl'>;
  supporting: string;
  hint: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${listing.title}. ${supporting}`}
      accessibilityHint={hint}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && styles.pressed, disabled && styles.disabled]}
    >
      <ListingCover listing={listing} variant="shelf" />
      <View style={styles.text}>
        <Text style={styles.title} numberOfLines={1}>
          {listing.title}
        </Text>
        <Text style={styles.supporting} numberOfLines={2}>
          {supporting}
        </Text>
      </View>
      <AppIcon name="chevronRight" color={colors.onSurfaceVariant} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  // 104 de altura no Figma: capa de 80 com 12 por cima e por baixo.
  row: {
    minHeight: 104,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingLeft: spacing.sm,
    paddingRight: spacing.xs,
    borderRadius: radius.small,
  },
  pressed: { backgroundColor: colors.pressed },
  disabled: { opacity: 0.6 },
  text: { flex: 1, gap: 2 },
  title: { ...typography.bodyLarge, color: colors.onSurface },
  supporting: { ...typography.bodyMedium, color: colors.onSurfaceVariant },
});

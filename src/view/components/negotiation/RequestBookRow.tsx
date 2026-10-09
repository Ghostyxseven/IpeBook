import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { Listing } from '../../../model/entities/Listing';
import { conditionLabels, modalityLabels } from '../../../model/services/catalogFormat';
import { colors, radius, spacing, typography } from '../../theme/nativeTheme';
import { AppIcon } from '../AppIcon';
import { ListingCover } from '../catalog/ListingCover';

/** Livro da negociação (Figma 06.03 e 06.06): capa, título, autor · estado · modalidade e seta. */
export function RequestBookRow({
  listing,
  onPress,
  showModality = true,
}: {
  listing: Pick<Listing, 'id' | 'title' | 'author' | 'coverUrl' | 'condition' | 'modality'>;
  onPress: () => void;
  /** O livro oferecido na troca não mostra a modalidade do próprio anúncio. */
  showModality?: boolean;
}) {
  const details = [
    listing.author,
    conditionLabels[listing.condition],
    showModality ? modalityLabels[listing.modality] : null,
  ]
    .filter(Boolean)
    .join(' · ');
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${listing.title}. ${details}`}
      accessibilityHint="Abre o anúncio"
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
    >
      <ListingCover listing={listing} variant="row" />
      <View style={styles.text}>
        <Text style={styles.title} numberOfLines={2}>
          {listing.title}
        </Text>
        <Text style={styles.body} numberOfLines={2}>
          {details}
        </Text>
      </View>
      <AppIcon name="chevronRight" color={colors.onSurfaceVariant} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.xs,
    marginHorizontal: -spacing.xs,
    borderRadius: radius.small,
  },
  pressed: { backgroundColor: colors.pressed },
  text: { flex: 1, gap: spacing.xxs },
  title: { ...typography.bodyLarge, color: colors.onSurface },
  body: { ...typography.bodyMedium, color: colors.onSurfaceVariant },
});

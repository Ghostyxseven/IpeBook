import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import type { Listing } from '../../../model/entities/Listing';
import { colors, radius, spacing, typography } from '../../theme/nativeTheme';
import { AppIcon } from '../AppIcon';
import { StatusBadge, type BadgeVariant } from '../catalog/StatusBadge';
import { ListingCover } from '../catalog/ListingCover';

const ios = Platform.OS === 'ios';

/**
 * Linha da estante. Android e Web (Figma 05.01, "Livro · capa e lista Material 3"): capa,
 * título, uma linha de apoio e seta. No iPhone (Figma 05.01, 05.03 e 05.04, iOS), a linha
 * entra numa lista agrupada (ver `ShelfGroupedList`) e troca a modalidade embutida no texto
 * de apoio por um Status Badge próprio — é o componente de domínio do IpêBook, não um selo
 * novo inventado para esta tela.
 */
export function ShelfBookRow({
  listing,
  supporting,
  hint,
  onPress,
  disabled = false,
  badge,
}: {
  listing: Pick<Listing, 'id' | 'title' | 'author' | 'coverUrl'>;
  supporting: string;
  hint: string;
  onPress: () => void;
  disabled?: boolean;
  /** Só usado no iPhone: modalidade/situação como Status Badge, abaixo do título. */
  badge?: BadgeVariant;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${listing.title}. ${supporting}`}
      accessibilityHint={hint}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        ios && styles.iosRow,
        pressed && styles.pressed,
        disabled && styles.disabled,
      ]}
    >
      <ListingCover listing={listing} variant="shelf" />
      <View style={styles.text}>
        <Text style={ios ? styles.iosTitle : styles.title} numberOfLines={1}>
          {listing.title}
        </Text>
        <Text style={ios ? styles.iosSupporting : styles.supporting} numberOfLines={2}>
          {supporting}
        </Text>
        {ios && badge ? (
          <View style={styles.badgeRow}>
            <StatusBadge variant={badge} />
          </View>
        ) : null}
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
  // Dentro da lista agrupada do iOS (`ShelfGroupedList`): sem raio próprio, cantos
  // vêm do contêiner; respiro de 16/12 como nas outras listas agrupadas do app.
  iosRow: {
    minHeight: 88,
    borderRadius: 0,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  pressed: { backgroundColor: colors.pressed },
  disabled: { opacity: 0.6 },
  text: { flex: 1, gap: 2 },
  title: { ...typography.bodyLarge, color: colors.onSurface },
  supporting: { ...typography.bodyMedium, color: colors.onSurfaceVariant },
  iosTitle: { ...typography.iosBody, color: colors.onSurface },
  iosSupporting: { ...typography.iosFootnote, color: colors.iosSecondaryLabel },
  badgeRow: { paddingTop: 2 },
});

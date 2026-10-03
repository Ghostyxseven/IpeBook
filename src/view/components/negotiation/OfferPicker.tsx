import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import type { Listing, MyListing } from '../../../model/entities/Listing';
import { conditionLabels } from '../../../model/services/catalogFormat';
import { colors, metrics, radius, spacing, typography } from '../../theme/nativeTheme';
import { AppIcon } from '../AppIcon';
import { ListingCover } from '../catalog/ListingCover';

/**
 * Propor troca (Figma 03.05): o livro pedido no topo e os livros disponíveis de quem pede,
 * em rádio. Só anúncios publicados entram, porque o banco só aceita oferecer um deles.
 */
export function OfferPicker({
  wanted,
  ownerName,
  options,
  selectedId,
  onSelect,
}: {
  wanted: Pick<Listing, 'id' | 'title' | 'author' | 'coverUrl' | 'tradeTerms'>;
  ownerName: string;
  options: MyListing[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  return (
    <View style={styles.wrap}>
      <View style={styles.wanted}>
        <ListingCover listing={wanted} variant="shelf" />
        <View style={styles.flex}>
          <Text style={styles.caption}>Você recebe</Text>
          <Text style={styles.wantedTitle} numberOfLines={2}>
            {`${wanted.title} · ${ownerName}`}
          </Text>
        </View>
      </View>

      <Text style={styles.heading} accessibilityRole="header">
        Qual livro você oferece?
      </Text>
      {wanted.tradeTerms ? (
        <Text style={styles.terms}>{`${ownerName} aceita: ${wanted.tradeTerms}`}</Text>
      ) : null}

      <View accessibilityRole="radiogroup" accessibilityLabel="Livro que você oferece">
        {options.map((option) => {
          const selected = option.id === selectedId;
          const details = `Seu anúncio · ${conditionLabels[option.condition]}`;
          return (
            <Pressable
              key={option.id}
              accessibilityRole="radio"
              accessibilityLabel={`${option.title}. ${details}`}
              accessibilityState={{ checked: selected, selected }}
              onPress={() => onSelect(option.id)}
              style={({ pressed, focused }: { pressed: boolean; focused?: boolean }) => [
                styles.option,
                pressed && styles.pressed,
                focused && styles.focused,
              ]}
            >
              <ListingCover listing={option} variant="shelf" />
              <View style={styles.flex}>
                <Text style={styles.optionTitle} numberOfLines={2}>
                  {option.title}
                </Text>
                <Text style={styles.optionBody}>{details}</Text>
              </View>
              <AppIcon
                name={selected ? 'radioOn' : 'radioOff'}
                color={selected ? colors.action : colors.onSurfaceVariant}
              />
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.md },
  flex: { flex: 1 },
  wanted: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.medium,
    backgroundColor: colors.containerHigh,
  },
  caption: { ...typography.labelMedium, color: colors.onSurfaceVariant },
  wantedTitle: { ...typography.bodyLarge, color: colors.onSurface },
  heading: { ...typography.brandHeadline, color: colors.onSurface },
  terms: { ...typography.bodyMedium, color: colors.onSurfaceVariant, marginTop: -spacing.xs },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    minHeight: 56,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.xs,
    marginHorizontal: -spacing.xs,
    borderRadius: radius.small,
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
  optionTitle: { ...typography.bodyLarge, color: colors.onSurface },
  optionBody: { ...typography.bodyMedium, color: colors.onSurfaceVariant },
});

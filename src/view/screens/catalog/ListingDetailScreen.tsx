import { useLocalSearchParams, useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { Modality } from '../../../model/entities/Listing';
import {
  detailHeadline,
  detailMeta,
  locationLabel,
  publishedLabel,
} from '../../../model/services/catalogFormat';
import { useListingDetail } from '../../../factories/catalog';
import { ListingCover } from '../../components/catalog/ListingCover';
import { StatusBadge } from '../../components/catalog/StatusBadge';
import { EmptyState } from '../../components/feedback/EmptyState';
import { ErrorState } from '../../components/feedback/ErrorState';
import { LoadingState } from '../../components/feedback/LoadingState';
import { badgeColors, colors, metrics, radius, spacing, typography } from '../../theme/nativeTheme';

const labelColor: Record<Modality, string> = {
  sale: badgeColors.sale.text,
  trade: colors.text,
  donation: badgeColors.donation.text,
};

/** Detalhe do livro (Figma 04, 13 e 14): tudo o que é preciso para decidir antes de agir. */
export function ListingDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const vm = useListingDetail(String(id ?? ''));

  if (vm.status === 'loading') {
    return (
      <View style={styles.safe}>
        <LoadingState message="Carregando livro…" />
      </View>
    );
  }

  if (vm.status !== 'ready' || !vm.listing) {
    return (
      <SafeAreaView style={styles.safe} edges={['left', 'right', 'bottom']}>
        <View style={styles.content}>
          {vm.status === 'notFound' ? (
            <EmptyState
              title="Livro indisponível"
              message={vm.error ?? ''}
              actionLabel="Explorar outros livros"
              onAction={() => router.replace('/explorar')}
            />
          ) : (
            <ErrorState message={vm.error ?? ''} onRetry={vm.retry} />
          )}
        </View>
      </SafeAreaView>
    );
  }

  const listing = vm.listing;
  const headline = detailHeadline(listing);
  const location = locationLabel(listing);
  const owner = [listing.ownerFirstName, location].filter(Boolean).join(' · ');
  const notes = [
    listing.coverUrl ? null : 'Capa ilustrativa',
    publishedLabel(listing.createdAt),
  ].filter(Boolean);
  const about = listing.modality === 'trade' ? listing.tradeTerms : listing.description;

  return (
    <SafeAreaView style={styles.safe} edges={['left', 'right', 'bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.gallery}>
          <ListingCover listing={listing} variant="detail" />
        </View>
        <View style={styles.titleBlock}>
          <Text style={styles.title} accessibilityRole="header">
            {listing.title}
          </Text>
          <Text style={styles.author}>{listing.author}</Text>
        </View>
        <View
          style={styles.headline}
          accessible
          accessibilityLabel={`${headline.value}, ${headline.label.toLocaleLowerCase('pt-BR')}`}
        >
          <Text style={styles.value}>{headline.value}</Text>
          <Text style={[styles.label, { color: labelColor[listing.modality] }]}>
            {headline.label}
          </Text>
        </View>
        {listing.status === 'reservado' && (
          <View style={styles.reserved}>
            <StatusBadge variant="reserved" />
            <Text style={styles.reservedText}>
              Este livro está reservado para outra pessoa no momento.
            </Text>
          </View>
        )}
        <Text style={styles.meta}>{detailMeta(listing)}</Text>
        {about ? <Text style={styles.about}>{about}</Text> : null}
        {listing.modality === 'trade' && listing.description ? (
          <Text style={styles.about}>{listing.description}</Text>
        ) : null}
        {owner ? (
          <View style={styles.owner} accessible accessibilityLabel={`Anunciado por ${owner}`}>
            <Text style={styles.ownerText}>{owner}</Text>
          </View>
        ) : null}
        <Text style={styles.notes}>{notes.join(' · ')}</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface },
  content: {
    padding: metrics.pagePadding,
    paddingTop: spacing.sm,
    gap: spacing.sm,
    width: '100%',
    maxWidth: metrics.formMaxWidth,
    alignSelf: 'center',
  },
  gallery: {
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: radius.extraLarge,
    backgroundColor: colors.background,
  },
  titleBlock: { gap: spacing.xxs },
  title: { ...typography.titleLarge, color: colors.text },
  author: { ...typography.bodyLarge, fontWeight: '500', color: colors.text },
  headline: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flexWrap: 'wrap' },
  value: { ...typography.displayLarge, fontWeight: '500', color: colors.text },
  label: { ...typography.labelMedium },
  reserved: { gap: spacing.xxs },
  reservedText: { ...typography.bodyMedium, color: colors.text },
  meta: { ...typography.labelMedium, color: colors.secondaryText },
  about: { ...typography.bodyLarge, fontWeight: '500', color: colors.text },
  owner: {
    minHeight: metrics.touchTarget,
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
    borderRadius: metrics.fieldRadius,
    borderWidth: metrics.borderThin,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  ownerText: { ...typography.bodyMedium, fontWeight: '500', color: colors.secondaryText },
  notes: { ...typography.labelMedium, color: colors.secondaryText },
});

import { useLocalSearchParams, useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  conditionLabels,
  locationLabel,
  priceLabel,
  publishedLabel,
} from '../../../model/services/catalogFormat';
import { useListingDetail } from '../../../factories/catalog';
import { ListingCover } from '../../components/catalog/ListingCover';
import { StatusBadge } from '../../components/catalog/StatusBadge';
import { EmptyState } from '../../components/feedback/EmptyState';
import { ErrorState } from '../../components/feedback/ErrorState';
import { LoadingState } from '../../components/feedback/LoadingState';
import { colors, metrics, spacing, typography } from '../../theme/nativeTheme';

function Info({ label, value }: { label: string; value: string | null }) {
  if (!value) return null;
  return (
    <View style={styles.info} accessible accessibilityLabel={`${label}: ${value}`}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

/** Detalhe do livro: tudo o que é preciso para decidir antes de agir. */
export function ListingDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const vm = useListingDetail(String(id ?? ''));

  if (vm.status === 'loading') return <LoadingState message="Carregando livro…" />;

  if (vm.status !== 'ready' || !vm.listing) {
    return (
      <SafeAreaView style={styles.safe} edges={['left', 'right', 'bottom']}>
        <View style={styles.content}>
          {vm.status === 'notFound' ? (
            <EmptyState
              title="Livro indisponível"
              message={vm.error ?? ''}
              actionLabel="Ver outros livros"
              onAction={() => router.replace('/buscar')}
            />
          ) : (
            <ErrorState message={vm.error ?? ''} onRetry={vm.retry} />
          )}
        </View>
      </SafeAreaView>
    );
  }

  const listing = vm.listing;
  const price = priceLabel(listing);
  return (
    <SafeAreaView style={styles.safe} edges={['left', 'right', 'bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.hero}>
          <ListingCover uri={listing.coverUrl} title={listing.title} width={120} />
          <View style={styles.heroText}>
            <View style={styles.badges}>
              <StatusBadge variant={listing.modality} />
              {listing.status === 'reservado' && <StatusBadge variant="reserved" />}
            </View>
            <Text style={styles.title} accessibilityRole="header">
              {listing.title}
            </Text>
            <Text style={styles.author}>{listing.author}</Text>
            {price && <Text style={styles.price}>{price}</Text>}
          </View>
        </View>
        {listing.status === 'reservado' && (
          <Text style={styles.notice}>Este livro está reservado para outra pessoa no momento.</Text>
        )}
        <View style={styles.card}>
          <Info
            label="Condições da troca"
            value={listing.modality === 'trade' ? listing.tradeTerms : null}
          />
          <Info label="Estado do exemplar" value={conditionLabels[listing.condition]} />
          <Info label="Categoria" value={listing.category} />
          <Info label="Localização" value={locationLabel(listing)} />
          <Info label="Anunciado por" value={listing.ownerFirstName} />
        </View>
        {listing.description ? (
          <View style={styles.card}>
            <Text style={styles.section} accessibilityRole="header">
              Sobre o exemplar
            </Text>
            <Text style={styles.body}>{listing.description}</Text>
          </View>
        ) : null}
        <Text style={styles.caption}>{publishedLabel(listing.createdAt)}</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: {
    padding: metrics.pagePadding,
    gap: spacing.lg,
    width: '100%',
    maxWidth: metrics.formMaxWidth,
    alignSelf: 'center',
  },
  hero: { flexDirection: 'row', gap: spacing.md, flexWrap: 'wrap' },
  heroText: { flex: 1, minWidth: 160, gap: spacing.xs },
  badges: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xxs },
  title: { ...typography.title, color: colors.text },
  author: { ...typography.body, color: colors.secondaryText },
  price: { ...typography.section, color: colors.text },
  notice: { ...typography.body, color: colors.text },
  card: {
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: metrics.cardRadius,
    backgroundColor: colors.surface,
  },
  info: { gap: spacing.xxs },
  infoLabel: { ...typography.caption, color: colors.secondaryText },
  infoValue: { ...typography.body, color: colors.text },
  section: { ...typography.section, color: colors.text },
  body: { ...typography.body, color: colors.text },
  caption: { ...typography.caption, color: colors.secondaryText },
});
